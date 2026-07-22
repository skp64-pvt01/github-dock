#!/usr/bin/env bash
# =============================================================================
# install.sh - Install GitDock as a systemd service (system or user mode)
# =============================================================================
# Usage:
#   ./install.sh                  # interactive (asks user vs system)
#   ./install.sh --user           # install as user service (~/.config/systemd/user/)
#   ./install.sh --system         # install as system service (requires sudo)
#   ./install.sh --uninstall      # remove GitDock
# =============================================================================
set -euo pipefail

APP_NAME="gitdock"
INSTALL_DIR="/opt/gitdock"
BIN_LINK="/usr/bin/gitdock"
CTRL_LINK="/usr/local/bin/gitdockctrl"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log()  { echo -e "${GREEN}[gitdock]${NC} $1"; }
warn() { echo -e "${YELLOW}[gitdock]${NC} $1"; }
err()  { echo -e "${RED}[gitdock]${NC} $1" >&2; }

# --- Detect mode ---
MODE=""
for arg in "$@"; do
  case "$arg" in
    --user)      MODE="user" ;;
    --system)    MODE="system" ;;
    --uninstall) MODE="uninstall" ;;
  esac
done

if [ -z "$MODE" ]; then
  echo ""
  echo "  GitDock Installer"
  echo "  ================="
  echo "  1) System service (requires sudo, runs as gitdock user)"
  echo "  2) User service   (runs as current user, no sudo needed)"
  echo "  3) Uninstall"
  echo ""
  read -rp "  Choose [1-3]: " choice
  case "$choice" in
    1) MODE="system" ;;
    2) MODE="user" ;;
    3) MODE="uninstall" ;;
    *) err "Invalid choice."; exit 1 ;;
  esac
fi

# =============================================================================
# UNINSTALL
# =============================================================================
if [ "$MODE" = "uninstall" ]; then
  log "Uninstalling GitDock..."

  if systemctl is-active --quiet gitdock 2>/dev/null; then
    log "Stopping GitDock service..."
    systemctl stop gitdock 2>/dev/null || true
  fi

  if systemctl is-enabled --quiet gitdock 2>/dev/null; then
    log "Disabling GitDock service..."
    systemctl disable gitdock 2>/dev/null || true
  fi

  if [ -f /etc/systemd/system/gitdock.service ]; then
    rm -f /etc/systemd/system/gitdock.service
    systemctl daemon-reload 2>/dev/null || true
  fi

  if [ -f "$HOME/.config/systemd/user/gitdock.service" ]; then
    rm -f "$HOME/.config/systemd/user/gitdock.service"
    systemctl --user daemon-reload 2>/dev/null || true
  fi

  if [ -f "$BIN_LINK" ]; then
    rm -f "$BIN_LINK"
  fi

  if [ -d "$INSTALL_DIR" ]; then
    warn "Removing $INSTALL_DIR (sudo may be required)..."
    sudo rm -rf "$INSTALL_DIR" 2>/dev/null || rm -rf "$INSTALL_DIR" 2>/dev/null || warn "Could not remove $INSTALL_DIR - remove manually."
  fi

  log "GitDock uninstalled."
  exit 0
fi

# =============================================================================
# PREREQUISITES
# =============================================================================
log "Checking prerequisites..."

if ! command -v node &>/dev/null; then
  err "Node.js is required. Install it first:"
  err "  curl -fsSL https://deb.nodesource.com/setup_22.x | sudo bash -"
  err "  sudo apt install -y nodejs"
  exit 1
fi

