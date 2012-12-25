/*
 * Copyright 2012 - Davide Alberani <da@erlug.linux.it>
 * Released under the terms of GNU GPL 3 or later.
 *
 * https://github.com/alberanid/chrome_eolo_extension
*/


// it's better to not use jQuery, in the background page.
document.addEventListener('DOMContentLoaded', set_alarms);
chrome.runtime.onInstalled.addListener(set_alarms);

