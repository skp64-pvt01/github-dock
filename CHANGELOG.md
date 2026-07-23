# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.3.0] - 2026-07-23

### Added

- **Multi-workspace management** — `workspace.js` rewritten from single-path to multi-workspace storage (`listWorkspaces`, `getActiveWorkspace`, `activateWorkspace`, `addWorkspace`, `removeWorkspace`, `probePath`). Storage in `~/.gitdock/workspace.json` (overridable via `GITDOCK_DIR` env var).
- **Workspace API** — `GET/POST /api/workspaces`, `POST /api/workspaces/probe`, `PUT /api/workspaces/activate`, `DELETE /api/workspaces/:name`. Legacy `GET /api/workspace/status` and `POST /api/workspace/setup` preserved.
- **Workspace UI** — settings modal redesigned with active workspace display (name + path), dropdown selector + Switch button, workspace list with active indicator and delete, Add Workspace panel with Name/Path inputs + Probe + Add.
- **Probe detection** — `probePath()` detects existing `config.json` (accounts) and `.git` directories in target path.
- **37 unit and API integration tests** covering add/remove/activate/probe/list edge cases, name validation, legacy backward compat, `GITDOCK_DIR` env var.
- **GitLab provider support** — full-stack integration across all layers.
- **Provider dispatch layer** (`lib/provider-routing.js`) — `getRepoPath()`, `getLocalDir()`, `getSshHost()`, `getCloneUrl()` for GitHub (flat) and GitLab (nested group/subgroup) paths.
- **GitLab API client** (`lib/gitlab-api.js`) — list repos via Personal Access Token with `read_api` scope.
- **GitLab URL parsers** (`lib/security.js`) — `parseGitLabRepoUrl()`, `parseGitLabRepoFromRemote()`, `sanitizeGitLabRepoName()`, official GitLab `known_hosts` fingerprints.
- **Provider-aware account CRUD** — account form dynamically switches between GitHub/GitLab fields (username, instance URL, SSH host).
- **Provider badges** — repo cards and table rows show GitHub/GitLab badge; CSS `.b-provider-github`, `.b-provider-gitlab`, `.rc-provider-*` styles.
- **GitLab fullPath display** — nested group/subgroup path shown below repo name; focus view, transfer modal, and search include it.
- **Provider-aware setup timeline** — checkAccountStatus/runSetupSSH show correct provider docs, SSH-verify commands, and API instructions.
- **Hub provider support** — snapshot handler forwards `provider`, `fullPath`, `groupPath`; Hub dashboard shows provider badges and fullPath in repo cards/search.
- **One-time path migration** (`scripts/migrate-to-provider-paths.js`) — moves `BASE_DIR/<acct>/<repo>` → `BASE_DIR/github/<acct>/<repo>`, with `--dry-run`, `--undo`, safety checks, and config update.
- **Startup migration hook** (`server.js` `runPathMigration()`) — auto-invokes migration script for accounts without `provider` field.
- **Debian packaging** — `debian/` directory with `dpkg-buildpackage` support; installs to `/opt/gitdock`, creates `gitdock` system user, systemd service.
- **`install.sh`** — interactive CLI installer with `--system`/`--user`/`--uninstall` flags.
- **`Makefile`** — targets: `deb`, `install-system`, `install-user`, `clean`.
- **Unit tests**: 84 tests across 24 suites covering GitLab URL parsing, provider path routing, migration script, and security sanitization.

### Changed

- `server.js` — account CRUD accepts `provider`/`gitlabUser`/`instanceUrl`; `localDir` = `BASE_DIR/<provider>/<name>`; SSH markers are provider-aware; startup ensures both GitHub+GitLab known hosts.
- `dashboard.html` — account form (provider radio, dynamic fields), token modal (provider-specific instructions), setup timeline (provider-aware steps), repo cards (badges, fullPath), focus view, transfer modal, search filters, section headers, empty state.
- `hub/server.js` — snapshot handler now forwards `provider`, `fullPath`, `groupPath`.
- `hub/dashboard.html` — provider badges on repo cards/rows, fullPath display, provider in search filters.
- `lib/security.js` — extended with `sanitizeGitLabRepoName()`, `parseGitLabRepoUrl()`, `parseGitLabRepoFromRemote()`, `parseRepoUrl()` (provider detection), GitLab `known_hosts` fingerprints.
- Landing page (`site/index.html`): external CSS/JS, SEO (dashboard screenshot, manifest, sitemap.xml), security panel, aligned copy and Octicons.
- Landing preview on mobile (`site/index.html`, `site/css/index.css`): proportional dashboard scale (full screenshot visible), no horizontal scroll; fine-tuned tentacle positions/sizes on small screens only (desktop layout unchanged).
- Download page (`site/download.html`): static manifest, shared nav styles via `common.css`, centered OS picker, clearer prerequisites, tighter install steps.
- README header uses `site/gitdock-logo-removebg-preview.png` (transparent logo for GitHub light and dark themes).
- Account name validation now rejects names that require stripping unsafe characters (e.g. `bad name!`, `work;rm`).

### Fixed

- **Workspace visibility** — main page header now shows active workspace name + path; settings panel shows current base directory path even without a managed workspace.
- **Workspace auto-init** — server auto-creates/activates a "Default" workspace from `BASE_DIR` when running from source, keeping the workspace system in sync with the actual base directory.
- **Workspace status API** — `/api/workspace/status` now always returns `path` (BASE_DIR as fallback) instead of `null`.

### Fixed

- **SSH config safety** — `writeSSHConfigBlock()` now creates a timestamped backup (`~/.ssh/config.<timestamp>.bak`) before modifying. Silenced `/* ignore */` replaced with logged warnings. Empty or invalid accounts list no longer silently nukes non-managed entries.

### Security

- Stricter `sanitizeAccountName` so shell-like input cannot be silently normalized into a valid account id.
- GitLab official SSH `known_hosts` fingerprints added to `lib/security.js`.

## [1.2.0] - 2026-05-21

### Added

- Five-step account setup with GitHub-aligned SSH and fine-grained PAT guidance.
- Optional token storage in the OS credential store (not in `config.json`).
- Official GitHub `known_hosts` fingerprints and SSH verify feedback in setup status.
- Dormant repo filter and terminology (replaces stale/inactive).
- Modal close on outside click and Escape; segmented repo action bar; cloned repo green border.

### Changed

- Activity Log removed; feedback via toasts and SSE.
- README, privacy page, and site copy aligned with real token and dormant behavior.

[Unreleased]: https://github.com/gitdock-dev/gitdock/compare/v1.3.0...HEAD
[1.3.0]: https://github.com/gitdock-dev/gitdock/releases/tag/v1.3.0
[1.2.0]: https://github.com/gitdock-dev/gitdock/releases/tag/v1.2.0
