/*
 * Copyright 2012 - Davide Alberani <da@erlug.linux.it>
 * Released under the terms of GNU GPL 3 or later.
 *
 * https://github.com/alberanid/chrome_eolo_extension
*/

var REMOTE_URL = 'https://care.ngi.it/ws/ws.asp';
var REMOTE_QUERY_ARGS = {a: 'get.quota'};

var DEFAULT_LOW_DATA_PERCENT = 20;
var DEFAULT_LOW_VOICE_CREDIT = 5;

var TWENTYFOUR_HOURS = 24 * 60; // in minutes.

var FORCE_REMOTE = false;
var CHECK_INTERVAL = 10; // in minutes.
var TEN_MINUTES_MS = 1000 * 60 * CHECK_INTERVAL;

var _QUERY_RUNNING = false;

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
		timeout: 10000,
		success: function(data, textStatus, jqXHR) {
			_QUERY_RUNNING = false;
			if (data && data.response && data.response['status'] == 200) {
				localStorage['last_check'] = new Date().getTime();
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
	if (last_check && (now - last_check < TEN_MINUTES_MS) && last_data &&
			!(conf.force || FORCE_REMOTE)) {
		conf.successCb && conf.successCb();
		return;
	}
	fetch_data(conf.successCb, conf.errorCb);
}


/* Reset notification flags. */
function reset_flags(alarm) {
	localStorage['overQuotaNotified'] = false;
	localStorage['nearQuotaNotified'] = false;
	localStorage['noVoipCreditNotified'] = false;
	localStorage['littleVoipCreditNotified'] = false;
}


/* Initialize configuration. */
function init_conf() {
	localStorage['lowDataPercentQuota'] = localStorage['lowDataPercentQuota'] || DEFAULT_LOW_DATA_PERCENT;
	localStorage['lowVoiceCredit'] = localStorage['lowVoiceCredit'] || DEFAULT_LOW_VOICE_CREDIT;
}

