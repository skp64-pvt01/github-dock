# =============================================================================
# GitDock Makefile — build, install, package
# =============================================================================
.PHONY: all install-system install-user deb clean

all: deb

# ---------------------------------------------------------------------------
# Install from source (system service, requires sudo)
# ---------------------------------------------------------------------------
install-system:
	./install.sh --system

install-user:
	./install.sh --user

# ---------------------------------------------------------------------------
# Build .deb package
# ---------------------------------------------------------------------------
deb:
	dpkg-buildpackage -b -us -uc

# ---------------------------------------------------------------------------
# Source package (for Debian upload / Launchpad)
# ---------------------------------------------------------------------------
source:
	dpkg-buildpackage -S -us -uc

# ---------------------------------------------------------------------------
# Clean build artifacts
# ---------------------------------------------------------------------------
clean:
	rm -rf dist/
	rm -f ../gitdock_*.deb ../gitdock_*.dsc ../gitdock_*.tar.xz ../gitdock_*.changes ../gitdock_*.buildinfo
	rm -rf debian/.debhelper
	rm -f debian/files debian/gitdock.debhelper.log
	rm -rf debian/gitdock/
