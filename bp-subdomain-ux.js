/*
 * SubdomainUX for HestiaCP — by BytesPulse (https://bytespulse.gr)
 * AUTO-LOADED by HestiaCP via js/custom_scripts/ — update-safe
 * https://github.com/BytesPulse-OE/SubdomainUX-HestiaCP
 */
(function () {
    'use strict';

    var BASE = '/js/bp-subdomain-ux';
    var CSS  = '/css/bp-subdomain-ux';
    var path = window.location.pathname;

    function loadCSS(href) {
        var l = document.createElement('link');
        l.rel  = 'stylesheet';
        l.href = href;
        document.head.appendChild(l);
    }

    function loadJS(src) {
        var s = document.createElement('script');
        s.src = src;
        document.head.appendChild(s);
    }

    // Scripts loaded via custom_scripts run deferred — DOM is already ready.
    // Load sub-scripts immediately (no DOMContentLoaded needed).
    if (path.indexOf('/list/web') === 0) {
        loadCSS(CSS + '/subdomain-list.css');
        loadCSS(CSS + '/subdomain-add.css');
        loadJS(BASE + '/subdomain-list.js');
        loadJS(BASE + '/subdomain-add.js');
    }

    if (path.indexOf('/add/web') === 0) {
        loadCSS(CSS + '/subdomain-add.css');
        loadJS(BASE + '/subdomain-add.js');
    }

}());
