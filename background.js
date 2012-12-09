


function at_alarm(alarm) {
	if (alarm.name != 'eoloAlarm') { return; }
	var notification = webkitNotifications.createNotification(
			'images/icon48.png',
			'Hello!',
			'Lorem ipsum...');
	notification.show();
	console.log('yeeeeeeeeeeeeeeeee');
}

function at_boot(details) {
	chrome.alarms.create('eoloAlarm', {delayInMinutes: 0.1, periodInMinutes: .2});
	chrome.alarms.onAlarm.addListener(at_alarm);
}

at_boot();

