gitdockctrl - helper
====================

scripts/gitdockctrl is a small helper script shipped with the package. It
simplifies installing or enabling GitDock services in either user mode (the
recommended default) or system mode (requires sudo). See `gitdockctrl help`
for usage examples.

Note: This helper is intentionally minimal. It does not replace the
interactive `install.sh` but provides a compact way for admins to enable or
disable the system unit later without rerunning the full installer.

Installation recommendation:
- The project ships scripts/gitdockctrl. The package installs this helper to
  /usr/local/bin so admins can run it directly after installation. It will be
  removed on package purge.
