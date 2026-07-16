## Background

- GitDock: web-based utility for managing GitHub/GitLab repos across multiple accounts.
- Lists remote repos from API, clones under a workspace, manages SSH keys per account, provides git lifecycle operations (commit, push, pull, branch, stash), and multi-machine sync via GitDock Hub.

## Project State (v1.2.0)

### Phase 1 ✓ — Foundation: Path Restructure + Provider Abstraction
- **`lib/provider-routing.js`** — provider dispatch layer: `getRepoPath()`, `getLocalDir()`, `getSshHost()`, `getCloneUrl()`, `getTransferApiPath()`, `getProviderDisplayName()`. Handles both GitHub (flat) and GitLab (nested group/subgroup) paths.
- **`lib/github-api.js`** — GitHub REST API client extracted from `server.js` (`githubRequestJson`, `githubListAllPages`, `parseLinkHeader`).
- **`lib/security.js`** — extended with `sanitizeGitLabRepoName()` (allows `/`), `parseGitLabRepoUrl()`, `parseGitLabRepoFromRemote()`, `parseRepoUrl()`, GitLab known hosts constants.
- **`test/security.test.js`** — updated for `provider: "github"` in URL parser results.
- **`server.js`** — account CRUD accepts `provider`/`gitlabUser`/`instanceUrl`; `localDir` = `BASE_DIR/<provider>/<name>`; `getRepoPath()` has legacy fallback; SSH markers are provider-aware; startup ensures both GitHub+GitLab known hosts.
- All 29 unit tests pass; server syntax verified.

### Packaging & Deployment ✓
- **`debian/`** — full `.deb` packaging: `control`, `rules`, `changelog`, `copyright`, `install`, `postinst`, `prerm`, `postrm`. Installs to `/opt/gitdock`, creates `gitdock` system user, runs `npm install` on install, enables/starts systemd service.
- **`gitdock.service`** — system-level systemd unit, runs as `gitdock` user, security hardened (`NoNewPrivileges`, `ProtectSystem`, `PrivateTmp`).
- **`gitdock.user.service`** — user-level variant (no sudo needed, runs as current user).
- **`install.sh`** — interactive CLI installer (`--system`/`--user`/`--uninstall` flags).
- **`Makefile`** — targets: `deb`, `install-system`, `install-user`, `clean`.
- Verified: clean `dpkg-buildpackage`, `dpkg -i` installs, service runs and responds on `:3847`.

### Phase 6 ✓ — Hub & Agent Provider Support
- **`hub/server.js`** — snapshot agent handler now forwards `provider`, `fullPath`, and `groupPath` fields
- **`hub/dashboard.html`** — provider badge (GitHub/GitLab) on repo cards and rows; GitLab `fullPath` shown below repo name; search filters include provider and fullPath; CSS `.rc-provider--github/.gitlab` and `.rc-fullpath`
- **`server.js`** — `collectHubSnapshot()` already includes `provider`/`groupPath`/`fullPath` (verified)

### Phase 7 ✓ — One-Time Migration
- **`scripts/migrate-to-provider-paths.js`** — standalone migration script: moves `BASE_DIR/<acct>/<repo>` → `BASE_DIR/github/<acct>/<repo>` for accounts without `provider` field. Safety: dry-run mode, undo log (revert with `--undo`), skips existing targets, verifies `.git` dir, case-insensitive FS safe. Post-migration: removes empty old account dirs, updates config.json with `provider: "github"`, prints summary.
- **`server.js`** — `runPathMigration()` hook runs at startup: checks for old-location repos and auto-invokes the migration script with `child_process.spawnSync`. Graceful fallback if script is missing.

### Active — (none)

### Remaining Phases
8. Testing & Polish

## Key Files
| File | Purpose |
|------|---------|
| `server.js` | Main Express app — API routes, config, SSH, git operations |
| `lib/security.js` | Input sanitization, URL parsers (GitHub + GitLab), known hosts, rate limiting |
| `lib/provider-routing.js` | Provider dispatch — path, clone URL, SSH host, display name |
| `lib/github-api.js` | GitHub REST API client (extracted from server.js) |
| `lib/git-api.js` | Git output parsing (provider-agnostic) |
| `lib/dormant.js` | Dormant repo detection |
| `dashboard.html` | Main dashboard UI |
| `workspace-setup.html` | First-run setup wizard |

## Patterns
- **Express** v4.21, CommonJS modules, Node.js v22.22.1
- No external HTTP client — native `https` module for all API calls
- No version field in package.json (managed via changelog/build)
- Config: `config.json` at workspace root, auto-created on first run
- Accounts: keyed by sanitized name, stored under `config.accounts`
- Tests: vanilla Node test runner (`node --test`), no test framework

## Package / Install
- `dpkg-buildpackage -b -us -uc` builds `.deb` in parent directory
- `make deb` same
- `make install-system` / `make install-user` = source-based install via `install.sh`
- Node.js 18+ required, 22.22.1 recommended
- Single production dep: `express ^4.21.0`
