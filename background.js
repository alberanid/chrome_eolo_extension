/*
 * Copything 2012 - Davide Alberani <da@erlug.linux.it>
 * Released under the terms of GNU GPL 3 or later.
*/


DEFAULT_LOW_DATA_PERCENT = 20;
DEFAULT_LOW_VOICE_CREDIT = 5;

var FORCE_REMOTE = false;
var TEN_MINUTES_MS = 1000 * 60 * 10;

function fetch_data(successCb, errorCb) {
	$.ajax({
		url: 'https://care.ngi.it/ws/ws.asp',
		data: {a: 'get.quota'},
		dataType: 'json',
		timeout: 10000,
		success: function(data, textStatus, jqXHR) {
			if (data && data.response && data.response['status'] == 200) {
				localStorage['last_check'] = new Date().getTime();
				localStorage['last_data'] = JSON.stringify(data);
				successCb && successCb(data);
				//chrome.extension.sendMessage('dataReceived', data)
			} else {
				errorCb && errorCb('dataError',
					chrome.i18n.getMessage("wrongsData", [data && data.response && data.response['status']]));
			}
		},
		error: function(jqXHR, textStatus, errorThrown) {
			errorCb && errorCb('networkError', chrome.i18n.getMessage("connectionError", [textStatus, errorThrown]));
		}
	});
}


function run_check(conf) {
	if (!conf) {
		conf = {};
	}
	var last_check = localStorage['last_check'];
	var last_data = localStorage['last_data'];
	var now = new Date().getTime();
	if (last_check && (now - last_check < TEN_MINUTES_MS) && last_data &&
			!(conf.force || FORCE_REMOTE)) {
		conf.successCb && conf.successCb();
		return;
	}
	fetch_data(conf.successCb, conf.errorCb);
}


function show_notification(msg, msg_type) {
	if (localStorage[msg_type + 'Notified'] === 'true') {
		return;
	}
	localStorage[msg_type + 'Notified'] = true;
	var notification = webkitNotifications.createNotification(
			'images/icon48.png',
			chrome.i18n.getMessage('appName'),
			msg);
	notification.show();
}


function update_notifications(data) {
	resp = localStorage['last_data'];
	if (resp) {
		resp = JSON.parse(resp);
	} else {
		resp = data;
	}
	if (!(resp && resp.data && resp.voice)) { return; }
	var msg = null;
	var msg_type = null;
	var t_percent = (resp.data.used / resp.data.quota) * 100;
	var v_left = resp.voice.credit;
	if (t_percent === null) {
	}
	else if (t_percent >= 100) {
		show_notification(chrome.i18n.getMessage("overQuota"), 'overQuota');
	} else if (t_percent > (100 - localStorage['lowDataPercentQuota'])) {
		show_notification(chrome.i18n.getMessage("nearQuota"), 'nearQuota');
	}
	if (v_left === null) {
	} else if (v_left <= 0) {
		show_notification(chrome.i18n.getMessage("noVoipCredit"), 'noVoipCredit');
	} else if (v_left < localStorage['lowVoiceCredit']) {
		show_notification(chrome.i18n.getMessage("littleVoipCredit"), 'littleVoipCredit');
	}
}


function at_alarm(alarm) {
	if (alarm.name != 'eoloAlarm') { return; }
	run_check({successCb: update_notifications });
}


function reset_flags() {
	localStorage['overQuotaNotified'] = false;
	localStorage['nearQuotaNotified'] = false;
	localStorage['noVoipCreditNotified'] = false;
	localStorage['littleVoipCreditNotified'] = false;
	localStorage['lowDataPercentQuota'] = localStorage['lowDataPercentQuota'] || DEFAULT_LOW_DATA_PERCENT;
	localStorage['lowVoiceCredit'] = localStorage['lowVoiceCredit'] || DEFAULT_LOW_VOICE_CREDIT;
}


function at_boot(details) {
	reset_flags();
	chrome.alarms.create('eoloAlarm', {delayInMinutes: 0.1, periodInMinutes: 10});
	chrome.alarms.onAlarm.addListener(at_alarm);
}

document.addEventListener('DOMContentLoaded', at_boot);