NODE_VER=$(node -v | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VER" -lt 18 ]; then
  err "Node.js 18+ is required. Found: $(node -v)"
  exit 1
fi
log "Node.js $(node -v) - OK"

if ! command -v npm &>/dev/null; then
  err "npm is required."
  exit 1
fi

# =============================================================================
# INSTALL FILES
# =============================================================================
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

if [ "$MODE" = "system" ]; then
  log "Installing GitDock to $INSTALL_DIR (system mode)..."
  sudo mkdir -p "$INSTALL_DIR"
  sudo cp -r "$SCRIPT_DIR"/. "$INSTALL_DIR"/ 2>/dev/null || {
    # Explicit file list instead
    sudo mkdir -p "$INSTALL_DIR"/lib "$INSTALL_DIR"/hub "$INSTALL_DIR"/site "$INSTALL_DIR"/test "$INSTALL_DIR"/scripts
    for f in server.js workspace.js package.json dashboard.html workspace-setup.html start.sh sea-config.json README.md CHANGELOG.md CONTRIBUTING.md AGENTS.md PLAN.md .gitignore; do
      [ -f "$SCRIPT_DIR/$f" ] && sudo cp "$SCRIPT_DIR/$f" "$INSTALL_DIR/"
    done
    sudo cp -r "$SCRIPT_DIR"/lib/* "$INSTALL_DIR"/lib/
    sudo cp -r "$SCRIPT_DIR"/hub/* "$INSTALL_DIR"/hub/
    sudo cp -r "$SCRIPT_DIR"/site/* "$INSTALL_DIR"/site/
    sudo cp -r "$SCRIPT_DIR"/test/* "$INSTALL_DIR"/test/
    sudo cp -r "$SCRIPT_DIR"/scripts/* "$INSTALL_DIR"/scripts/
  }
  sudo chmod 755 "$INSTALL_DIR"
  sudo find "$INSTALL_DIR" -type d -exec chmod 755 {} \;
  sudo find "$INSTALL_DIR" -type f -name "*.js" -exec chmod 644 {} \;
  sudo find "$INSTALL_DIR" -type f -name "*.json" -exec chmod 644 {} \;
  sudo find "$INSTALL_DIR" -type f -name "*.html" -exec chmod 644 {} \;
  sudo find "$INSTALL_DIR" -type f -name "*.md" -exec chmod 644 {} \;
  sudo find "$INSTALL_DIR" -type f -name "*.sh" -exec chmod 755 {} \;
else
  log "Installing GitDock to $INSTALL_DIR (user mode)..."
  sudo mkdir -p "$INSTALL_DIR"
  sudo cp -r "$SCRIPT_DIR"/. "$INSTALL_DIR"/ 2>/dev/null || {
    sudo mkdir -p "$INSTALL_DIR"/lib "$INSTALL_DIR"/hub "$INSTALL_DIR"/site "$INSTALL_DIR"/test "$INSTALL_DIR"/scripts
    for f in server.js workspace.js package.json dashboard.html workspace-setup.html start.sh sea-config.json README.md CHANGELOG.md CONTRIBUTING.md AGENTS.md PLAN.md .gitignore; do
      [ -f "$SCRIPT_DIR/$f" ] && sudo cp "$SCRIPT_DIR/$f" "$INSTALL_DIR/"
    done
    sudo cp -r "$SCRIPT_DIR"/lib/* "$INSTALL_DIR"/lib/
    sudo cp -r "$SCRIPT_DIR"/hub/* "$INSTALL_DIR"/hub/
    sudo cp -r "$SCRIPT_DIR"/site/* "$INSTALL_DIR"/site/
    sudo cp -r "$SCRIPT_DIR"/test/* "$INSTALL_DIR"/test/
    sudo cp -r "$SCRIPT_DIR"/scripts/* "$INSTALL_DIR"/scripts/
  }
  sudo chmod -R a+rX "$INSTALL_DIR"
fi

# =============================================================================
# INSTALL DEPENDENCIES
# =============================================================================
log "Installing npm dependencies..."
if [ "$MODE" = "system" ]; then
  sudo chown -R root:root "$INSTALL_DIR"
  cd "$INSTALL_DIR" && sudo npm install --omit=dev --no-audit --no-fund 2>&1 | tail -2
else
  cd "$INSTALL_DIR" && sudo npm install --omit=dev --no-audit --no-fund 2>&1 | tail -2
fi

# =============================================================================
# CREATE GITDOCK USER (system mode only)
# =============================================================================
if [ "$MODE" = "system" ]; then
  if ! getent passwd gitdock >/dev/null 2>&1; then
    log "Creating gitdock system user..."
    sudo adduser --system --group --home "$INSTALL_DIR" --no-create-home \
      --disabled-login --quiet gitdock 2>/dev/null || true
  fi
  sudo chown -R gitdock:gitdock "$INSTALL_DIR"
  sudo chmod 755 "$INSTALL_DIR"

  # Create log directory
  sudo mkdir -p /var/log/gitdock
  sudo chown gitdock:gitdock /var/log/gitdock
  sudo chmod 755 /var/log/gitdock
fi

# =============================================================================
# INSTALL SYSTEMD SERVICE
# =============================================================================
  if [ "$MODE" = "system" ]; then
    log "Installing systemd service (system level)..."
    sudo cp "$SCRIPT_DIR/gitdock.service" /etc/systemd/system/
    sudo chmod 644 /etc/systemd/system/gitdock.service
    sudo systemctl daemon-reload
    # Do not enable/start the system service automatically. Use gitdockctrl or
    # run 'sudo systemctl enable --now gitdock' when ready.
    log "System unit installed at /etc/systemd/system/gitdock.service"

    # Create convenience symlink for admins
    if [ ! -f "$BIN_LINK" ]; then
      echo '#!/bin/bash' | sudo tee "$BIN_LINK" >/dev/null
      echo 'exec systemctl $1 gitdock' | sudo tee -a "$BIN_LINK" >/dev/null
      sudo chmod 755 "$BIN_LINK"
      log "Created $BIN_LINK - run 'gitdock status|start|stop|restart' (requires sudo)"
    fi
    # The helper script is installed by the package maintainer via debian/install
    # to /usr/local/bin. Do not copy at runtime from the install tree.
  else
    log "Installing systemd service (user level)..."
    mkdir -p "$HOME/.config/systemd/user"
    cp "$SCRIPT_DIR/gitdock.user.service" "$HOME/.config/systemd/user/gitdock.service"
    chmod 644 "$HOME/.config/systemd/user/gitdock.service"
    systemctl --user daemon-reload
    systemctl --user enable gitdock
    systemctl --user start gitdock
    log "GitDock user service started. Check: systemctl --user status gitdock"

    # Enable lingering for this user so service starts on boot without login
    log "Enabling lingering for user $USER (service starts on boot)..."
    sudo loginctl enable-linger "$USER" 2>/dev/null || warn "Could not enable lingering - user service won't start automatically at boot"
  fi

# =============================================================================
# SUMMARY
# =============================================================================
echo ""
log "${GREEN}GitDock installed successfully!${NC}"
echo ""
echo "  Access the dashboard:  http://127.0.0.1:3847"
echo ""
if [ "$MODE" = "system" ]; then
  echo "  Manage the service:    sudo systemctl {status,start,stop,restart} gitdock"
  echo "                         gitdock {status,start,stop,restart}"
  echo "  View logs:            sudo journalctl -u gitdock -f"
else
  echo "  Manage the service:    systemctl --user {status,start,stop,restart} gitdock"
  echo "  View logs:            journalctl --user -u gitdock -f"
fi
echo "  Config file:          /opt/gitdock/config.json (auto-created)"
echo "  Workspace:            ~/GitDock (configurable via dashboard)"
echo "  Docs:                 https://gitdock.dev"
echo ""
