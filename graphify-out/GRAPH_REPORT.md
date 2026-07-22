# Graph Report - .  (2026-07-22)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 1172 nodes · 1563 edges · 117 communities (87 shown, 30 thin omitted)
- Extraction: 83% EXTRACTED · 17% INFERRED · 0% AMBIGUOUS · INFERRED: 268 edges (avg confidence: 0.58)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c026238c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- hub/server.js
- gitdock/server.js
- gitdock/hub/server.js
- scripts/migrate-to-provider-paths.js
- gitdock/lib/security.js
- server.js
- workspace.js
- gitdock/test/migration.test.js
- gitdock/hub/db.js
- hub/db.js
- test/api.integration.test.js
- dependencies
- dependencies
- lib/security.js
- gitdock/scripts/migrate-to-provider-paths.js
- GitLab Implementation Plan
- Landing Page
- gitdock/lib/provider-routing.js
- GitLab Support — User Testing Guide
- Branding element: GitDock octopus logo, 1024x1024 RGB
- gitdock/lib/gitlab-api.js
- lib/gitlab-api.js
- Hub Dashboard HTML
- gitdock/test/api.integration.test.js
- lib/provider-routing.js
- Debian packaging: debian/ with dpkg-buildpackage
- Site Landing Page
- gitdock/lib/github-api.js
- test/migration.test.js
- loadConfig
- lib/security.js
- gitdock/workspace.js
- githubApiForAccount
- PWA manifest with standalone display
- getRepoStatus
- githubApiForAccount
- loadConfig
- AGENTS.md
- Hub Express server
- writeSSHConfigBlock
- Project State v1.2.0
- GitLab Support — Impact Analysis & Implementation Plan
- test/gitlab-paths.test.js
- Contributing Guide
- Dashboard UI Elements
- gitdock/test/dormant.test.js
- README Documentation
- GitDock Tentacle Bottom
- test/dormant.test.js
- getRepoStatus
- gitdock/scripts/dev.sh
- scripts/dev.sh
- lib/github-api.js
- GitDock Logo (Root)
- writeSSHConfigBlock
- SEA Configuration
- scripts/migrate-to-provider-paths.js
- v1.2.0 Release
- sanitizeAccountName
- gitdock/site/js/index-hero.js
- site/js/index-hero.js
- Tentacle Decoration (Bottom)
- sanitizeAccountName
- README.md
- Project State (v1.2.0)
- Debian pre-removal script
- Customization
- What is this?
- Hub Database Layer (hub/db.js)
- install.sh: interactive CLI installer (system/user/uninstall)
- Publish v1.2.0 Script
- GitLab Provider Support Added
- GitDock Dashboard Screenshot v2 (JPG, 1504x688)
- lib/github-api.js
- Hub API Key Management
- Hub Data Stored
- Hub Hosted vs Self-Host
- GitHub REST API client
- Linux/macOS SEA build script
- Hub Lemon Squeezy Integration
- Dev Start Script (macOS/Linux)
- Hub Quick Start
- Git output parsers
- Hub Deploy on Render
- Test CI Workflow
- Dormant Repo Detection Library (lib/dormant.js)
- Git Output Parser Library (lib/git-parse.js)
- Hub Security
- Robots.txt
- GitDock Hub
- gitdock/package.json
- package.json
- gitdock/site/manifest.json
- site/manifest.json
- Troubleshooting
- Complete Feature List
- install.sh
- Step-by-Step Installation (Developer)
- Useful Commands
- Install prerequisites
- gitdock/scripts/build-sea.sh
- scripts/build-sea.sh
- DEBIAN/postinst
- DEBIAN/postrm
- DEBIAN/prerm
- gitdock/start.sh
- debian/postinst
- debian/postrm
- debian/prerm
- start.sh

## God Nodes (most connected - your core abstractions)
1. `getDb()` - 20 edges
2. `getDb()` - 20 edges
3. `GitLab Implementation Plan` - 17 edges
4. `GitLab Support — User Testing Guide` - 14 edges
5. `loadConfig()` - 12 edges
6. `loadConfig()` - 12 edges
7. `dev.sh script` - 11 edges
8. `migrate()` - 11 edges
9. `dev.sh script` - 11 edges
10. `migrate()` - 11 edges

