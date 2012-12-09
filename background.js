/*
 * Copyright 2012 - Davide Alberani <da@erlug.linux.it>
 * Released under the terms of GNU GPL 3 or later.
 *
 * https://github.com/alberanid/chrome_eolo_extension
*/

/* Show a notification, if not already done. */
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


/* Check if we have to issue a notification. */
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


/* Things to run every CHECK_INTERVAL minutes. */
function at_alarm(alarm) {
	if (alarm.name != 'eoloAlarm') { return; }
	run_check({successCb: update_notifications});
	return true;
}


/* Initialize the alarms. */
function at_boot(details) {
	init_conf();
	chrome.alarms.create('eoloAlarm', {delayInMinutes: 5, periodInMinutes: CHECK_INTERVAL});
	chrome.alarms.onAlarm.addListener(at_alarm);
	var current_date = new Date();
	var midnight = new Date(current_date.getFullYear(), current_date.getMonth(), current_date.getDate()+1, 0, 0, 0);
	chrome.alarms.create('atMidnight', {when: midnight.getTime(), periodInMinutes: TWENTYFOUR_HOURS});
	chrome.alarms.onAlarm.addListener(reset_flags);
}


document.addEventListener('DOMContentLoaded', at_boot);
chrome.runtime.onInstalled.addListener(at_boot);

