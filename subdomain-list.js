/*
 * SubdomainUX — subdomain-list.js
 * Visual grouping of subdomains on /list/web/
 * Loaded dynamically — runs immediately, no DOMContentLoaded needed.
 */
(function () {
    'use strict';

    var rows = Array.prototype.slice.call(
        document.querySelectorAll('.units-table-row.js-unit[data-sort-name]')
    );
    if (!rows.length) return;

    var domainSet = {};
    rows.forEach(function (r) { domainSet[r.dataset.sortName] = true; });

    var childMap = {};
    rows.forEach(function (row) {
        var domain = row.dataset.sortName;
        var parent = findParent(domain, domainSet);
        if (!parent) return;
        if (!childMap[parent]) childMap[parent] = [];
        childMap[parent].push(row);
    });

    if (!Object.keys(childMap).length) return;

    Object.keys(childMap).forEach(function (parentDomain) {
        var childRows = childMap[parentDomain];
        var parentRow = null;
        for (var i = 0; i < rows.length; i++) {
            if (rows[i].dataset.sortName === parentDomain) {
                parentRow = rows[i]; break;
            }
        }
        if (!parentRow) return;

        var nameCell = parentRow.querySelector('.units-table-heading-cell');
        if (!nameCell) return;

        // Toggle button
        var toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.className = 'sdux-toggle';
        toggle.setAttribute('aria-expanded', 'false');
        toggle.innerHTML =
            '<span class="sdux-arrow">&#9658;</span>' +
            '<span class="sdux-badge">' + childRows.length + '</span>';
        nameCell.appendChild(toggle);

        // Move child rows after parent, indent name cell
        var lastInserted = parentRow;
        childRows.forEach(function (childRow) {
            var domain    = childRow.dataset.sortName;
            var prefix    = domain.slice(0, domain.length - parentDomain.length - 1);
            var suspended = childRow.classList.contains('disabled');

            childRow.classList.add('sdux-child', 'sdux-child-hidden');

            var cn = childRow.querySelector('.units-table-heading-cell');
            if (cn) {
                cn.classList.add('sdux-child-name-cell');
                var link = cn.querySelector('a');
                if (link) {
                    link.innerHTML =
                        '<span class="sdux-tree">&#9492;&#9472;</span>' +
                        '<span class="sdux-prefix">' + esc(prefix) + '</span>' +
                        '<span class="sdux-parent-suffix">.' + esc(parentDomain) + '</span>';
                }
                var badge = document.createElement('span');
                badge.className = 'sdux-status-badge' + (suspended ? ' sdux-suspended' : '');
                badge.textContent = suspended ? 'Suspended' : 'Active';
                cn.appendChild(badge);
            }

            lastInserted.insertAdjacentElement('afterend', childRow);
            lastInserted = childRow;
        });

        // Toggle logic
        var open = false;
        toggle.addEventListener('click', function (e) {
            e.stopPropagation();
            open = !open;
            toggle.setAttribute('aria-expanded', String(open));
            toggle.classList.toggle('sdux-open', open);
            childRows.forEach(function (cr) {
                cr.classList.toggle('sdux-child-hidden', !open);
            });
        });
    });

    function findParent(domain, domainSet) {
        var parts = domain.split('.');
        for (var i = 1; i < parts.length - 1; i++) {
            var candidate = parts.slice(i).join('.');
            if (domainSet[candidate]) return candidate;
        }
        return null;
    }

    function esc(s) {
        return String(s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
}());
