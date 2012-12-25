/*
 * Copyright 2012 - Davide Alberani <da@erlug.linux.it>
 * Released under the terms of GNU GPL 3 or later.
 *
 * https://github.com/alberanid/chrome_eolo_extension
*/

/* Load settings and show the options. */
function load_settings() {
	var nt = $('#notify-traffic');
	nt.attr('checked', localStorage['nearQuotaNotify'] !== "false");
	toggle_options(nt);
	var nnt = $('#notify-no-traffic');
	nnt.attr('checked', localStorage['overQuotaNotify'] !== "false");
	toggle_options(nnt);
	var nv = $('#notify-voip');
	nv.attr('checked', localStorage['littleVoipCreditNotify'] !== "false");
	toggle_options(nv);
	var nnv = $('#notify-no-voip');
	nnv.attr('checked', localStorage['noVoipCreditNotify'] !== "false");
	toggle_options(nnv);
	var bc = $('#background-check');
	bc.attr('checked', localStorage['backgroundCheck'] !== "false");
	toggle_options(bc);
	var lowVoiceCredit = localStorage['lowVoiceCredit'] || DEFAULT_LOW_VOICE_CREDIT;
	if (lowVoiceCredit) {
		$("#voip-quota").val(lowVoiceCredit);
	}
	var highDataPercentQuota = localStorage['highDataPercentQuota'] || DEFAULT_HIGH_DATA_PERCENT;
	if (highDataPercentQuota) {
		$("#traffic-quota").val(highDataPercentQuota);
	}
	var backgroundCheckInterval = localStorage['backgroundCheckInterval'] || DEFAULT_CHECK_INTERVAL;
	if (backgroundCheckInterval) {
		$("#check-freq").val(backgroundCheckInterval);
	}
}


/* React to a setting change. */
function save_settings() {
	var lowVoiceCredit = $("#voip-quota").val();
	if (lowVoiceCredit == (lowVoiceCredit - 0) && lowVoiceCredit > 0) {
		if (lowVoiceCredit > localStorage['lowVoiceCredit']) {
			localStorage['littleVoipCreditNotified'] = 'false';
		}
		localStorage['lowVoiceCredit'] = lowVoiceCredit;
	}
	var lowTraffic = $("#traffic-quota").val();
	if (lowTraffic == (lowTraffic - 0) && lowTraffic >= 5 && lowTraffic <= 95) {
		if (lowTraffic > localStorage['highDataPercentQuota']) {
			localStorage['nearQuotaNotified'] = 'false';
		}
		localStorage['highDataPercentQuota'] = lowTraffic;
	}
	var checkFreq = $("#check-freq").val();
	if (checkFreq == (checkFreq - 0) && checkFreq >= 10) {
		localStorage['backgroundCheckInterval'] = checkFreq;
	}
	localStorage['nearQuotaNotify'] = $('#notify-traffic').attr('checked') ? "true" : "false";
	localStorage['overQuotaNotify'] = $('#notify-no-traffic').attr('checked') ? "true" : "false";
	localStorage['littleVoipCreditNotify'] = $('#notify-voip').attr('checked') ? "true" : "false";
	localStorage['noVoipCreditNotify'] = $('#notify-no-voip').attr('checked') ? "true" : "false";
	localStorage['backgroundCheck'] = $('#background-check').attr('checked') ? "true" : "false";
	set_alarms();
}


/* An option was completely turned off/on. */
function toggle_options(obj) {
	var checkBox = checkBox = $(obj);
	var id_ = checkBox[0].id;
	var checked = checkBox.attr('checked');
	if (checked) {
		$(".setting." + id_).removeClass("disabledelem");
	} else {
		$(".setting." + id_).addClass("disabledelem");
	}
	if (id_ == "notify-traffic") {
		$("select#traffic-quota").attr('disabled', checked ? false : "disabled");
	}
	if (id_ == "notify-voip") {
		$("input#voip-quota").attr('disabled', checked ? false : "disabled");
	}
	if (id_ == "background-check") {
		$("input#check-freq").attr('disabled', checked ? false : "disabled");
	}
}


/* Init. */
function show_options() {
	$(".conf").change(save_settings);
	$("input[type=checkbox]").change(function() { toggle_options(this); });
	localizePage();
	load_settings();
}


$(document).ready(show_options);

