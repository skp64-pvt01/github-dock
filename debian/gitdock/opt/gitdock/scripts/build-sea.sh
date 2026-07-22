#!/usr/bin/env bash
# =============================================================================
# build-sea.sh - Build GitDock SEA executable (macOS / Linux)
# =============================================================================
# Usage:
#   ./scripts/build-sea.sh          # SEA executable only (default)
#   ./scripts/build-sea.sh --deb    # SEA executable + Debian package
#   ./scripts/build-sea.sh --help   # Show usage
#
# Auto-detects and installs missing npm devDependencies.
# Downloads an official Node.js binary if the system one lacks the SEA sentinel
# (common on Debian/Ubuntu where the node binary is stripped).
# =============================================================================

set -e
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

# ── Flag parsing ──────────────────────────────────────────────────────────────
BUILD_DEB=false
case "${1:-}" in
  --deb) BUILD_DEB=true ;;
  --help|-h)
    echo "Usage: $0 [--deb]"
    echo "  (no flag)  Build SEA executable only"
    echo "  --deb      Build SEA executable + Debian package"
    exit 0
    ;;
  "")
    # default: SEA only
    ;;
  *)
    echo "Unknown flag: $1"
    echo "Usage: $0 [--deb]"
    exit 1
    ;;
esac

# =============================================================================
# Dependency checks
# =============================================================================

command -v node  >/dev/null 2>&1 || { echo "  ERROR: Node.js is not installed. Install Node.js 22+ from https://nodejs.org"; exit 1; }
command -v npm   >/dev/null 2>&1 || { echo "  ERROR: npm is not installed (should ship with Node.js)."; exit 1; }
command -v curl  >/dev/null 2>&1 || { echo "  ERROR: curl is required. Install it (apt install curl / brew install curl)."; exit 1; }
command -v tar   >/dev/null 2>&1 || { echo "  ERROR: tar is required."; exit 1; }
command -v strings >/dev/null 2>&1 || { echo "  ERROR: strings is required (apt install binutils / part of Xcode CLI tools)."; exit 1; }

NODE_MAJOR="$(node -e "console.log(process.version.match(/^v(\d+)/)[1])")"
if [ "$NODE_MAJOR" -lt 22 ]; then
  echo "  ERROR: Node.js 22+ required (found v$(node -v)). Install the latest LTS from https://nodejs.org"
  exit 1
fi

# -- Check npm devDependencies (esbuild, postject) — install if missing ---------
if ! [ -f node_modules/.bin/esbuild ]; then
  echo "  esbuild not found — running npm install..."
  npm install
fi
if ! [ -f node_modules/.bin/postject ]; then
  echo "  postject not found — running npm install..."
  npm install
fi

# =============================================================================
# Find or fetch a Node.js binary that has the SEA sentinel.
# Debian/Ubuntu packages strip the binary, removing the sentinel.
# =============================================================================
SEA_NODE=""

find_sea_node() {
  local candidate
  for candidate in /usr/bin/node /usr/local/bin/node /home/linuxbrew/.linuxbrew/bin/node; do
    if [ -x "$candidate" ] && strings "$candidate" 2>/dev/null | grep -q "NODE_SEA_FUSE"; then
      echo "$candidate"
      return 0
    fi
  done
  return 1
}

SEA_NODE="$(find_sea_node)" || true

if [ -z "$SEA_NODE" ]; then
  echo ""
  echo "  System Node.js binary lacks the SEA sentinel (stripped — common on Debian/Ubuntu)."
  echo "  Downloading official Node.js binary..."

  ARCH="$(uname -m)"
  case "$ARCH" in
    x86_64)  ARCH_STR="x64" ;;
    aarch64) ARCH_STR="arm64" ;;
    arm64)   ARCH_STR="arm64" ;;
    *)
      echo "  Unsupported architecture: $ARCH"
      exit 1
      ;;
  esac

  OS="$(uname -s | tr '[:upper:]' '[:lower:]')"
  NODE_VERSION="22.14.0"
  NODE_PLATFORM="${OS}-${ARCH_STR}"
  NODE_TAR="node-v${NODE_VERSION}-${NODE_PLATFORM}.tar.xz"
  NODE_URL="https://nodejs.org/dist/v${NODE_VERSION}/${NODE_TAR}"
  NODE_DIR="dist/node-v${NODE_VERSION}-${NODE_PLATFORM}"

  if [ ! -f "${NODE_DIR}/bin/node" ]; then
    mkdir -p dist
    echo "  Fetching ${NODE_URL} ..."
    curl -fsSL "$NODE_URL" -o "dist/${NODE_TAR}"
    echo "  Extracting..."
    tar -xf "dist/${NODE_TAR}" -C dist/
    rm -f "dist/${NODE_TAR}"
  fi

  SEA_NODE="${NODE_DIR}/bin/node"
  if [ ! -x "$SEA_NODE" ]; then
    echo "  ERROR: Failed to acquire a Node.js binary with SEA support."
    exit 1
  fi
  SENTINEL_COUNT="$(strings "$SEA_NODE" | grep -c "NODE_SEA_FUSE")"
  echo "  Using: $SEA_NODE (${SENTINEL_COUNT} sentinel instances)"
