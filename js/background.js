/*
 * Copyright 2012 - Davide Alberani <da@erlug.linux.it>
 * Released under the terms of GNU GPL 3 or later.
 *
 * https://github.com/alberanid/chrome_eolo_extension
*/

/* Show a notification, if not already done. */
function show_notification(msg, msg_type) {
	if (localStorage[msg_type + 'Notified'] === 'true' || localStorage[msg_type + 'Notify'] === "false") {
		return;
	}
	localStorage[msg_type + 'Notified'] = "true";
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
	} else if (t_percent > localStorage['highDataPercentQuota']) {
		show_notification(chrome.i18n.getMessage("nearQuota"), 'nearQuota');
	}
	if (v_left === null) {
	} else if (v_left <= 0) {
		show_notification(chrome.i18n.getMessage("noVoipCredit"), 'noVoipCredit');
	} else if (v_left < localStorage['lowVoiceCredit']) {
		show_notification(chrome.i18n.getMessage("littleVoipCredit"), 'littleVoipCredit');
	}
}


/* Initialize the alarms. */
function set_alarms(details) {
	init_conf();
	chrome.alarms.clearAll();
	if (localStorage['backgroundCheck'] === "false") {
		return;
	}
	var checkInterval = localStorage['backgroundCheckInterval'] || DEFAULT_CHECK_INTERVAL;
	checkInterval = checkInterval - 0; // ensure it's an integer.
	chrome.alarms.create('eoloAlarm', {delayInMinutes: 5, periodInMinutes: checkInterval});
	var current_date = new Date();
	var midnight = new Date(current_date.getFullYear(), current_date.getMonth(), current_date.getDate()+1, 0, 0, 0);
	chrome.alarms.create('atMidnight', {when: midnight.getTime(), periodInMinutes: TWENTYFOUR_HOURS});
}



