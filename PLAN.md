# GitLab Support — Impact Analysis & Implementation Plan

## Overview

Extend GitDock to support GitLab-hosted repositories alongside existing GitHub support. This preserves the existing GitHub implementation as-is and adds a parallel "provider" abstraction layer.

---

## 0. Workspace Directory Structure Change

### Current structure

```
<GitDock Workspace>/
  config.json
  <accountName>/              # e.g., "john"
    <repoName>/               # e.g., "my-project"
      .git/
```

### Proposed structure

```
<GitDock Workspace>/
  config.json
  github/                     # GitHub repos root
    <accountName>/            # e.g., "john"
      <repoName>/             # e.g., "my-project"
        .git/
  gitlab/                     # GitLab repos root
    <accountName>/            # e.g., "acmecorp"
      <groupName>/            # e.g., "engineering"
        <subgroupName>/       # optional: "backend"
          <repoName>/         # e.g., "api-service"
            .git/
          <repoName>/         # sibling repo: "worker-service"
            .git/
      <otherGroup>/
        <repoName>/
```

### Rationale

- Separates repos by provider at the top level — avoids name collisions between GitHub and GitLab (e.g., both could have a repo called "docs")
- GitLab allows deeply nested group/subgroup/project hierarchies. Mirroring this structure locally keeps the filesystem organized and predictable
- The `provider/` prefix makes it trivial to identify where any repo comes from

### Migration impact

Existing repos at `<workspace>/<accountName>/<repoName>` must be moved to `<workspace>/github/<accountName>/<repoName>`. This is a **one-time migration** (addressed in Phase 7).

---

## 1. Impact Analysis

### 1.1 Scope of Changes

| Area | Impact | Files |
|------|--------|-------|
| **Server.js core** | 15+ API endpoints need provider dispatch | `server.js` |
| **Account model** | Add `provider` field (github/gitlab) | `server.js`, `config.json` |
| **localDir construction** | Switch from `BASE_DIR/name` to `BASE_DIR/provider/name` | `server.js` (line 146) |
| **getRepoPath()** | Handle GitLab nested group/subgroup paths | `server.js` (line 487) |
| **sanitizeRepoName()** | Must allow `/` separators for GitLab group paths | `lib/security.js` (line 17) |
| **Local repo scanner** | Must walk recursively for GitLab nested directory trees | `server.js` (lines 1698–1751, 1778–1809) |
| **Clone URL construction** | GitLab SSH URLs use `group/subgroup/project.git` not `user/repo.git` | `server.js` (lines 1830, 1923) |
| **Clone by URL** | Must parse both GitHub and GitLab URLs | `server.js` (line 1880) |
| **SSH management** | Add GitLab known_hosts keys, provider-aware SSH markers | `server.js` (line 83), `lib/security.js` |
| **Security lib** | Add GitLab URL parsing, group-aware sanitization | `lib/security.js` |
| **Account fields** | `githubUser` is GitHub-specific; GitLab needs `gitlabUser` + optional `gitlabInstanceUrl` | `config.json`, API endpoints |
| **Git parse** | Unchanged (git output is provider-agnostic) | `lib/git-parse.js` |
| **Dormant detection** | Unchanged (local filesystem check) | `lib/dormant.js` |
| **Dashboard HTML** | Provider filter, path display, nested group tree in repo browser | `dashboard.html`, `workspace-setup.html` |
| **Hub (multi-machine)** | Add `gitlab` to snapshot fields, provider-field in path | `hub/server.js`, `hub/db.js` |
| **Config schema** | Add `provider`, `gitlabUser`, optional `gitlabInstanceUrl`. `githubUser` kept as-is. | — |
| **One-time migration** | Move existing repos from `<ws>/<acct>/<repo>` → `<ws>/github/<acct>/<repo>` | Migration script |
| **Package.json** | No new production deps needed (native https + git CLI) | `package.json` |
| **Tests** | New test files for GitLab URL parsing, API client, path generation | `test/` |

### 1.2 Key Differences Between GitHub & GitLab

