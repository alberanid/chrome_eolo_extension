/*
 * Copything 2012 - Davide Alberani <da@erlug.linux.it>
 * Released under the terms of GNU GPL 3 or later.
*/

var force_remote = false;
var ten_minutes = 1000 * 60 * 10;
var _spaces = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';


function add_info(text, level) {
	var field = $('#' + (level || 'info'));
	if (field.html()) {
		field.append('<br />');
	}
	field.append(text);
}


function clear_info() {
	$('#info').html("");
	$('#warnings').html("");
	$('#errors').html("");
}


function show_spinners() {
	$('.ajax_info').html(_spaces);
	$('.ajax_info').css({'background-image': 'url(images/loading.gif)'});
}


function update_fields() {
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
		resp = {};
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


function update_messages(t_percent, v_left, success) {
	// Show information, warnings and errors.
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
	} else if (t_percent > 80) {
		add_info(chrome.i18n.getMessage("nearQuota"), 'warnings');
	}
	if (v_left === null) {
	} else if (v_left <= 0) {
		add_info(chrome.i18n.getMessage("noVoipCredit"), "warnings");
	} else if (v_left < 5) {
		add_info(chrome.i18n.getMessage("littleVoipCredit"), 'warnings');
	}
}


function fetch_data(cb) {
	$.ajax({
		url: 'https://care.ngi.it/ws/ws.asp',
		data: {a: 'get.quota'},
		dataType: 'json',
		timeout: 10000,
		success: function(data, textStatus, jqXHR) {
			if (data && data.response && data.response['status'] == 200) {
				localStorage['last_check'] = new Date().getTime();
				localStorage['last_data'] = JSON.stringify(data);
				alert(cb);
				cb && cb();
			} else {
				cb && cb();
				add_info(chrome.i18n.getMessage("wrongsData", [data && data.response && data.response['status']]), 'errors');
			}
		},
		error: function(jqXHR, textStatus, errorThrown) {
			cb && cb();
			add_info(chrome.i18n.getMessage("connectionError", [textStatus, errorThrown]), 'errors');
		}
	});
}


function run_check(cb, force) {
	var last_check = localStorage['last_check'];
	var last_data = localStorage['last_data'];
	var now = new Date().getTime();
	if (last_check && (now - last_check < ten_minutes) && last_data &&
			!(force || force_remote)) {
		cb && cb();
		return;
	}
	fetch_data(cb);
}


function open_popup() {
	localizePage();
	$('#refresh').click(function() { run_check(update_fields, true); });
	show_spinners();
	run_check(update_fields);
}


$(document).ready(open_popup);