## Surprising Connections (you probably didn't know these)
- `PR Body: Test Suite Addition` --references--> `API Integration Tests`  [EXTRACTED]
  scripts/pr-test-suite-body.md → test/api.integration.test.js
- `PR Body: Test Suite Addition` --references--> `Dormant Detection Tests`  [EXTRACTED]
  scripts/pr-test-suite-body.md → test/dormant.test.js
- `PR Body: Test Suite Addition` --references--> `Git Parse Tests`  [EXTRACTED]
  scripts/pr-test-suite-body.md → test/git-parse.test.js
- `getRepoStatus()` --calls--> `parseStatusPorcelain()`  [EXTRACTED]
  server.js → lib/git-parse.js
- `getRepoStatus()` --calls--> `parseStatusBranchLine()`  [EXTRACTED]
  server.js → lib/git-parse.js

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **GitDock Automated Test Suite** — test_api_integration_test_js, test_dormant_test_js, test_git_parse_test_js, test_helpers_http_test_helpers [EXTRACTED 0.85]
- **GitDock Public Website** — site_index_html, site_download_html, site_privacy_html, site_terms_html, site_manifest_json, site_robots_txt [EXTRACTED 0.85]
- **Hub authentication and authorization subsystem** — debian_gitdock_opt_gitdock_hub_auth_hub_auth, debian_gitdock_opt_gitdock_hub_db_hub_db, debian_gitdock_opt_gitdock_hub_server_hub_server [EXTRACTED 1.00]
- **Multi-provider repo management layer** — debian_gitdock_opt_gitdock_lib_provider_routing_dispatch, debian_gitdock_opt_gitdock_lib_security_utilities, debian_gitdock_opt_gitdock_lib_scan_repos_scanner [EXTRACTED 1.00]
- **Isomorphic REST API client pattern (native https)** — debian_gitdock_opt_gitdock_lib_github_api_client, debian_gitdock_opt_gitdock_lib_gitlab_api_client [INFERRED 0.90]

## Communities (117 total, 30 thin omitted)

### Community 0 - "hub/server.js"
Cohesion: 0.05
Nodes (29): Hub: CSRF via cookie+header double-submit pattern, Hub: Lemon Squeezy webhooks for subscription management, Hub: Free plan limited to 1 machine, Pro unlimited, Hub: SSE broadcast per-user for real-time dashboard, apiKeyFromHeader(), bcrypt, createSession(), crypto (+21 more)

### Community 1 - "gitdock/server.js"
Cohesion: 0.05
Nodes (36): Security: CSRF via x-gitdock header, Dual auth: PAT token + SSH key, Git operations with shell-free execFileSync + sanitization, Hub Agent: multi-machine sync via periodic snapshots, Provider known_hosts auto-configuration, Security: localhost-only binding, OS credential store (Keychain/Windows Vault/secret-tool), SSE real-time operation updates (+28 more)

### Community 2 - "gitdock/hub/server.js"
Cohesion: 0.05
Nodes (24): apiKeyFromHeader(), bcrypt, createSession(), crypto, db, getSecret(), resolveApiKey(), sessions (+16 more)

### Community 3 - "scripts/migrate-to-provider-paths.js"
Cohesion: 0.13
Nodes (26): buildRepoLookupMap(), findClonedRepo(), fs, path, scanLocalRepos(), security, BASE_DIR, CONFIG_PATH (+18 more)

### Community 4 - "gitdock/lib/security.js"
Cohesion: 0.09
Nodes (20): buildRepoLookupMap(), findClonedRepo(), fs, path, scanLocalRepos(), security, GITHUB_OFFICIAL_KNOWN_HOSTS_LINES, GITLAB_OFFICIAL_KNOWN_HOSTS_LINES (+12 more)