| Aspect | GitHub | GitLab | Impact |
|--------|--------|--------|--------|
| API base | `api.github.com` | `gitlab.com/api/v4` | Configurable per account |
| Auth header | `Authorization: Bearer <token>` | `PRIVATE-TOKEN: <token>` | Different header name |
| Token prefix | `ghp_` | `glpat-` | Auto-detect for UX hints |
| User repos | `GET /users/:name/repos` | `GET /users/:id/projects` (personal only) | Need user ID lookup first |
| All repos | `GET /user/repos` | `GET /projects?membership=true` | Different query params |
| Pagination | `Link` header (always present) | `Link` header (may be absent) | Fallback to page counting |
| GraphQL | `api.github.com/graphql` | `gitlab.com/api/graphql` | Different schema but similar capability |
| Repo entity | "repo" with owner/name | "project" with namespace/path | Naming difference in API |
| Clone patterns | `git@github.com:user/repo.git` | `git@gitlab.com:group/project.git` | Same SSH URL format |
| CLI | `gh` | `glab` | Different CLI syntax |
| Self-hosted | Via `GH_HOST` env | `GITLAB_HOST` + `/api/v4` suffix | GitLab self-hosted is more common |

### 1.3 Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| Breaking existing GitHub users | HIGH (blocker) | Zero-touch: GitHub remains default, no config migration needed |
| Self-hosted GitLab URL variations | MEDIUM | Validate URL format, support `GITLAB_INSTANCE_URL` per account |
| Token scope confusion (user picks wrong scopes) | LOW | Validate token with `GET /user` + `GET /projects?per_page=1` |
| SSH key collision (same key across providers) | LOW | Key is per-account, not per-provider. No issue. |
| Dashboard complexity increase | MEDIUM | Add provider filter tabs, reuse most of existing UI |
| Hub agent snapshot format change | LOW | Add `provider` field, backward-compatible |
| **Migration of existing repos** | HIGH | All existing repos at `BASE_DIR/<acct>/<repo>` must move to `BASE_DIR/github/<acct>/<repo>`. Script must handle conflicts, large repos, macOS case-insensitive FS |
| **GitLab nested group paths** | MEDIUM | `getRepoPath()` and the local scanner must handle nested dirs. `sanitizeRepoName()` must allow `/`. `readdirSync` must be recursive |
| **Account field naming** | MEDIUM | `githubUser` is baked into API responses, config keys, SSH host aliases. Split into provider-neutral `accountLogin` + provider-specific display |

---

## 2. Architecture Options

### Option A — Provider Dispatch Pattern (Recommended)

Add a `provider: "github" | "gitlab"` field to each account. All GitHub-specific API calls go through a dispatcher that routes to the correct implementation.

```
POST /api/accounts
  → createAccount({ name, githubUser, provider: "gitlab" })
  
GET /api/repos
  → for each account:
      if provider === "github" → githubListRepos(account)
      if provider === "gitlab"  → gitlabListRepos(account)

POST /api/repos/clone
  → if account.provider === "github" → uses github.com SSH alias
  → if account.provider === "gitlab"  → uses gitlab.com SSH alias
```

**Pros**: Clean, parallel, existing code untouched. Easy to add more providers.
**Cons**: Some duplication of API client patterns.

### Option B — Unified API Client

Abstract the differences behind a single `providerApiRequest()` function that takes provider type as a parameter. Single pagination handler, single auth handler.

```
function providerRequest(provider, path, opts) {
  if (provider === "github") base = "api.github.com", auth = `Bearer ${token}`
  if (provider === "gitlab")  base = instanceUrl + "/api/v4", auth = `PRIVATE-TOKEN: ${token}`
  ...
}
```

**Pros**: Less code duplication. Single auth/pagination implementation.
**Cons**: Tangled abstraction — GitHub and GitLab have enough differences that the abstraction leaks. Harder to maintain.

### Option C — Plugin Architecture

Load provider implementations from `providers/` directory. Each provider exports `{ listRepos, validateToken, parseCloneUrl, ... }`.

