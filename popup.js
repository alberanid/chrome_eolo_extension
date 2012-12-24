/*
 * Copyright 2012 - Davide Alberani <da@erlug.linux.it>
 * Released under the terms of GNU GPL 3 or later.
 *
 * https://github.com/alberanid/chrome_eolo_extension
*/


var _spaces = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';


/* Add and information row to one of info/warnings/errors divs. */
function add_info(text, level) {
	var field = $('#' + (level || 'info'));
	if (field.html()) {
		field.append('<br />');
	}
	field.append(text);
}


/* Reset the content of all the info/warnings/errors divs. */
function clear_info() {
	$('#info').html("");
	$('#warnings').html("");
	$('#errors').html("");
}


/* Replace information with a spinner. */
function show_spinners() {
	$('.ajax_info').html(_spaces);
	$('.ajax_info').css({'background-image': 'url(images/loading.gif)'});
}


/* Show collected data. */
function update_fields(data) {
	$('.ajax_info').css({'background-image': 'none'});
	var traffic_left = $('#traffic_left');
	var traffic_left_percent = $('#traffic_left_percent');
	var traffic_total = $('#traffic_total');
	var voice_left = $('#voice_left');
	var success = true;
	var t_percent = null;
	var v_left = null;
	var resp = localStorage['last_data'];
	if (resp) {
		resp = JSON.parse(resp);
	} else {
		resp = data;
	}
	if (resp.data) {
		var t_left = resp.data.used / 1024;
		var t_total = resp.data.quota / 1024;
		t_percent = (resp.data.used / resp.data.quota) * 100;
		traffic_left.text(t_left.toFixed(2));
		traffic_left_percent.text(t_percent.toFixed(2));
		traffic_total.text(t_total.toFixed(2));
	} else {
		traffic_left.text('-');
		traffic_left_percent.text('-');
		traffic_total.text('-');
		success = false;
	}
	if (resp.voice) {
		v_left = resp.voice.credit;
		voice_left.text(v_left.toFixed(2));
	} else {
		voice_left.text('-');
		success = false;
	}
	update_messages(t_percent, v_left, success);
	return success;
}


/* Show needed messages. */
function update_messages(t_percent, v_left, success) {
	clear_info();
	var last_check = localStorage['last_check'];
	if (last_check) {
		var check_date = new Date();
		check_date.setTime(last_check);
		add_info(chrome.i18n.getMessage('lastUpdate') + ': ' + check_date.toLocaleString(), 'info');
	}
	if (t_percent === null) {
	}
	else if (t_percent >= 100) {
		add_info(chrome.i18n.getMessage("overQuota"), 'warnings');
	} else if (t_percent > (100 - localStorage['lowDataPercentQuota'])) {
		add_info(chrome.i18n.getMessage("nearQuota"), 'warnings');
	}
	if (v_left === null) {
	} else if (v_left <= 0) {
		add_info(chrome.i18n.getMessage("noVoipCredit"), "warnings");
	} else if (v_left < localStorage['lowVoiceCredit']) {
		add_info(chrome.i18n.getMessage("littleVoipCredit"), 'warnings');
	}
}


/* Things to do when the popup is shown. */
function open_popup() {
	localizePage();
	var _errorCb = function(error, msg) { add_info(msg, 'errors'); };
	$('#refresh').click(function() {
		show_spinners();
		run_check({successCb: update_fields, errorCb: _errorCb, force: true});
	});
	show_spinners();
	run_check({successCb: update_fields, errorCb: _errorCb});
}


$(document).ready(open_popup);