### Community 5 - "server.js"
Cohesion: 0.06
Nodes (25): activeOperations, CONFIG_PATH, execBase, { execSync, spawn, execFileSync, spawnSync }, express, fs, ghQueue, githubApi (+17 more)

### Community 6 - "workspace.js"
Cohesion: 0.20
Nodes (15): activateWorkspace(), addWorkspace(), ensureGitDockDir(), fs, getActiveWorkspace(), isWorkspaceConfigured(), listWorkspaces(), loadData() (+7 more)

### Community 7 - "gitdock/test/migration.test.js"
Cohesion: 0.18
Nodes (10): assert, BASE_DIR, { describe, it, before, after }, fs, initRepo(), mkdir(), os, path (+2 more)

### Community 8 - "gitdock/hub/db.js"
Cohesion: 0.14
Nodes (24): createApiKey(), createUser(), Database, DB_PATH, deleteMachine(), fs, getAllSnapshots(), getApiKeyHashesForVerification() (+16 more)

### Community 9 - "hub/db.js"
Cohesion: 0.14
Nodes (24): createApiKey(), createUser(), Database, DB_PATH, deleteMachine(), fs, getAllSnapshots(), getApiKeyHashesForVerification() (+16 more)

### Community 10 - "test/api.integration.test.js"
Cohesion: 0.09
Nodes (20): app, { api }, { app }, assert, { describe, it, before }, fs, os, path (+12 more)

### Community 11 - "dependencies"
Cohesion: 0.08
Nodes (23): bcryptjs, better-sqlite3-multiple-ciphers, cookie-parser, dotenv, express, express-rate-limit, helmet, dependencies (+15 more)

### Community 12 - "dependencies"
Cohesion: 0.08
Nodes (23): dependencies, bcryptjs, better-sqlite3-multiple-ciphers, cookie-parser, dotenv, express, express-rate-limit, helmet (+15 more)

### Community 13 - "lib/security.js"
Cohesion: 0.06
Nodes (29): assert, { describe, it }, os, path, security, lib/dormant.js, lib/git-parse.js, GITHUB_OFFICIAL_KNOWN_HOSTS_LINES (+21 more)

### Community 14 - "gitdock/scripts/migrate-to-provider-paths.js"
Cohesion: 0.19
Nodes (20): BASE_DIR, CONFIG_PATH, DO_UNDO, DRY_RUN, exists(), fs, info(), isDirEmpty() (+12 more)

### Community 15 - "GitLab Implementation Plan"
Cohesion: 0.10
Nodes (20): Architecture Options, Phase 2: GitLab API Client, Phase 3: SSH & Git Operations, Phase 4: Local Repo Scanner, Phase 5: Account Management UI, Phase 6: Hub & Agent, Phase 7: One-Time Migration, Phase 8: Testing & Polish (+12 more)

### Community 16 - "Landing Page"
Cohesion: 0.14
Nodes (19): Frontend: scroll-reveal + spotlight + particle network, Hero canvas particle network animation, Hero Particle System, Platform Detection and OS Switching, PR Body: Download Page Improvements, PR Body: Mobile Preview Fix, Scroll Reveal Animation, Download Page (+11 more)

### Community 17 - "gitdock/lib/provider-routing.js"
Cohesion: 0.12
Nodes (14): getCloneUrl(), getLocalDir(), getProviderDir(), getRepoPath(), getSshHost(), path, security, assert (+6 more)

### Community 18 - "GitLab Support — User Testing Guide"
Cohesion: 0.07
Nodes (26): Build Release CI Workflow, 10. One-Time Migration (existing installs only), 11. Self-Hosted GitLab Instance, 12. Edge Cases, 1. Account Creation — GitLab Provider, 2. Setup Timeline — GitLab, 3. Repo Listing — Provider Badges and FullPath, 4. Cloning a GitLab Repo (+18 more)

