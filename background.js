/*
 * Copyright 2012 - Davide Alberani <da@erlug.linux.it>
 * Released under the terms of GNU GPL 3 or later.
 *
 * https://github.com/alberanid/chrome_eolo_extension
*/

/* Things to run at each interval. */
function at_alarm(alarm) {
	if (alarm.name != 'eoloAlarm') { return; }
	run_check({successCb: update_notifications});
	return true;
}


/* Initialize event linsteners. */
function set_listeners() {
	set_alarms();
	reset_flags();
	chrome.alarms.onAlarm.addListener(at_alarm);
}


// it's better to not use jQuery, in the background page.
document.addEventListener('DOMContentLoaded', set_listeners);
chrome.runtime.onInstalled.addListener(set_listeners);

