# SubdomainUX-HestiaCP

🇬🇧 [English](#english) | 🇬🇷 [Ελληνικά](#ελληνικά)

---

## 🇬🇧 English

Subdomain visual grouping and improved add-domain UX for the **HestiaCP** control panel.

Subdomains are automatically detected and collapsed under their parent domain in the Web list.
When adding a new domain, a split input lets you type just the label and pick the parent from a dropdown — no more accidentally creating `test` instead of `test.example.com`.

Zero dependencies. Vanilla JS. Survives every HestiaCP update automatically via the built-in hooks system.

---

### How it works

The plugin adds two independent enhancements:

**1. Visual grouping on `/list/web/`**

Reads all domain rows client-side, detects which ones are subdomains of other domains in the same list, and renders them as a collapsible tree under their parent:

```
bytespulse.cloud  [▶ 1]
  └── test.bytespulse.cloud   Active   ✏ ⏸ 🗑
```

No backend changes. The original rows are hidden and replaced with the grouped view.

**2. Improved subdomain creation on `/add/web/`**

Adds a parent-domain selector next to the domain input, populated from existing domains via the HestiaCP API:

```
[ test ] . [ bytespulse.cloud ▾ ]
Will create: test.bytespulse.cloud
```

- Auto-detects the parent if the user types a full FQDN (e.g. `test.bytespulse.cloud` → splits automatically)
- Rewrites the input to the full FQDN on form submit
- Falls back gracefully to the standard input if the API call fails

---

### Repository contents

| File | Purpose |
|---|---|
| `subdomain-list.js` | DOM grouping logic for `/list/web/` |
| `subdomain-list.css` | Styles for the grouped list view |
| `subdomain-add.js` | Split input logic for `/add/web/` |
| `subdomain-add.css` | Styles for the split input |
| `install.sh` | One-line installer |
| `uninstall.sh` | One-line uninstaller |

---

### Requirements

- Linux server running **HestiaCP 1.9.x** or later
- `root` access (installer only)

---

### Installation

```bash
curl -sL https://raw.githubusercontent.com/BytesPulse-OE/SubdomainUX-HestiaCP/main/install.sh | sudo bash
```

Then open HestiaCP → **Web** — subdomains will appear grouped under their parent domain.

---

### Uninstallation

```bash
curl -sL https://raw.githubusercontent.com/BytesPulse-OE/SubdomainUX-HestiaCP/main/uninstall.sh | sudo bash
```

---

### Update

Re-run the install command — idempotent, safe to run multiple times.

---

### What the installer does

1. Creates `/etc/hestiacp/bp-subdomain-ux/` — stores all plugin files in a directory that HestiaCP never touches during upgrades
2. Deploys CSS to `/usr/local/hestia/web/css/bp-subdomain-ux/` and JS to `/usr/local/hestia/web/js/bp-subdomain-ux/`
3. Adds a PHP block to `footer.php` that conditionally loads CSS/JS only on `list_web` and `add_web` pages — marked with `<!-- bp-subdomain-ux -->` for idempotent re-patching
4. Installs or appends to `/etc/hestiacp/hooks/post_install.sh` — runs automatically after every `apt upgrade hestia` to re-deploy assets and re-patch templates

---

### File layout after installation

```
/etc/hestiacp/bp-subdomain-ux/          ← never touched by HestiaCP upgrades
    subdomain-list.js
    subdomain-list.css
    subdomain-add.js
    subdomain-add.css

/usr/local/hestia/web/
    css/bp-subdomain-ux/                 ← preserved by HestiaCP
        subdomain-list.css
        subdomain-add.css
    js/bp-subdomain-ux/                  ← preserved by HestiaCP
        subdomain-list.js
        subdomain-add.js
    templates/pages/
        list_web.php                     ← patched (2 lines, idempotent)
        add_web.php                      ← patched (2 lines, idempotent)

/etc/hestiacp/hooks/
    post_install.sh                      ← runs after every apt upgrade hestia
```

---

### Upgrade behaviour

| Component | What happens on `apt upgrade hestia` | Result |
|---|---|---|
| `list_web.php` / `add_web.php` | Replaced by the .deb package | Hook re-patches automatically |
| `/etc/hestiacp/bp-subdomain-ux/*` | **Never touched** | All source files remain intact |
| `css/bp-subdomain-ux/` | **Never touched** | Assets remain deployed |
| `js/bp-subdomain-ux/` | **Never touched** | Assets remain deployed |

---

### Notes

- Subdomain detection is purely client-side: a domain is considered a subdomain if its parent (one level up) also exists in the current user's domain list.
- The split input on `/add/web/` calls `/api/` with `v-list-web-domains`. If the API call fails for any reason (permissions, network, etc.), the UI falls back silently to the standard single input field — no errors shown to the user.
- The patches to `list_web.php` and `add_web.php` are idempotent — running the installer multiple times will not produce duplicate entries.
- Compatible with HestiaCP's Alpine.js v1.x — no async/await, no arrow functions, pure vanilla JS.

---

### License

MIT

---

### Credits

Developed by **[BytesPulse](https://bytespulse.gr)** — Web Hosting & Domain Registrar, Chalkida, Greece.

---

---

## 🇬🇷 Ελληνικά

Οπτική ομαδοποίηση subdomains και βελτιωμένο UX δημιουργίας domain για το **HestiaCP** control panel.

Τα subdomains εντοπίζονται αυτόματα και εμφανίζονται συμπτυγμένα κάτω από το parent domain στη λίστα Web. Κατά τη δημιουργία νέου domain, ένα split input σας επιτρέπει να πληκτρολογήσετε μόνο το label και να επιλέξετε το parent από dropdown — δεν δημιουργείται πια `test` αντί για `test.example.com`.

Χωρίς εξαρτήσεις. Vanilla JS. Επιβιώνει αυτόματα από κάθε ενημέρωση HestiaCP μέσω του ενσωματωμένου συστήματος hooks.

---

### Πώς λειτουργεί

Το plugin προσθέτει δύο ανεξάρτητες βελτιώσεις:

**1. Οπτική ομαδοποίηση στο `/list/web/`**

Διαβάζει όλες τις γραμμές domain client-side, εντοπίζει ποιες είναι subdomains άλλων domains στην ίδια λίστα, και τις εμφανίζει ως αναδιπλούμενο δέντρο κάτω από το parent:

```
bytespulse.cloud  [▶ 1]
  └── test.bytespulse.cloud   Active   ✏ ⏸ 🗑
```

**2. Βελτιωμένη δημιουργία subdomain στο `/add/web/`**

Προσθέτει dropdown επιλογής parent domain δίπλα στο πεδίο domain:

```
[ test ] . [ bytespulse.cloud ▾ ]
Will create: test.bytespulse.cloud
```

---

### Περιεχόμενα αποθετηρίου

| Αρχείο | Σκοπός |
|---|---|
| `subdomain-list.js` | Λογική ομαδοποίησης DOM για το `/list/web/` |
| `subdomain-list.css` | Στυλ για την ομαδοποιημένη προβολή λίστας |
| `subdomain-add.js` | Λογική split input για το `/add/web/` |
| `subdomain-add.css` | Στυλ για το split input |
| `install.sh` | One-line installer |
| `uninstall.sh` | One-line uninstaller |

---

### Απαιτήσεις

- Linux server με **HestiaCP 1.9.x** ή νεότερο
- Πρόσβαση `root` (μόνο για τον installer)

---

### Εγκατάσταση

```bash
curl -sL https://raw.githubusercontent.com/BytesPulse-OE/SubdomainUX-HestiaCP/main/install.sh | sudo bash
```

---

### Απεγκατάσταση

```bash
curl -sL https://raw.githubusercontent.com/BytesPulse-OE/SubdomainUX-HestiaCP/main/uninstall.sh | sudo bash
```

---

### Τι κάνει ο installer

1. Δημιουργεί τον φάκελο `/etc/hestiacp/bp-subdomain-ux/` — εκτός εμβέλειας αναβαθμίσεων HestiaCP
2. Αναπτύσσει CSS και JS στους αντίστοιχους φακέλους του HestiaCP web
3. Προσθέτει δύο γραμμές στα `list_web.php` και `add_web.php` (idempotent)
4. Εγκαθιστά ή προσαρτά στο `/etc/hestiacp/hooks/post_install.sh` — εκτελείται αυτόματα μετά από κάθε `apt upgrade hestia`

---

### Άδεια χρήσης

MIT

---

### Credits

Αναπτύχθηκε από την **[BytesPulse](https://bytespulse.gr)** — Web Hosting & Domain Registrar, Χαλκίδα, Ελλάδα.