**Pros**: Cleanest separation. Third-party providers possible.
**Cons**: Over-engineered for 2 providers. Premature abstraction.

### Recommended: Option A (Provider Dispatch)

Start with dispatch. If a third provider is ever needed, extract to Option C at that point.

---

## 3. Implementation Plan — Phases

### Phase 1 — Foundation: Path Restructure + Provider Abstraction

| Task | Files | Description |
|------|-------|-------------|
| 1.1 Add `provider` field to accounts | `server.js`, `config.json` | Account creation accepts `provider: "github" \| "gitlab"`. Defaults to `"github"`. Persists in `config.json`. |
| 1.2 Switch `localDir` to `BASE_DIR/provider/name` | `server.js` (line 146) | Change `path.join(BASE_DIR, name)` → `path.join(BASE_DIR, account.provider, name)`. This is the single source of truth for all directory paths. |
| 1.3 Update `getRepoPath()` for GitLab nested paths | `server.js` (line 482–491) | Accept optional `groupPath` parameter. For GitLab: `path.join(account.localDir, groupPath, repoName)`. For GitHub: unchanged (no groupPath). |
| 1.4 Allow `/` in GitLab repo names | `lib/security.js` (line 17) | Add `sanitizeGitLabRepoName()` that permits `/` separators for group/subgroup paths. The full path becomes `group/subgroup/repo`. |
| 1.5 Create provider dispatch module | New `lib/provider-routing.js` | `getRepoPath(account, repoName, groupPath?)` — wraps 1.3. `getProviderApiClient(account)` — returns the right API function set. |
| 1.6 Refactor GitHub API client out of server.js | New `lib/github-api.js` | Extract `githubRequestJson()`, `githubListAllPages()`, `githubApiForAccount()`, `validateAccountToken()` from `server.js`. No behavioral changes. |
| 1.7 Add self-hosted GitLab URL field | `server.js`, `config.json` | Optional `instanceUrl` on account (defaults to `https://gitlab.com`). |

### Phase 2 — GitLab API Client

| Task | Files | Description |
|------|-------|-------------|
| 2.1 Token validation | New `lib/gitlab-api.js` | `GET /api/v4/user` + `GET /api/v4/projects?per_page=1`. Validate token scopes. Returns `apiReady`, `login` (username), `name`, `id`. |
| 2.2 Repo listing | `lib/gitlab-api.js` | `GET /api/v4/projects?membership=true&per_page=100`. Handle pagination (offset-based, fallback if `Link` header missing as on GitLab.com). Map response to GitDock's unified repo format with `name` (from `path_with_namespace`), `groupPath` (extracted from the namespace path), `sshUrl`, `httpUrl`. |
| 2.3 Repo extras (MR/issue counts) | `lib/gitlab-api.js` | GraphQL query: `project(fullPath: "...") { issues { count } mergeRequests { count } }` |
| 2.4 SSH key upload | `lib/gitlab-api.js` | `POST /api/v4/user/keys`. Same pattern as GitHub. |
| 2.5 Status/readme/commits | `lib/gitlab-api.js` | Repository files: `GET /api/v4/projects/:id/repository/files/:path`. Commits: `GET /api/v4/projects/:id/repository/commits`. README: `GET /api/v4/projects/:id/repository/files/README.md`. |

### Phase 3 — SSH & Git Operations (Provider-Aware)

