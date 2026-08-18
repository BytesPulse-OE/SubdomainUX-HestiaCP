#!/bin/bash
# =============================================================================
# SubdomainUX-HestiaCP — Uninstaller
# https://github.com/BytesPulse-OE/SubdomainUX-HestiaCP
# =============================================================================

set -e

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
ok()   { echo -e "${GREEN}[ok]${NC}  $*"; }
warn() { echo -e "${YELLOW}[!]${NC}   $*"; }
fail() { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }

[ "$(id -u)" -eq 0 ] || fail "Run as root."

PLUGIN_DIR="/etc/hestiacp/bp-subdomain-ux"
HESTIA_WEB="/usr/local/hestia/web"
HOOK="/etc/hestiacp/hooks/post_install.sh"

echo ""
echo "======================================================"
echo "  SubdomainUX-HestiaCP uninstaller"
echo "======================================================"
echo ""

# Remove loader from custom_scripts
rm -f "${HESTIA_WEB}/js/custom_scripts/bp-subdomain-ux.js"
ok "Removed loader from custom_scripts"

# Remove assets
rm -rf "${HESTIA_WEB}/css/bp-subdomain-ux"
rm -rf "${HESTIA_WEB}/js/bp-subdomain-ux"
ok "Removed assets"

# Remove footer patch if it exists from old install
if [ -f "${HESTIA_WEB}/templates/footer.php" ] && grep -qF "bp-subdomain-ux" "${HESTIA_WEB}/templates/footer.php"; then
    python3 - "${HESTIA_WEB}/templates/footer.php" << 'PYEOF'
import sys, re
path = sys.argv[1]
with open(path) as f:
    content = f.read()
content = re.sub(r'\n<\?php if \(\$page === .list_web.\).*?<!-- bp-subdomain-ux -->\n', '\n', content, flags=re.DOTALL)
with open(path, 'w') as f:
    f.write(content)
PYEOF
    ok "Removed old footer patch"
fi

# Remove hook block
if [ -f "$HOOK" ] && grep -qF "bp-subdomain-ux post-install hook" "$HOOK"; then
    python3 - "$HOOK" << 'PYEOF'
import sys, re
path = sys.argv[1]
with open(path) as f:
    content = f.read()
content = re.sub(r'\n# bp-subdomain-ux post-install hook.*?(?=\n# |\Z)', '', content, flags=re.DOTALL)
with open(path, 'w') as f:
    f.write(content)
PYEOF
    ok "Removed hook"
fi

# Remove plugin directory
rm -rf "$PLUGIN_DIR"
ok "Removed: $PLUGIN_DIR"

echo ""
echo "======================================================"
ok "SubdomainUX-HestiaCP uninstalled successfully."
echo "======================================================"
echo ""
