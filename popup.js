/*
 * Copything 2012 - Davide Alberani <da@erlug.linux.it>
 * Released under the terms of GNU GPL 3 or later.
*/

function add_info(text, level) {
	var field = document.getElementById(level || 'info');
	if (field.innerHTML) {
		field.innerHTML += '<br />';
	}
	field.innerHTML += text;
}

function update_fields(resp) {
	
	var traffic_left = document.getElementById('traffic_left');
	var traffic_left_percent = document.getElementById('traffic_left_percent');
	var traffic_total = document.getElementById('traffic_total');
	var info = document.getElementById('info');
	var warnings = document.getElementById('warnings');
	var errors = document.getElementById('errors');
	traffic_left.style.background = '#cbd9de';
	traffic_left_percent.style.background = '#cbd9de';
	traffic_total.style.background = '#cbd9de';
	if (resp.data) {
		var t_left = resp.data.used / 1024;
		var t_total = resp.data.quota / 1024;
		var t_percent = (resp.data.used / resp.data.quota) * 100;
		traffic_left.innerText = t_left.toFixed(2);
		traffic_left_percent.innerText = t_percent.toFixed(2);
		traffic_total.innerText = t_total.toFixed(2);
	} else {
		traffic_left.innerText = '-';
		traffic_left_percent.innerText = '-';
		traffic_total.innerText = '-';
	}
	var voice_left = document.getElementById('voice_left');
	voice_left.style.background = '#cbd9de';
	if (resp.voice) {
		var v_left = resp.voice.credit;
		voice_left.innerText = v_left.toFixed(2);
	} else {
		voice_left.innerText = '-';
	}

	// Show information, warnings and errors.
	var last_check = localStorage['last_check'];
	if (last_check) {
		var check_date = new Date();
		check_date.setTime(last_check);
		add_info('Last update: ' + check_date.toLocaleString(), 'info');
	}

	if (t_percent > 80) {
		if (t_percent >= 100) {
			add_info("You are over your daily traffic quota", 'warnings');
		} else {
			add_info("You are near your daily traffic quota", 'warnings');
		}
	}
	if (v_left < 5) {
		add_info("You don't have much VoIP credit left", 'warnings');
	}

}


function fetch_data() {
	var req = new XMLHttpRequest();
	req.open('GET', 'https://care.ngi.it/ws/ws.asp?a=get.quota', true);
	req.onreadystatechange = function() {
		if (req.readyState != 4) {
			return;
		}
		var resp = JSON.parse(req.responseText);
		if (resp && resp.response && resp.response['status'] == 200) {
			localStorage['last_data'] = req.responseText;
			update_fields(resp);
		} else {
			add_info("Unable to fetch data. Maybe you're not connected with NGI Eolo 10?", 'errors');
		}
	};
	req.send(null);
}


var force_remote = false;
var ten_minutes = 1000 * 60 * 10;

function run() {
	var last_check = localStorage['last_check'];
	var last_data = localStorage['last_data'];
	var now = new Date().getTime();
	if (last_check && (now - last_check < ten_minutes) && last_data && !force_remote) {
		update_fields(JSON.parse(last_data));
		return;
	}
	localStorage['last_check'] = now;
	fetch_data();
}

document.addEventListener('DOMContentLoaded', run);