### Community 19 - "Branding element: GitDock octopus logo, 1024x1024 RGB"
Cohesion: 0.13
Nodes (16): Branding element: GitDock octopus logo, 1024x1024 RGB, GitDock Hub Logo (full size), Branding element: GitDock octopus logo with transparent background, 500x500 RGBA, GitDock Hub Logo (transparent background), Navigation header with account selector and settings, Repository list table with status indicators, GitDock Dashboard UI screenshot (landing page), Dashboard UI layout: repo listing, account management, git operations panel, 3296x1248 (+8 more)

### Community 20 - "gitdock/lib/gitlab-api.js"
Cohesion: 0.23
Nodes (13): getGitlabCommits(), getGitlabProjectDetails(), getGitlabReadme(), getGitlabRepoExtras(), gitlabListAllPages(), gitlabRequestJson(), https, listGitlabRepos() (+5 more)

### Community 21 - "lib/gitlab-api.js"
Cohesion: 0.09
Nodes (27): [1.2.0] - 2026-05-21, Added, Added, Changed, Changed, Changelog, Fixed, Fixed (+19 more)

### Community 22 - "Hub Dashboard HTML"
Cohesion: 0.29
Nodes (7): Hub Dashboard HTML, Hub Login/Register UI, Hub Machine Detail View, Hub Overview View, Hub Provider Badges CSS, Hub Settings View, Hub Sync Issues

### Community 23 - "gitdock/test/api.integration.test.js"
Cohesion: 0.09
Nodes (20): app, { api }, { app }, assert, { describe, it, before }, fs, os, path (+12 more)

### Community 24 - "lib/provider-routing.js"
Cohesion: 0.24
Nodes (7): getCloneUrl(), getLocalDir(), getProviderDir(), getRepoPath(), getSshHost(), path, security

### Community 26 - "Site Landing Page"
Cohesion: 0.15
Nodes (13): Site Download Page, Site Landing Page, Site Privacy Policy, Site Terms of Service, PR: Mobile Preview Fix, PR: Site Download Page, Site Features Section, Site Hero Section (+5 more)

### Community 27 - "gitdock/lib/github-api.js"
Cohesion: 0.47
Nodes (5): githubListAllPages(), githubRequestJson(), https, parseLinkHeader(), validateAccountToken()

### Community 28 - "test/migration.test.js"
Cohesion: 0.18
Nodes (10): assert, BASE_DIR, { describe, it, before, after }, fs, initRepo(), mkdir(), os, path (+2 more)

### Community 29 - "loadConfig"
Cohesion: 0.29
Nodes (12): cleanupOrphanedGitconfigs(), collectHubSnapshot(), deleteHubApiKey(), ensureMachineId(), getAccounts(), getHubApiKey(), loadConfig(), runPathMigration() (+4 more)

### Community 30 - "lib/security.js"
Cohesion: 0.33
Nodes (6): Provider abstraction (GitHub/GitLab dispatch), Multi-account SSH key management (writeSSHConfigBlock), lib/provider-routing.js, lib/security.js, API Integration Tests, HTTP Test Helpers (supertest wrapper)

### Community 31 - "gitdock/workspace.js"
Cohesion: 0.20
Nodes (15): activateWorkspace(), addWorkspace(), ensureGitDockDir(), fs, getActiveWorkspace(), isWorkspaceConfigured(), listWorkspaces(), loadData() (+7 more)

### Community 32 - "githubApiForAccount"
Cohesion: 0.20
Nodes (10): enqueueGh(), getAccountToken(), getRepoPath(), githubApiForAccount(), loadPersistedTokensOnStartup(), makeUniqueLocalRepoName(), readOsStoredToken(), switchGHAccount() (+2 more)

### Community 34 - "getRepoStatus"
Cohesion: 0.25
Nodes (7): parseStatusBranchLine(), parseStatusPorcelain(), getRepoOperation(), getRepoStatus(), assert, { describe, it }, gitParse

### Community 35 - "githubApiForAccount"
Cohesion: 0.18
Nodes (11): enqueueGh(), getAccountToken(), getRepoPath(), githubApiForAccount(), loadPersistedTokensOnStartup(), makeUniqueLocalRepoName(), readOsStoredToken(), runCommand() (+3 more)