fi

# =============================================================================
# Step 1 — Bundle with esbuild
# =============================================================================
echo ""
echo "  [1/6] Bundling with esbuild..."
node_modules/.bin/esbuild server.js --bundle --platform=node \
  --outfile=dist/server.bundle.js \
  --external:child_process --external:fs --external:path \
  --external:os --external:https --external:http --external:crypto \
  --external:net --external:tls --external:url --external:stream \
  --external:zlib --external:events --external:util --external:querystring \
  --external:buffer

# =============================================================================
# Step 2 — Generate SEA blob
# =============================================================================
echo "  [2/6] Generating SEA blob..."
"$SEA_NODE" --experimental-sea-config sea-config.json 2>/dev/null || true
if [ ! -f "dist/gitdock-sea-prep.blob" ]; then
  echo "  ERROR: SEA blob was not created."
  echo "  Try running: $SEA_NODE --experimental-sea-config sea-config.json"
  exit 1
fi

# =============================================================================
# Step 3 — Copy Node binary
# =============================================================================
echo "  [3/6] Copying Node binary..."
EXE_OUT="dist/gitdock"
cp "$SEA_NODE" "$EXE_OUT"
chmod 755 "$EXE_OUT"

# =============================================================================
# Step 4 — Remove macOS code signature (macOS only)
# =============================================================================
if [ "$(uname -s)" = "Darwin" ]; then
  echo "  [4/6] Removing macOS signature..."
  codesign --remove-signature "$EXE_OUT" 2>/dev/null || true
fi

# =============================================================================
# Step 5 — Inject SEA blob
# =============================================================================
echo "  [5/6] Injecting SEA blob..."
node_modules/.bin/postject "$EXE_OUT" NODE_SEA_BLOB dist/gitdock-sea-prep.blob \
  --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2

if [ "$(uname -s)" = "Darwin" ]; then
  echo "  Re-signing..."
  codesign --sign - "$EXE_OUT"
fi

# =============================================================================
# Step 6 — Copy runtime assets (dashboard, scripts, migrations)
# =============================================================================
echo "  [6/6] Copying runtime assets..."
cp dashboard.html workspace-setup.html "dist/"
cp -r scripts "dist/"
echo "  (dashboard.html, workspace-setup.html, scripts/ copied to dist/)"

# =============================================================================
# Step 7 — Build Debian package (only with --deb flag, Linux only)
# =============================================================================
if [ "$BUILD_DEB" = true ]; then
  if command -v dpkg-buildpackage >/dev/null 2>&1; then
    echo ""
    echo "  [7/7] Building Debian package..."
    make deb 2>&1 | sed 's/^/    /'
    for f in ../gitdock_*.deb; do
      if [ -f "$f" ]; then
        echo "  Debian package: $(ls -lh "$f" | awk '{print $5, $NF}')"
      fi
    done
  else
    echo "  ERROR: dpkg-buildpackage not found. Install dpkg-dev: apt install dpkg-dev"
    exit 1
  fi
fi

# =============================================================================
# Done
# =============================================================================
echo ""
echo "  Done. Executable: $EXE_OUT"
echo "  Size: $(du -h "$EXE_OUT" | cut -f1)"
echo ""
echo "  To run:"
echo "    ./dist/gitdock"
echo ""
echo "  To package for distribution:"
echo "    cd dist && tar -czf gitdock-$(uname -s | tr '[:upper:]' '[:lower:]')-${ARCH_STR}.tar.gz gitdock dashboard.html workspace-setup.html scripts/"
