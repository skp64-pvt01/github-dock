# Graph Report - .  (2026-07-17)

## Corpus Check
- 60 files · ~234,519 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 365 nodes · 511 edges · 28 communities (24 shown, 4 thin omitted)
- Extraction: 79% EXTRACTED · 21% INFERRED · 0% AMBIGUOUS · INFERRED: 108 edges (avg confidence: 0.66)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Git Parsing & Security
- Project Documentation
- Package Dependencies
- Hub Database Schema
- Hub Server API
- Hub NPM Packages
- Security & Rate Limiting
- Project Identity & Branding
- Site Frontend
- Authentication & Sessions
- API Integration Tests
- Hub Dashboard
- Workspace Management
- Site Manifest
- Dormant Detection
- Test Documentation
- Hero Particle Animation
- Git Parse Tests
- SEA Executable Builds
- Release Artifacts
- Build Script Linux
- Start Scripts
- Start Script Linux
- Robots TXT

## God Nodes (most connected - your core abstractions)
1. `getDb()` - 20 edges
2. `GitDock Main Server (server.js)` - 20 edges
3. `loadConfig()` - 12 edges
4. `GitDock Hub Server (hub/server.js)` - 12 edges
5. `Landing Page` - 10 edges
6. `Security Input Validation Library (lib/security.js)` - 8 edges
7. `README.md Project Documentation` - 8 edges
8. `scripts` - 7 edges
9. `githubApiForAccount()` - 6 edges
10. `getRepoStatus()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `Hub Cross-Machine Sync Issue Detection` --semantically_similar_to--> `Dormant Repo Detection Library (lib/dormant.js)`  [AMBIGUOUS] [semantically similar]
  hub/server.js → lib/dormant.js
- `Local-Only Architecture Decision` --rationale_for--> `GitDock Main Server (server.js)`  [INFERRED]
  README.md → server.js
- `README Tech Stack Declaration` --conceptually_related_to--> `GitDock Main Server (server.js)`  [INFERRED]
  README.md → server.js
- `GitDock Main Server (server.js)` --semantically_similar_to--> `GitDock Hub Server (hub/server.js)`  [INFERRED] [semantically similar]
  server.js → hub/server.js
- `Workspace Setup First-Run Page (workspace-setup.html)` --conceptually_related_to--> `GitDock Main Server (server.js)`  [INFERRED]
  workspace-setup.html → server.js

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **GitDock Dual-Architecture: Local Server + Central Hub** — server_js_gitdock_main_server, hub_server_js, server_js_hub_snapshot_agent, readme_no_cloud_architecture, hub_readme_self_host_vs_hosted [INFERRED 0.85]
- **Shared Library Trio (security, git-parse, dormant)** — lib_security_js, lib_git_parse_js, lib_dormant_js, changelog_refactoring_to_lib, server_js_gitdock_main_server [INFERRED 0.90]
- **Hub Authentication-to-Dashboard Flow** — hub_auth_js, hub_db_js, hub_db_schema, hub_server_js, hub_dashboard_html [INFERRED 0.85]
- **GitDock Public Website** — site_index_html, site_download_html, site_privacy_html, site_terms_html, site_manifest_json, site_robots_txt [EXTRACTED 0.85]
- **SEA Executable Build Pipeline** — scripts_build_sea_ps1, scripts_build_sea_sh, sea_config_json [EXTRACTED 0.90]
- **GitDock Automated Test Suite** — test_api_integration_test_js, test_dormant_test_js, test_git_parse_test_js, test_security_test_js, test_helpers_http_test_helpers [EXTRACTED 0.85]

## Communities (28 total, 4 thin omitted)

### Community 0 - "Git Parsing & Security"
Cohesion: 0.05
Nodes (60): parseStatusBranchLine(), parseStatusPorcelain(), sanitizeAccountName(), sanitizeSshHostAlias(), activeOperations, cleanupOrphanedGitconfigs(), collectHubSnapshot(), CONFIG_PATH (+52 more)

### Community 1 - "Project Documentation"
Cohesion: 0.11
Nodes (32): CHANGELOG.md Version History, CHANGELOG Refactor to lib/ Pattern, CONTRIBUTING.md Contribution Guide, CONTRIBUTING.md Release and Versioning Policy, CONTRIBUTING.md Testing Setup Description, Main Dashboard Web UI (dashboard.html), Build Release CI Workflow, Test CI Workflow (+24 more)

### Community 2 - "Package Dependencies"
Cohesion: 0.07
Nodes (26): esbuild, bin, dependencies, express, description, devDependencies, esbuild, postject (+18 more)

### Community 3 - "Hub Database Schema"
Cohesion: 0.14
Nodes (24): createApiKey(), createUser(), Database, DB_PATH, deleteMachine(), fs, getAllSnapshots(), getApiKeyHashesForVerification() (+16 more)

### Community 4 - "Hub Server API"
Cohesion: 0.08
Nodes (15): apiLimiter, app, auth, cookieParser, crypto, db, express, fs (+7 more)

### Community 5 - "Hub NPM Packages"
Cohesion: 0.08
Nodes (23): bcryptjs, better-sqlite3-multiple-ciphers, cookie-parser, dotenv, express-rate-limit, helmet, dependencies, bcryptjs (+15 more)

### Community 6 - "Security & Rate Limiting"
Cohesion: 0.11
Nodes (16): GITHUB_OFFICIAL_KNOWN_HOSTS_LINES, githubOfficialKeysInKnownHosts(), isPathInsideDir(), parseGitHubOwnerRepoFromRemote(), parseGitHubRepoUrl(), path, sanitizeOwnerName(), sanitizeRepoName() (+8 more)

### Community 7 - "Project Identity & Branding"
Cohesion: 0.29
Nodes (18): GitDock Hub (Multi-Machine Service), GitDock Logo (Root), GitDock Logo (Transparent Background), GitDock Project, GitDock Site (Landing Page), GitDock Hub Logo, GitDock Hub Logo (Transparent Background), GitDock Dashboard Screenshot (PNG) (+10 more)

### Community 8 - "Site Frontend"
Cohesion: 0.16
Nodes (17): Hero Particle System, Platform Detection and OS Switching, PR Body: Download Page Improvements, PR Body: Mobile Preview Fix, Scroll Reveal Animation, Download Page, Landing Page, Common JavaScript (+9 more)

### Community 9 - "Authentication & Sessions"
Cohesion: 0.16
Nodes (9): apiKeyFromHeader(), bcrypt, createSession(), crypto, db, getSecret(), resolveApiKey(), sessions (+1 more)

### Community 10 - "API Integration Tests"
Cohesion: 0.15
Nodes (13): app, { api }, { app }, assert, { describe, it, before }, fs, os, path (+5 more)

### Community 11 - "Hub Dashboard"
Cohesion: 0.20
Nodes (14): Hub Authentication (hub/auth.js), Hub Dashboard Web UI (hub/dashboard.html), Hub Database Layer (hub/db.js), Hub SQLite Schema (users/api_keys/machines/snapshots/audit_log), Hub package.json (gitdock-hub v1.0.0), Hub Data Stored Documentation, Hub README.md Setup Documentation, Hub Security Documentation (+6 more)

### Community 12 - "Workspace Management"
Cohesion: 0.22
Nodes (9): ensureGitDockDir(), fs, GITDOCK_DIR, isWorkspaceConfigured(), loadWorkspace(), os, path, saveWorkspace() (+1 more)

### Community 13 - "Site Manifest"
Cohesion: 0.22
Nodes (8): background_color, description, display, icons, name, short_name, start_url, theme_color

### Community 14 - "Dormant Detection"
Cohesion: 0.29
Nodes (3): assert, { describe, it }, dormant

### Community 15 - "Test Documentation"
Cohesion: 0.47
Nodes (6): PR Body: Test Suite Addition, API Integration Tests, Dormant Detection Tests, Git Parse Tests, HTTP Test Helpers (supertest wrapper), Security Module Tests

### Community 16 - "Hero Particle Animation"
Cohesion: 0.60
Nodes (3): init(), makeParticle(), resize()

### Community 17 - "Git Parse Tests"
Cohesion: 0.50
Nodes (3): assert, { describe, it }, gitParse

### Community 18 - "SEA Executable Builds"
Cohesion: 1.00
Nodes (3): Build SEA Executable (Windows), Build SEA Executable (macOS/Linux), SEA Configuration

### Community 20 - "Release Artifacts"
Cohesion: 1.00
Nodes (3): Publish v1.2.0 Script, Release Notes v1.2.0, Release PR Body v1.2.0

## Ambiguous Edges - Review These
- `Dormant Repo Detection Library (lib/dormant.js)` → `Hub Cross-Machine Sync Issue Detection`  [AMBIGUOUS]
  hub/server.js · relation: semantically_similar_to

## Knowledge Gaps
- **125 isolated node(s):** `bcrypt`, `crypto`, `db`, `sessions`, `Database` (+120 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Dormant Repo Detection Library (lib/dormant.js)` and `Hub Cross-Machine Sync Issue Detection`?**
  _Edge tagged AMBIGUOUS (relation: semantically_similar_to) - confidence is low._
- **Why does `GitDock Main Server (server.js)` connect `Project Documentation` to `Hub Dashboard`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `GitDock Main Server (server.js)` (e.g. with `Local-Only Architecture Decision` and `README Tech Stack Declaration`) actually correct?**
  _`GitDock Main Server (server.js)` has 5 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `GitDock Hub Server (hub/server.js)` (e.g. with `Hub Self-Host vs Hosted Decision` and `GitDock Main Server (server.js)`) actually correct?**
  _`GitDock Hub Server (hub/server.js)` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `bcrypt`, `crypto`, `db` to the rest of the system?**
  _125 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Git Parsing & Security` be split into smaller, more focused modules?**
  _Cohesion score 0.050921861281826165 - nodes in this community are weakly interconnected._
- **Should `Project Documentation` be split into smaller, more focused modules?**
  _Cohesion score 0.11088709677419355 - nodes in this community are weakly interconnected._