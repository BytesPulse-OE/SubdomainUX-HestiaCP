#!/bin/bash
# =============================================================================
# SubdomainUX-HestiaCP — Installer
# https://github.com/BytesPulse-OE/SubdomainUX-HestiaCP
# =============================================================================

set -e

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
ok()   { echo -e "${GREEN}[ok]${NC}  $*"; }
warn() { echo -e "${YELLOW}[!]${NC}   $*"; }
fail() { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }

[ "$(id -u)" -eq 0 ] || fail "Run as root."
[ -d /usr/local/hestia ] || fail "HestiaCP not found at /usr/local/hestia."

BASE_URL="https://raw.githubusercontent.com/BytesPulse-OE/SubdomainUX-HestiaCP/main"
PLUGIN_DIR="/etc/hestiacp/bp-subdomain-ux"
HESTIA_WEB="/usr/local/hestia/web"
CUSTOM_JS="${HESTIA_WEB}/js/custom_scripts"
HOOK="/etc/hestiacp/hooks/post_install.sh"

echo ""
echo "======================================================"
echo "  SubdomainUX-HestiaCP installer"
echo "======================================================"
echo ""

# --- 1. Create plugin directory ---
mkdir -p "$PLUGIN_DIR"
ok "Plugin directory: $PLUGIN_DIR"

# --- 2. Download all source files ---
for f in bp-subdomain-ux.js subdomain-list.js subdomain-list.css subdomain-add.js subdomain-add.css; do
    curl -fsSL "${BASE_URL}/${f}" -o "${PLUGIN_DIR}/${f}"
    ok "Downloaded: ${f}"
done

# --- 3. Deploy assets ---
mkdir -p "${HESTIA_WEB}/css/bp-subdomain-ux"
mkdir -p "${HESTIA_WEB}/js/bp-subdomain-ux"
mkdir -p "${CUSTOM_JS}"

cp "${PLUGIN_DIR}/subdomain-list.css"   "${HESTIA_WEB}/css/bp-subdomain-ux/subdomain-list.css"
cp "${PLUGIN_DIR}/subdomain-add.css"    "${HESTIA_WEB}/css/bp-subdomain-ux/subdomain-add.css"
cp "${PLUGIN_DIR}/subdomain-list.js"    "${HESTIA_WEB}/js/bp-subdomain-ux/subdomain-list.js"
cp "${PLUGIN_DIR}/subdomain-add.js"     "${HESTIA_WEB}/js/bp-subdomain-ux/subdomain-add.js"
cp "${PLUGIN_DIR}/bp-subdomain-ux.js"   "${CUSTOM_JS}/bp-subdomain-ux.js"

ok "Assets deployed"
ok "Loader installed: ${CUSTOM_JS}/bp-subdomain-ux.js"

# --- 4. Install post_install hook ---
mkdir -p /etc/hestiacp/hooks

HOOK_MARKER="# bp-subdomain-ux post-install hook"

if [ -f "$HOOK" ] && grep -qF "$HOOK_MARKER" "$HOOK"; then
    ok "Hook already present: $HOOK"
else
    cat >> "$HOOK" << 'HOOK_BODY'

# bp-subdomain-ux post-install hook
# Re-deploys assets after every HestiaCP update
SDUX_DIR="/etc/hestiacp/bp-subdomain-ux"
SDUX_WEB="/usr/local/hestia/web"

if [ -d "$SDUX_DIR" ]; then
    mkdir -p "${SDUX_WEB}/css/bp-subdomain-ux"
    mkdir -p "${SDUX_WEB}/js/bp-subdomain-ux"
    mkdir -p "${SDUX_WEB}/js/custom_scripts"
    cp "${SDUX_DIR}/subdomain-list.css" "${SDUX_WEB}/css/bp-subdomain-ux/subdomain-list.css" 2>/dev/null || true
    cp "${SDUX_DIR}/subdomain-add.css"  "${SDUX_WEB}/css/bp-subdomain-ux/subdomain-add.css"  2>/dev/null || true
    cp "${SDUX_DIR}/subdomain-list.js"  "${SDUX_WEB}/js/bp-subdomain-ux/subdomain-list.js"   2>/dev/null || true
    cp "${SDUX_DIR}/subdomain-add.js"   "${SDUX_WEB}/js/bp-subdomain-ux/subdomain-add.js"    2>/dev/null || true
    cp "${SDUX_DIR}/bp-subdomain-ux.js" "${SDUX_WEB}/js/custom_scripts/bp-subdomain-ux.js"   2>/dev/null || true
fi
HOOK_BODY
    chmod +x "$HOOK"
    ok "Hook installed: $HOOK"
fi

echo ""
echo "======================================================"
ok "SubdomainUX-HestiaCP installed successfully."
echo "======================================================"
echo ""