| Task | Files | Description |
|------|-------|-------------|
| 3.1 GitLab known_hosts | `lib/security.js` | Add GitLab's documented SSH host keys. `ensureKnownHosts()` becomes provider-aware: checks/writes both `github.com` and `gitlab.com` keys. |
| 3.2 SSH config management (provider-aware) | `server.js` | `SSH_MARKER` / `SSH_MARKER_END` → split into `github` and `gitlab` sections. Account-specific `Host gitlab.com-<name>` aliases in SSH config. Generate `id_ed25519_<name>` keys per account. |
| 3.3 Clone dispatch (name-based) | `server.js` (POST /api/repos/clone, line 1812) | Build clone URL based on provider: **GitHub**: `git@github.com-<alias>:<user>/<repo>.git`. **GitLab**: `git@gitlab.com-<alias>:<groupPath>/<repo>.git`. Use `path.join(account.localDir, groupPath)` as the target directory (creating intermediates). |
| 3.4 Clone dispatch (URL-based) | `server.js` (POST /api/repos/clone-url, line 1875) | Detect provider from URL. Parse GitLab URLs: `https://gitlab.com/<group>/<subgroup>/<project>` or `git@gitlab.com:<group>/<subgroup>/<project>.git`. Add `parseGitLabRepoUrl()` to `lib/security.js`. |
| 3.5 Nested directory creation | `server.js` | When cloning a GitLab repo with group path `engineering/backend`, create `BASE_DIR/gitlab/<acct>/engineering/backend/` before cloning. |
| 3.6 Pull/fetch dispatch | `server.js` | `getRepoPath()` already handles nested paths via Phase 1.3 — pull/fetch operations work automatically once the path resolves correctly. |

### Phase 4 — Local Repo Scanner (Recursive for GitLab)

| Task | Files | Description |
|------|-------|-------------|
| 4.1 Recursive directory walker | New `lib/scan-repos.js` | Walk `account.localDir` recursively, find all `.git` directories. Return `{ name, groupPath, repoPath }` for each. Handles both flat (GitHub) and nested (GitLab) structures. |
| 4.2 Update `/api/repos/local` | `server.js` (line 1778) | Use recursive walker instead of flat `readdirSync`. |
| 4.3 Update `/api/repos` — local enrichment | `server.js` (line 1662) | Replace `path.join(account.localDir, repo.name)` with recursive lookup so GitHub API repos match their cloned locations even in nested GitLab dirs. |
| 4.4 Hub snapshot — repo scanning | `server.js` (collectHubSnapshot, line 3178) | Use recursive walker for snapshot collection. |

### Phase 5 — Account Management UI

| Task | Files | Description |
|------|-------|-------------|
| 5.1 Provider selector in account form | `dashboard.html` | Dropdown/radio for GitHub vs GitLab. Show GitLab-specific fields: instance URL, used for repo URL construction. |
| 5.2 Provider badge in repo list | `dashboard.html` | GitHub/GitLab icon per repo. Filter/sort by provider. Show group path in repo display for GitLab repos. |
| 5.3 Account status panel | `dashboard.html` | Show provider, instance URL, connection status per provider. |
| 5.4 Nested repo tree browser | `dashboard.html` | For GitLab accounts, render group hierarchy as expandable tree. Click group to see repos inside. |
| 5.5 Workspace setup wizard | `workspace-setup.html` | Add GitLab option to first-run flow. |

### Phase 6 — Hub & Agent

| Task | Files | Description |
|------|-------|-------------|
| 6.1 Add provider to snapshot | `server.js` (collectHubSnapshot) | Include `provider: "github" | "gitlab"` and optional `groupPath` in repo snapshot data. |
| 6.2 Hub server schema | `hub/db.js` | Add `provider` and `group_path` columns to repos/snapshots tables. |
| 6.3 Hub dashboard | `hub/dashboard.html` | Provider filter on hub dashboard, group path display. |

### Phase 7 — One-Time Migration (Existing Repos)

| Task | Files | Description |
|------|-------|-------------|
| 7.1 Migration script | New `scripts/migrate-to-provider-paths.js` | Reads `config.json`, iterates all accounts. For each account with no `provider` (assumed GitHub), moves `BASE_DIR/<acct>/<repo>` → `BASE_DIR/github/<acct>/<repo>`. Updates `config.json` to add `provider: "github"` to each account. |
| 7.2 Safety checks | Migration script | Skip if target exists. Verify source is a git repo (`.git` dir). Handle case-insensitive FS collisions (macOS). Dry-run mode. Undo log. |
| 7.3 Post-migration cleanuup | Migration script | Remove empty old account directories after successful moves. Print summary of moved repos. |
| 7.4 Hook into server startup | `server.js` | On startup, if any account lacks `provider`, auto-run migration. This ensures the path restructure is seamless for existing users. |