### Community 36 - "loadConfig"
Cohesion: 0.29
Nodes (12): cleanupOrphanedGitconfigs(), collectHubSnapshot(), deleteHubApiKey(), ensureMachineId(), getAccounts(), getHubApiKey(), loadConfig(), runPathMigration() (+4 more)

### Community 37 - "AGENTS.md"
Cohesion: 0.40
Nodes (4): Background, Key Files, Package / Install, Patterns

### Community 38 - "Hub Express server"
Cohesion: 0.32
Nodes (8): Hub authentication module, Hub SQLite database layer, Hub Express server, Dormant repo detection, Provider dispatch layer, Local repo scanner, Input sanitization and URL parsers, One-time provider path migration

### Community 39 - "writeSSHConfigBlock"
Cohesion: 0.22
Nodes (9): sanitizeSshHostAlias(), backupFile(), ensureGitHubKnownHosts(), ensureProviderKnownHosts(), ensureSSHDir(), getSSHDir(), syncManagedSshConfigToAccounts(), testAccountSshConnection() (+1 more)

### Community 40 - "Project State v1.2.0"
Cohesion: 0.25
Nodes (8): Debian Packaging, GitDock Project Overview, Hub Provider Support, Install Methods, Key Files Summary, Project State v1.2.0, Provider Dispatch Layer, Tech Stack & Patterns

### Community 41 - "GitLab Support — Impact Analysis & Implementation Plan"
Cohesion: 0.06
Nodes (33): 0. Workspace Directory Structure Change, 1.1 Scope of Changes, 1.2 Key Differences Between GitHub & GitLab, 1.3 Risk Assessment, 1. Impact Analysis, 2. Architecture Options, 3. Implementation Plan — Phases, 4. Detailed File Change Map (+25 more)

### Community 42 - "test/gitlab-paths.test.js"
Cohesion: 0.25
Nodes (7): assert, BASE_DIR, { describe, it }, fs, os, path, routing

### Community 43 - "Contributing Guide"
Cohesion: 0.29
Nodes (7): Code Style Rules, Contributing Guide, Development Setup, PR Submission Process, PR: Test Suite Addition, Release & Versioning Policy, Testing Guide

### Community 44 - "Dashboard UI Elements"
Cohesion: 0.29
Nodes (7): Dashboard Git Modal, Main Dashboard HTML, Dashboard Modals, Dashboard Repo Cards, Dashboard Sidebar, Dashboard Top Bar, Dashboard UI Elements

### Community 45 - "gitdock/test/dormant.test.js"
Cohesion: 0.29
Nodes (3): assert, { describe, it }, dormant

### Community 46 - "README Documentation"
Cohesion: 0.29
Nodes (7): README Documentation, Hub Multi-Machine Sync, Prerequisites Table, Privacy & Data Handling, Project Structure Layout, Security Measures, Tech Stack Summary

### Community 47 - "GitDock Tentacle Bottom"
Cohesion: 0.81
Nodes (7): GitDock OG Card White, GitDock Tentacle Bottom, GitDock Tentacle Bottom-Left, GitDock Tentacle Left 2, GitDock Tentacle Left, GitDock Tentacle Right, GitDock Tentacle Top

### Community 48 - "test/dormant.test.js"
Cohesion: 0.29
Nodes (3): assert, { describe, it }, dormant

### Community 49 - "getRepoStatus"
Cohesion: 0.22
Nodes (8): parseStatusBranchLine(), parseStatusPorcelain(), getRepoOperation(), getRepoStatus(), runCommand(), assert, { describe, it }, gitParse

### Community 50 - "gitdock/scripts/dev.sh"
Cohesion: 0.35
Nodes (15): cmd_build(), cmd_commit(), cmd_deps(), cmd_package(), cmd_release(), cmd_status(), cmd_tag(), cmd_test() (+7 more)

### Community 51 - "scripts/dev.sh"
Cohesion: 0.35
Nodes (15): cmd_build(), cmd_commit(), cmd_deps(), cmd_package(), cmd_release(), cmd_status(), cmd_tag(), cmd_test() (+7 more)

