/*
 * Copyright 2012 - Davide Alberani <da@erlug.linux.it>
 * Released under the terms of GNU GPL 3 or later.
 *
 * https://github.com/alberanid/chrome_eolo_extension
*/

var REMOTE_URL = 'https://care.ngi.it/ws/ws.asp';
var REMOTE_QUERY_ARGS = {a: 'get.quota'};

var DEFAULT_HIGH_DATA_PERCENT = 80;
var DEFAULT_LOW_VOICE_CREDIT = 5;
var DEFAULT_CHECK_INTERVAL = 10; // in minutes.

var TWENTYFOUR_HOURS = 24 * 60; // in minutes.

var FORCE_REMOTE = false;
var QUERY_TIMEOUT_MS = 10000;
var _QUERY_RUNNING = false;


/* Reset notification flags. */
function reset_flags() {
	localStorage['overQuotaNotified'] = "false";
	localStorage['nearQuotaNotified'] = "false";
	localStorage['noVoipCreditNotified'] = "false";
	localStorage['littleVoipCreditNotified'] = "false";
}


/* Fetch remote data and call the appropriate callback. */
function fetch_data(successCb, errorCb) {
	if (_QUERY_RUNNING) {
		return;
	}
	_QUERY_RUNNING = true;
	$.ajax({
		url: REMOTE_URL,
		data: REMOTE_QUERY_ARGS,
		dataType: 'json',
		timeout: QUERY_TIMEOUT_MS,
		success: function(data, textStatus, jqXHR) {
			_QUERY_RUNNING = false;
			if (data && data.response && data.response['status'] == 200) {
				var now = new Date();
				// Reset the notification flags if we're no longer in the same
				// day of the last notification.
				try {
					if (localStorage.last_check) {
						var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
						var sdate = new Date(parseInt(localStorage.last_check, 10));
						var storedDay = new Date(sdate.getFullYear(), sdate.getMonth(), sdate.getDate());
						if (today.getTime() !== storedDay.getTime()) {
							reset_flags();
						}
					}
				} catch(err) {
				}
				localStorage['last_check'] = now.getTime();
				localStorage['last_data'] = JSON.stringify(data);
				successCb && successCb(data);
			} else {
				errorCb && errorCb('dataError',
					chrome.i18n.getMessage("wrongsData", [data && data.response && data.response['status']]));
			}
		},
		error: function(jqXHR, textStatus, errorThrown) {
			_QUERY_RUNNING = false;
			errorCb && errorCb('networkError', chrome.i18n.getMessage("connectionError", [textStatus, errorThrown]));
		}
	});
}


/* Local or remote check.  If conf.force is true, a remote call is always done. */
function run_check(conf) {
	if (!conf) {
		conf = {};
	}
	var last_check = localStorage['last_check'];
	var last_data = localStorage['last_data'];
	var now = new Date().getTime();
	var checkInterval = localStorage['backgroundCheckInterval'] || DEFAULT_CHECK_INTERVAL;
	checkInterval = checkInterval * 1000 * 60;
	if (last_check && (now - last_check < checkInterval) && last_data &&
			!(conf.force || FORCE_REMOTE)) {
		conf.successCb && conf.successCb();
		return;
	}
	fetch_data(conf.successCb, conf.errorCb);
}



/* Initialize configuration. */
function init_conf() {
	localStorage['highDataPercentQuota'] = localStorage['highDataPercentQuota'] || DEFAULT_HIGH_DATA_PERCENT;
	localStorage['lowVoiceCredit'] = localStorage['lowVoiceCredit'] || DEFAULT_LOW_VOICE_CREDIT;
	localStorage['overQuotaNotify'] = localStorage['overQuotaNotify'] || "true";
	localStorage['nearQuotaNotify'] = localStorage['nearQuotaNotify'] || "true";
	localStorage['noVoipCreditNotify'] = localStorage['noVoipCreditNotify'] || "true";
	localStorage['littleVoipCreditNotify'] = localStorage['littleVoipCreditNotify'] || "true";
	localStorage['backgroundCheck'] = localStorage['backgroundCheck'] || "true";
	localStorage['backgroundCheckInterval'] = localStorage['backgroundCheckInterval'] || DEFAULT_CHECK_INTERVAL;
}