### Phase 8 — Testing & Polish

| Task | Files | Description |
|------|-------|-------------|
| 8.1 Unit tests — URL parsing | `test/gitlab-parse.test.js` | Test `parseGitLabRepoUrl()`, provider detection from URLs, nested path extraction. |
| 8.2 Unit tests — GitLab API client | `test/gitlab-api.test.js` | Test token validation, repo listing formatting, pagination, field mapping. |
| 8.3 Unit tests — path generation | `test/gitlab-paths.test.js` | Test `getRepoPath()` with GitLab group paths, nested directory creation, recursive scanning. |
| 8.4 Unit tests — sanitization | Extend `test/security.test.js` | Test `sanitizeGitLabRepoName()` with group separators. |
| 8.5 Integration tests | Extend `test/api.integration.test.js` | Test account creation with provider, provider dispatch, nested clone path. |
| 8.6 Migration tests | `test/migration.test.js` | Test migration script with mock directory structures. |
| 8.7 CI workflow | `.github/workflows/test.yml` | Already runs tests — no change needed. |
| 8.8 Documentation | `README.md`, `AGENTS.md` | Document GitLab setup steps, provider configuration, directory structure changes. |

---

## 4. Detailed File Change Map

### New Files

| File | Purpose |
|------|---------|
| `lib/provider-routing.js` | Provider dispatch — `getRepoPath(acct, repo, groupPath?)`, `getProviderApiClient(acct)`, `getSshHost(acct)`, `getKnownHosts(acct)` |
| `lib/github-api.js` | GitHub-specific API calls extracted from `server.js`: `githubRequestJson()`, `githubListAllPages()`, `githubApiForAccount()`, `validateAccountToken()` |
| `lib/gitlab-api.js` | GitLab-specific API calls: token validation, repo listing + pagination, SSH key upload, README, commits, GraphQL extras |
| `lib/scan-repos.js` | Recursive directory walker that finds all `.git` dirs under a provider directory, returns `{ name, groupPath, repoPath, provider }` |
| `test/gitlab-parse.test.js` | Tests for `parseGitLabRepoUrl()` and provider detection |
| `test/gitlab-api.test.js` | Tests for GitLab API client (mocked HTTP) |
| `test/gitlab-paths.test.js` | Tests for `getRepoPath()` with nested group paths, recursive scanning |
| `test/migration.test.js` | Tests for the one-time migration script |
| `scripts/migrate-to-provider-paths.js` | One-time migration: move `BASE_DIR/<acct>/<repo>` → `BASE_DIR/github/<acct>/<repo>` |

### Modified Files

| File | Changes Summary |
|------|-----------------|
| `server.js` | `localDir` → `BASE_DIR/provider/name`. `getRepoPath()` → accepts groupPath. Route 15+ endpoints through provider dispatch. Clone URL construction per provider. SSH markers → provider-aware. Repo scanner → uses `lib/scan-repos.js`. Auto-migration startup hook. |
| `lib/security.js` | Add `parseGitLabRepoUrl()`, `sanitizeGitLabRepoName()` (allows `/`), GitLab known_hosts keys, `ensureKnownHosts()` provider-aware. |
| `dashboard.html` | Provider selector in account form. Provider badge + group path in repo list. Nested tree view for GitLab groups. Filter by provider. |
| `workspace-setup.html` | Provider choice in first-run flow. |
| `hub/server.js` | Accept `provider` and `group_path` fields in snapshots. |
| `hub/db.js` | Add `provider` and `group_path` columns to `machines` and `repos` tables. |
| `hub/dashboard.html` | Provider filter on hub dashboard, group path display. |
| `test/security.test.js` | Add GitLab URL parsing and sanitization tests. |
| `test/api.integration.test.js` | Add provider dispatch, nested path clone integration tests. |