### Community 52 - "lib/github-api.js"
Cohesion: 0.38
Nodes (6): Phase 1: Foundation Path Restructure, githubListAllPages(), githubRequestJson(), https, parseLinkHeader(), validateAccountToken()

### Community 53 - "GitDock Logo (Root)"
Cohesion: 0.53
Nodes (6): GitDock Logo (Root), GitDock Logo (Transparent Background), GitDock Hub Logo, GitDock Hub Logo (Transparent Background), GitDock Logo (Site), GitDock Logo (Site, Transparent Preview)

### Community 54 - "writeSSHConfigBlock"
Cohesion: 0.22
Nodes (9): sanitizeSshHostAlias(), backupFile(), ensureGitHubKnownHosts(), ensureProviderKnownHosts(), ensureSSHDir(), getSSHDir(), syncManagedSshConfigToAccounts(), testAccountSshConnection() (+1 more)

### Community 55 - "SEA Configuration"
Cohesion: 0.67
Nodes (3): SEA (Single Executable Application) config, Build SEA Executable (Windows), SEA Configuration

### Community 56 - "scripts/migrate-to-provider-paths.js"
Cohesion: 0.40
Nodes (5): Legacy flat path to provider-based path migration, scripts/migrate-to-provider-paths.js, One-Time Migration Phase 7, Rationale: Separate Repos by Provider, Workspace Directory Restructure

### Community 57 - "v1.2.0 Release"
Cohesion: 0.67
Nodes (3): Release Notes v1.2.0, Release PR Body v1.2.0, v1.2.0 Release

### Community 58 - "sanitizeAccountName"
Cohesion: 0.50
Nodes (5): sanitizeAccountName(), deleteAccountToken(), deleteOsStoredToken(), setAccountToken(), writeOsStoredToken()

### Community 59 - "gitdock/site/js/index-hero.js"
Cohesion: 0.60
Nodes (3): init(), makeParticle(), resize()

### Community 60 - "site/js/index-hero.js"
Cohesion: 0.60
Nodes (3): init(), makeParticle(), resize()

### Community 61 - "Tentacle Decoration (Bottom)"
Cohesion: 1.00
Nodes (5): Tentacle Decoration (Bottom), Tentacle Decoration (Bottom-Left), Tentacle Decoration (Left 2), Tentacle Decoration (Right), Tentacle Decoration (Top)

### Community 62 - "sanitizeAccountName"
Cohesion: 0.50
Nodes (5): sanitizeAccountName(), deleteAccountToken(), deleteOsStoredToken(), setAccountToken(), writeOsStoredToken()

### Community 63 - "README.md"
Cohesion: 0.22
Nodes (8): Advanced: Manual SSH configuration, Contributing, Data and Privacy, Hub (multi-machine sync), Project Structure, Quick Start (Standalone Executable), Security, Tech Stack

### Community 64 - "Project State (v1.2.0)"
Cohesion: 0.25
Nodes (8): Fixed, Packaging & Deployment ✓, Phase 1 ✓ — Foundation: Path Restructure + Provider Abstraction, Phase 6 ✓ — Hub & Agent Provider Support, Phase 7 ✓ — One-Time Migration, Phase 8 ✓ — Multi-Workspace Management, Project State (v1.2.0), Remaining Phases

### Community 65 - "Debian pre-removal script"
Cohesion: 0.67
Nodes (3): Debian post-installation script, Debian post-removal script, Debian pre-removal script

### Community 66 - "Customization"
Cohesion: 0.67
Nodes (3): Adding or editing accounts, Changing the port, Customization

### Community 67 - "What is this?"
Cohesion: 0.67
Nodes (3): What is this?, What it is NOT, Who is it for?

### Community 68 - "Hub Database Layer (hub/db.js)"
Cohesion: 0.67
Nodes (3): Hub Authentication (hub/auth.js), Hub Database Layer (hub/db.js), Hub SQLite Schema (users/api_keys/machines/snapshots/audit_log)

### Community 70 - "Publish v1.2.0 Script"
Cohesion: 1.00
Nodes (3): Publish v1.2.0 Script, Release Notes v1.2.0, Release PR Body v1.2.0

