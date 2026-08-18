/*
 * SubdomainUX — subdomain-add.js
 * Loaded dynamically — runs immediately, no DOMContentLoaded needed.
 *
 * On /add/web/  : domain validation
 * On /list/web/ : Add Subdomain button + modal
 */
(function () {
    'use strict';

    var path = window.location.pathname;

    if (path.indexOf('/add/web') === 0)  { initValidation(); }
    if (path.indexOf('/list/web') === 0) { initSubdomainButton(); }

    /* ============================================================
       Helpers
    ============================================================ */
    function getToken() {
        var el = document.getElementById('token');
        return el ? (el.getAttribute('token') || '') : '';
    }

    function getDomainsFromPage() {
        var rows = Array.prototype.slice.call(
            document.querySelectorAll('.units-table-row.js-unit[data-sort-name]')
        );
        var allNames = {};
        rows.forEach(function (r) { allNames[r.dataset.sortName] = true; });

        var parents = [];
        rows.forEach(function (r) {
            var name  = r.dataset.sortName;
            var parts = name.split('.');
            var isChild = false;
            for (var i = 1; i < parts.length - 1; i++) {
                if (allNames[parts.slice(i).join('.')]) { isChild = true; break; }
            }
            if (!isChild) parents.push(name);
        });
        return parents.sort();
    }

    function isValidLabel(label) {
        return /^[a-z0-9]([a-z0-9\-]*[a-z0-9])?$|^[a-z0-9]$/.test(label);
    }

    function isValidDomain(val) {
        val = val.toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');
        if (val.indexOf('.') === -1) return false;
        var labels = val.split('.');
        if (!labels.every(isValidLabel)) return false;
        if (labels[labels.length - 1].length < 2) return false;
        return true;
    }

    function esc(s) {
        return String(s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    /* ============================================================
       1. /add/web/ — validation
    ============================================================ */
    function initValidation() {
        var input = document.getElementById('v_domain');
        if (!input) return;

        var hint = document.createElement('p');
        hint.className = 'sdux-error';
        input.insertAdjacentElement('afterend', hint);

        function showErr(msg) {
            hint.textContent = msg;
            input.classList.add('sdux-input-error');
        }
        function clearErr() {
            hint.textContent = '';
            input.classList.remove('sdux-input-error');
        }

        input.addEventListener('input', clearErr);

        document.addEventListener('submit', function (e) {
            if (e.target.id !== 'main-form') return;
            clearErr();
            var val = input.value.trim();
            if (!isValidDomain(val)) {
                e.preventDefault();
                e.stopImmediatePropagation();
                showErr('Please enter a valid domain (e.g. example.com or shop.example.com).');
                input.focus();
            }
        }, true);
    }

    /* ============================================================
       2. /list/web/ — Add Subdomain button + modal
    ============================================================ */
    function initSubdomainButton() {
        var addBtn = document.querySelector('a.js-button-create[href="/add/web/"]');
        if (!addBtn) return;

        var domains = getDomainsFromPage();

        var btn = document.createElement('a');
        btn.href = '#';
        btn.className = 'button button-secondary sdux-btn-sub';
        btn.innerHTML = '<i class="fas fa-circle-plus icon-green"></i>Add Subdomain';
        addBtn.insertAdjacentElement('afterend', btn);

        if (!domains.length) {
            btn.classList.add('disabled');
            btn.title = 'No domains available';
            return;
        }

        var modal = buildModal(domains);
        document.body.appendChild(modal);

        btn.addEventListener('click', function (e) {
            e.preventDefault();
            showModal(modal);
        });
    }

    function buildModal(domains) {
        var token = getToken();
        var overlay = document.createElement('div');
        overlay.className = 'sdux-overlay';

        overlay.innerHTML =
            '<div class="sdux-modal" role="dialog" aria-modal="true">' +
                '<div class="sdux-modal-head">' +
                    '<h2><i class="fas fa-circle-plus"></i> Add Subdomain</h2>' +
                    '<button type="button" class="sdux-close" aria-label="Close"><i class="fas fa-xmark"></i></button>' +
                '</div>' +
                '<div class="sdux-modal-body">' +
                    '<form id="sdux-form" method="post" action="/add/web/">' +
                        '<input type="hidden" name="token" value="' + esc(token) + '">' +
                        '<input type="hidden" name="ok" value="Add">' +
                        '<input type="hidden" name="v_domain" id="sdux-fqdn">' +
                        '<div class="u-mb20">' +
                            '<label class="form-label">Subdomain</label>' +
                            '<div class="sdux-split">' +
                                '<input type="text" class="form-control" id="sdux-prefix" placeholder="e.g. shop" autocomplete="off">' +
                                '<span class="sdux-dot">.</span>' +
                                '<select class="form-select" id="sdux-parent">' +
                                    domains.map(function (d) {
                                        return '<option value="' + esc(d) + '">' + esc(d) + '</option>';
                                    }).join('') +
                                '</select>' +
                            '</div>' +
                            '<p class="sdux-preview" id="sdux-preview"></p>' +
                            '<p class="sdux-error" id="sdux-modal-err"></p>' +
                        '</div>' +
                        '<div class="u-mb20">' +
                            '<label class="form-label">IP Address</label>' +
                            '<select class="form-select" name="v_ip" id="sdux-ip"><option>Loading...</option></select>' +
                        '</div>' +
                        '<div id="sdux-extra-opts"></div>' +
                        '<div class="sdux-modal-foot">' +
                            '<button type="button" class="button button-secondary sdux-cancel">Cancel</button>' +
                            '<button type="submit" class="button"><i class="fas fa-floppy-disk icon-purple"></i>Save</button>' +
                        '</div>' +
                    '</form>' +
                '</div>' +
            '</div>';

        // Fetch IP + DNS/Mail options from /add/web/
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/add/web/', true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState !== 4 || xhr.status !== 200) return;
            var parser = new DOMParser();
            var doc    = parser.parseFromString(xhr.responseText, 'text/html');
            var ipSel  = doc.querySelector('select#v_ip');
            var ipEl   = overlay.querySelector('#sdux-ip');
            if (ipSel && ipEl) ipEl.innerHTML = ipSel.innerHTML;

            var extra = '';
            if (doc.querySelector('input#v_dns')) {
                extra += '<div class="form-check u-mb10"><input class="form-check-input" type="checkbox" name="v_dns" id="sdux-v-dns"><label for="sdux-v-dns">DNS Support</label></div>';
            }
            if (doc.querySelector('input#v_mail')) {
                extra += '<div class="form-check u-mb20"><input class="form-check-input" type="checkbox" name="v_mail" id="sdux-v-mail"><label for="sdux-v-mail">Mail Support</label></div>';
            }
            var extraEl = overlay.querySelector('#sdux-extra-opts');
            if (extraEl) extraEl.innerHTML = extra;
        };
        xhr.send();

        var prefixEl  = overlay.querySelector('#sdux-prefix');
        var parentEl  = overlay.querySelector('#sdux-parent');
        var previewEl = overlay.querySelector('#sdux-preview');
        var fqdnEl    = overlay.querySelector('#sdux-fqdn');
        var errEl     = overlay.querySelector('#sdux-modal-err');

        prefixEl.addEventListener('input', function () {
            errEl.textContent = '';
            prefixEl.classList.remove('sdux-input-error');
            var p = prefixEl.value.trim();
            previewEl.innerHTML = p
                ? 'Will create: <strong class="sdux-fqdn-preview">' + esc(p) + '.' + esc(parentEl.value) + '</strong>'
                : '';
        });
        parentEl.addEventListener('change', function () {
            var p = prefixEl.value.trim();
            if (p) previewEl.innerHTML = 'Will create: <strong class="sdux-fqdn-preview">' + esc(p) + '.' + esc(parentEl.value) + '</strong>';
        });

        overlay.querySelector('#sdux-form').addEventListener('submit', function (e) {
            var prefix = prefixEl.value.trim().toLowerCase();
            if (!isValidLabel(prefix)) {
                e.preventDefault();
                errEl.textContent = 'Enter a valid label (letters, numbers, hyphens only).';
                prefixEl.classList.add('sdux-input-error');
                prefixEl.focus();
                return;
            }
            fqdnEl.value = prefix + '.' + parentEl.value;
        });

        function close() {
            overlay.classList.remove('sdux-visible');
            document.body.style.overflow = '';
            overlay.querySelector('#sdux-form').reset();
            previewEl.innerHTML = '';
            errEl.textContent = '';
            prefixEl.classList.remove('sdux-input-error');
        }
        overlay.querySelector('.sdux-close').addEventListener('click', close);
        overlay.querySelector('.sdux-cancel').addEventListener('click', close);
        overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && overlay.classList.contains('sdux-visible')) close();
        });

        return overlay;
    }

    function showModal(overlay) {
        overlay.classList.add('sdux-visible');
        document.body.style.overflow = 'hidden';
        setTimeout(function () {
            var p = overlay.querySelector('#sdux-prefix');
            if (p) p.focus();
        }, 60);
    }

}());