### Unchanged Files

- `lib/git-parse.js` — git output parsing is provider-agnostic
- `lib/dormant.js` — filesystem checks don't care about provider
- `workspace.js` — workspace path logic remains provider-agnostic
- `scripts/build-*` — build/release scripts unchanged
- `site/` — marketing site unchanged (no provider references)
- `package.json` — no new dependencies (native https + system git CLI)

---

## 5. GitLab-Specific Edge Cases

1. **GitLab namespace vs owner**: GitLab uses `namespace/path` (e.g., `group/subgroup/project`). Clone URL is `git@gitlab.com:group/subgroup/project.git`. Need to handle deeply nested paths.

2. **Personal vs group projects**: `GET /users/:id/projects` only returns personal namespace projects. Group projects require `GET /groups/:id/projects`. May need a `/groups` listing step.

3. **Self-hosted instances**: Common in enterprise. Instance URL must be configurable per account. API base changes to `{instanceUrl}/api/v4`. SSH host also changes.

4. **Token expiry**: GitLab 16+ requires token expiry dates. The UI should warn when tokens are close to expiry.

5. **Project ID vs path**: GitLab API uses either numeric `id` or URL-encoded `namespace%2Fpath` in endpoints. The latter is more readable but needs encoding.

6. **glab CLI fallback**: `glab` has different output formats than `gh`. Fallback strategy needs separate implementation.

---

## 6. Effort Estimate

| Phase | Files | Estimated Effort | Dependencies |
|-------|-------|------------------|--------------|
| 1 — Foundation: Path Restructure + Provider Abstraction | 3 new, 3 modified | 4-5 hours | None |
| 2 — GitLab API Client | 1 new, 0 modified | 4-5 hours | Phase 1 |
| 3 — SSH & Git Operations | 2 modified | 2-3 hours | Phase 2 |
| 4 — Local Repo Scanner (Recursive) | 1 new, 3 modified | 2-3 hours | Phase 1 |
| 5 — Account Management UI | 2 modified | 4-5 hours | Phase 1 |
| 6 — Hub & Agent | 3 modified | 1-2 hours | Phase 2 |
| 7 — One-Time Migration | 1 new, 1 modified | 2-3 hours | Phase 1 (after path change is verified) |
| 8 — Testing & Polish | 4 new, 3 modified | 3-4 hours | All phases |
| **Total** | **10 new, ~17 modified** | **22-30 hours** | |

---

## 7. Rollback Plan

- Phase 1 is fully backward-compatible — existing accounts default to `provider: "github"` without any config change.
- Each phase is independently deployable. Stopping after Phase 1 does not break anything.
- If GitLab support needs to be removed, delete the `lib/gitlab-api.js` and `lib/provider-routing.js` files, remove provider routing from `server.js`, and existing GitHub accounts continue working unchanged.

---

## 8. Open Questions

1. Should GitLab accounts default to `main` branch (GitLab default) vs `master` (GitHub default)?
2. Should `glab` CLI be installed as a hard dependency for GitLab accounts, or optional fallback only?
3. Should "transfer repo" work across providers? (GitHub → GitLab or vice versa)
4. How should self-hosted GitLab instances be discovered? User provides URL, or we detect from token?
5. **Directory nesting depth limit:** GitLab allows arbitrary group nesting. Should we limit the local path depth (e.g., 3 levels max) to avoid path-length issues on Windows?
6. **Account field naming in config.json:** Currently `{ "accounts": { "name": { "githubUser": "...", "sshHost": "..." } } }`. Should GitLab accounts use `gitlabUser` or a unified `login` field? Proposal: keep `githubUser` for GitHub accounts, add `login` for GitLab accounts, and unify the field in the API response layer.
7. **Migration UX:** Should the migration from old paths to new paths happen automatically on startup (with a progress indicator in the dashboard), or require a manual script?
8. **Empty `github/` directory:** After migration, old account dirs become empty. Should we delete them automatically or leave them? (Leave them — safer.)