### Community 72 - "GitDock Dashboard Screenshot v2 (JPG, 1504x688)"
Cohesion: 0.67
Nodes (3): GitDock Dashboard Screenshot (PNG), GitDock Dashboard Screenshot v2 (JPG, 1504x688), GitDock OG Card (White)

### Community 97 - "GitDock Hub"
Cohesion: 0.18
Nodes (10): API key management, Data stored, Deploy on Render, GitDock Hub, Hosted vs self-host, Lemon Squeezy (hosted Hub only), Local GitDock config (optional), Quick start (local) (+2 more)

### Community 100 - "gitdock/package.json"
Cohesion: 0.07
Nodes (26): esbuild, express, postject, supertest, bin, dependencies, express, description (+18 more)

### Community 101 - "package.json"
Cohesion: 0.07
Nodes (26): bin, dependencies, express, description, devDependencies, esbuild, postject, supertest (+18 more)

### Community 103 - "gitdock/site/manifest.json"
Cohesion: 0.22
Nodes (8): background_color, description, display, icons, name, short_name, start_url, theme_color

### Community 104 - "site/manifest.json"
Cohesion: 0.22
Nodes (8): background_color, description, display, icons, name, short_name, start_url, theme_color

### Community 105 - "Troubleshooting"
Cohesion: 0.22
Nodes (9): Clone fails with "Permission denied (publickey)", "Permission denied" when removing a clone (Windows), Repos from one account don't show up, "Server offline" in the dashboard, SSH Agent doesn't persist (macOS), SSH Agent won't start (Windows), Transfer fails with "Repository has already been taken", Transfer requests email confirmation (+1 more)

### Community 112 - "Complete Feature List"
Cohesion: 0.29
Nodes (7): Bulk Actions, Complete Feature List, Editor and Terminal Integration, Git Operations, Interface and UX, Transfer and Migration, Viewing and Organization

### Community 124 - "install.sh"
Cohesion: 0.70
Nodes (4): err(), log(), install.sh script, warn()

### Community 126 - "Step-by-Step Installation (Developer)"
Cohesion: 0.40
Nodes (5): 1. Clone and install, 2. Start the server, 3. Add your account, 4. Add more accounts (optional), Step-by-Step Installation (Developer)

### Community 127 - "Useful Commands"
Cohesion: 0.40
Nodes (5): Git, GitHub / GitLab, Server management, SSH, Useful Commands

### Community 128 - "Install prerequisites"
Cohesion: 0.40
Nodes (5): Install prerequisites, Linux (Ubuntu/Debian), macOS, Prerequisites, Windows

## Knowledge Gaps
- **530 isolated node(s):** `bcrypt`, `crypto`, `db`, `sessions`, `Database` (+525 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **30 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Phase 1: Foundation Path Restructure` connect `lib/github-api.js` to `lib/provider-routing.js`, `gitdock/server.js`, `lib/security.js`, `GitLab Implementation Plan`?**
  _High betweenness centrality (0.058) - this node is a cross-community bridge._
- **Why does `GitLab Support — Impact Analysis & Implementation Plan` connect `GitLab Support — Impact Analysis & Implementation Plan` to `scripts/migrate-to-provider-paths.js`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **What connects `bcrypt`, `crypto`, `db` to the rest of the system?**
  _530 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `hub/server.js` be split into smaller, more focused modules?**
  _Cohesion score 0.047474747474747475 - nodes in this community are weakly interconnected._
- **Should `gitdock/server.js` be split into smaller, more focused modules?**
  _Cohesion score 0.047474747474747475 - nodes in this community are weakly interconnected._
- **Should `gitdock/hub/server.js` be split into smaller, more focused modules?**
  _Cohesion score 0.05384615384615385 - nodes in this community are weakly interconnected._
- **Should `scripts/migrate-to-provider-paths.js` be split into smaller, more focused modules?**
  _Cohesion score 0.12643678160919541 - nodes in this community are weakly interconnected._