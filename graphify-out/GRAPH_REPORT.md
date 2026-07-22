# Graph Report - /home/sysadmin/Projects/00-github/GitDock/skp64-pvt01/github-dock  (2026-07-22)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 983 nodes · 1299 edges · 92 communities (77 shown, 15 thin omitted)
- Extraction: 80% EXTRACTED · 20% INFERRED · 0% AMBIGUOUS · INFERRED: 265 edges (avg confidence: 0.59)
- Token cost: 3,630 input · 915 output

## Graph Freshness
- Built from commit: `de72b83e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Hub Auth and Subscription
- Security and Multi-Machine Sync
- Authentication Core Logic
- Build and Release Workflow
- Repository Scanning and Security
- Server Operations and API
- Package Metadata and Dependencies
- Package Metadata and Dependencies
- Database Access and Management
- Database Access and Management
- API Integration Testing
- Hub Server Dependencies
- Hub Server Dependencies
- Security and Host Key Management
- Migration Scripts and Utilities
- GitLab Integration Planning
- Frontend UI and Animations
- Provider Routing and Paths
- Workspace Management
- Branding and Dashboard UI
- GitLab API Client
- GitLab API Client
- Hub Dashboard and UI
- API Integration Testing
- Provider Routing and Security
- Debian Packaging Scripts
- Site Content and Pages
- Migration Testing
- Migration Testing
- Hub Config and Agent Management
- Security and Dormant Repo Tests
- Workspace Utilities
- GitHub API and Repo Operations
- PWA Manifest
- Git Output Parsing
- GitHub Account and Token Management
- Hub Config and Agent Management
- PWA Manifest
- Hub Core and Repo Management
- SSH Config and Host Management
- Project Overview and Packaging
- Repository Scanning and Security
- GitLab Path Testing
- Contribution and Code Style
- Dashboard UI Components
- Dormant Repository Detection
- Project Documentation and Sync
- Branding Graphics and Decorations
- Dormant Repository Detection
- Git Output Parsing
- Provider Abstraction and SSH Keys
- GitHub API Client
- GitHub API Foundation
- Branding Logos
- SSH Config and Host Management
- Security Testing
- Path Migration and Workspace Restructure
- Release Notes and GitLab Support
- Account Token Management
- Hero Animation Script
- Hero Animation Script
- Tentacle Decorations
- Account Token Management
- Git Config and Account Validation
- GitLab Security Testing
- Debian Packaging Scripts
- SEA Build Scripts
- Hub Core Modules
- Release Publishing and Notes
- Server Startup Utilities
- Dashboard Screenshots
- GitHub REST API Client
- Debian Post-Install Script
- Debian Post-Removal Script
- Debian Pre-Removal Script
- GitHub and GitLab API Clients
- SEA Build Scripts
- Start Script
- Dev Start Scripts
- Start Script
- Git Output Parsers
- Test CI Workflow
- Dormant Repo Detection Library
- Git Output Parser Library
- Robots.txt

## God Nodes (most connected - your core abstractions)
1. `getDb()` - 20 edges
2. `getDb()` - 20 edges
3. `GitLab Implementation Plan` - 17 edges
4. `loadConfig()` - 12 edges
5. `loadConfig()` - 12 edges
6. `migrate()` - 11 edges
7. `migrate()` - 11 edges
8. `Site Landing Page` - 11 edges
9. `Landing Page` - 10 edges
10. `undoMigration()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `PR Body: Test Suite Addition` --references--> `API Integration Tests`  [EXTRACTED]
  scripts/pr-test-suite-body.md → test/api.integration.test.js
- `PR Body: Test Suite Addition` --references--> `Dormant Detection Tests`  [EXTRACTED]
  scripts/pr-test-suite-body.md → test/dormant.test.js
- `PR Body: Test Suite Addition` --references--> `Git Parse Tests`  [EXTRACTED]
  scripts/pr-test-suite-body.md → test/git-parse.test.js
- `Download Page` --references--> `Web App Manifest`  [EXTRACTED]
  site/download.html → site/manifest.json
- `Landing Page` --references--> `Web App Manifest`  [EXTRACTED]
  site/index.html → site/manifest.json

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **GitDock Automated Test Suite** — test_api_integration_test_js, test_dormant_test_js, test_git_parse_test_js, test_helpers_http_test_helpers [EXTRACTED 0.85]
- **GitDock Public Website** — site_index_html, site_download_html, site_privacy_html, site_terms_html, site_manifest_json, site_robots_txt [EXTRACTED 0.85]
- **Hub authentication and authorization subsystem** — debian_gitdock_opt_gitdock_hub_auth_hub_auth, debian_gitdock_opt_gitdock_hub_db_hub_db, debian_gitdock_opt_gitdock_hub_server_hub_server [EXTRACTED 1.00]
- **Multi-provider repo management layer** — debian_gitdock_opt_gitdock_lib_provider_routing_dispatch, debian_gitdock_opt_gitdock_lib_security_utilities, debian_gitdock_opt_gitdock_lib_scan_repos_scanner [EXTRACTED 1.00]
- **Isomorphic REST API client pattern (native https)** — debian_gitdock_opt_gitdock_lib_github_api_client, debian_gitdock_opt_gitdock_lib_gitlab_api_client [INFERRED 0.90]

## Communities (92 total, 15 thin omitted)

### Community 0 - "Hub Auth and Subscription"
Cohesion: 0.05
Nodes (29): Hub: CSRF via cookie+header double-submit pattern, Hub: Lemon Squeezy webhooks for subscription management, Hub: Free plan limited to 1 machine, Pro unlimited, Hub: SSE broadcast per-user for real-time dashboard, apiKeyFromHeader(), bcrypt, createSession(), crypto (+21 more)

### Community 1 - "Security and Multi-Machine Sync"
Cohesion: 0.05
Nodes (36): Security: CSRF via x-gitdock header, Dual auth: PAT token + SSH key, Git operations with shell-free execFileSync + sanitization, Hub Agent: multi-machine sync via periodic snapshots, Provider known_hosts auto-configuration, Security: localhost-only binding, OS credential store (Keychain/Windows Vault/secret-tool), SSE real-time operation updates (+28 more)

### Community 2 - "Authentication Core Logic"
Cohesion: 0.05
Nodes (24): apiKeyFromHeader(), bcrypt, createSession(), crypto, db, getSecret(), resolveApiKey(), sessions (+16 more)

### Community 3 - "Build and Release Workflow"
Cohesion: 0.09
Nodes (30): SEA (Single Executable Application) config, CONTRIBUTING.md Contribution Guide, CONTRIBUTING.md Release and Versioning Policy, CONTRIBUTING.md Testing Setup Description, Build Release CI Workflow, Pull Request Template, Build SEA Executable (Windows), build-sea.sh script (+22 more)

### Community 4 - "Repository Scanning and Security"
Cohesion: 0.09
Nodes (20): buildRepoLookupMap(), findClonedRepo(), fs, path, scanLocalRepos(), security, GITHUB_OFFICIAL_KNOWN_HOSTS_LINES, GITLAB_OFFICIAL_KNOWN_HOSTS_LINES (+12 more)

### Community 5 - "Server Operations and API"
Cohesion: 0.06
Nodes (22): activeOperations, CONFIG_PATH, execBase, { execSync, spawn, execFileSync, spawnSync }, express, fs, ghQueue, githubApi (+14 more)

### Community 6 - "Package Metadata and Dependencies"
Cohesion: 0.07
Nodes (26): bin, dependencies, express, description, devDependencies, esbuild, postject, supertest (+18 more)

### Community 7 - "Package Metadata and Dependencies"
Cohesion: 0.07
Nodes (26): bin, dependencies, express, description, devDependencies, esbuild, postject, supertest (+18 more)

### Community 8 - "Database Access and Management"
Cohesion: 0.14
Nodes (24): createApiKey(), createUser(), Database, DB_PATH, deleteMachine(), fs, getAllSnapshots(), getApiKeyHashesForVerification() (+16 more)

### Community 9 - "Database Access and Management"
Cohesion: 0.14
Nodes (24): createApiKey(), createUser(), Database, DB_PATH, deleteMachine(), fs, getAllSnapshots(), getApiKeyHashesForVerification() (+16 more)

### Community 10 - "API Integration Testing"
Cohesion: 0.09
Nodes (20): app, { api }, { app }, assert, { describe, it, before }, fs, os, path (+12 more)

### Community 11 - "Hub Server Dependencies"
Cohesion: 0.08
Nodes (23): dependencies, bcryptjs, better-sqlite3-multiple-ciphers, cookie-parser, dotenv, express, express-rate-limit, helmet (+15 more)

### Community 12 - "Hub Server Dependencies"
Cohesion: 0.08
Nodes (23): dependencies, bcryptjs, better-sqlite3-multiple-ciphers, cookie-parser, dotenv, express, express-rate-limit, helmet (+15 more)

### Community 13 - "Security and Host Key Management"
Cohesion: 0.13
Nodes (11): GITHUB_OFFICIAL_KNOWN_HOSTS_LINES, GITLAB_OFFICIAL_KNOWN_HOSTS_LINES, parseGitHubOwnerRepoFromRemote(), parseGitHubRepoUrl(), parseGitLabRepoFromRemote(), parseGitLabRepoUrl(), parseRepoUrl(), path (+3 more)

### Community 14 - "Migration Scripts and Utilities"
Cohesion: 0.19
Nodes (20): BASE_DIR, CONFIG_PATH, DO_UNDO, DRY_RUN, exists(), fs, info(), isDirEmpty() (+12 more)

### Community 15 - "GitLab Integration Planning"
Cohesion: 0.10
Nodes (20): Architecture Options, Phase 2: GitLab API Client, Phase 3: SSH & Git Operations, Phase 4: Local Repo Scanner, Phase 5: Account Management UI, Phase 6: Hub & Agent, Phase 7: One-Time Migration, Phase 8: Testing & Polish (+12 more)

### Community 16 - "Frontend UI and Animations"
Cohesion: 0.14
Nodes (19): Frontend: scroll-reveal + spotlight + particle network, Hero canvas particle network animation, Hero Particle System, Platform Detection and OS Switching, PR Body: Download Page Improvements, PR Body: Mobile Preview Fix, Scroll Reveal Animation, Download Page (+11 more)

### Community 17 - "Provider Routing and Paths"
Cohesion: 0.12
Nodes (14): getCloneUrl(), getLocalDir(), getProviderDir(), getRepoPath(), getSshHost(), path, security, assert (+6 more)

### Community 18 - "Workspace Management"
Cohesion: 0.20
Nodes (15): activateWorkspace(), addWorkspace(), ensureGitDockDir(), fs, getActiveWorkspace(), isWorkspaceConfigured(), listWorkspaces(), loadData() (+7 more)

### Community 19 - "Branding and Dashboard UI"
Cohesion: 0.13
Nodes (16): Branding element: GitDock octopus logo, 1024x1024 RGB, GitDock Hub Logo (full size), Branding element: GitDock octopus logo with transparent background, 500x500 RGBA, GitDock Hub Logo (transparent background), Navigation header with account selector and settings, Repository list table with status indicators, GitDock Dashboard UI screenshot (landing page), Dashboard UI layout: repo listing, account management, git operations panel, 3296x1248 (+8 more)

### Community 20 - "GitLab API Client"
Cohesion: 0.23
Nodes (13): getGitlabCommits(), getGitlabProjectDetails(), getGitlabReadme(), getGitlabRepoExtras(), gitlabListAllPages(), gitlabRequestJson(), https, listGitlabRepos() (+5 more)

### Community 21 - "GitLab API Client"
Cohesion: 0.23
Nodes (13): getGitlabCommits(), getGitlabProjectDetails(), getGitlabReadme(), getGitlabRepoExtras(), gitlabListAllPages(), gitlabRequestJson(), https, listGitlabRepos() (+5 more)

### Community 22 - "Hub Dashboard and UI"
Cohesion: 0.13
Nodes (15): Hub Dashboard HTML, Hub README, Hub API Key Management, Hub Data Stored, Hub Hosted vs Self-Host, Hub Lemon Squeezy Integration, Hub Login/Register UI, Hub Machine Detail View (+7 more)

### Community 23 - "API Integration Testing"
Cohesion: 0.15
Nodes (13): app, { api }, { app }, assert, { describe, it, before }, fs, os, path (+5 more)

### Community 24 - "Provider Routing and Security"
Cohesion: 0.19
Nodes (7): getCloneUrl(), getLocalDir(), getProviderDir(), getRepoPath(), getSshHost(), path, security

### Community 25 - "Debian Packaging Scripts"
Cohesion: 0.19
Nodes (9): Debian packaging: debian/ with dpkg-buildpackage, install.sh: interactive CLI installer (system/user/uninstall), postinst script, postrm script, prerm script, err(), log(), install.sh script (+1 more)

### Community 26 - "Site Content and Pages"
Cohesion: 0.15
Nodes (13): Site Download Page, Site Landing Page, Site Privacy Policy, Site Terms of Service, PR: Mobile Preview Fix, PR: Site Download Page, Site Features Section, Site Hero Section (+5 more)

### Community 27 - "Migration Testing"
Cohesion: 0.18
Nodes (10): assert, BASE_DIR, { describe, it, before, after }, fs, initRepo(), mkdir(), os, path (+2 more)

### Community 28 - "Migration Testing"
Cohesion: 0.18
Nodes (10): assert, BASE_DIR, { describe, it, before, after }, fs, initRepo(), mkdir(), os, path (+2 more)

### Community 29 - "Hub Config and Agent Management"
Cohesion: 0.29
Nodes (12): cleanupOrphanedGitconfigs(), collectHubSnapshot(), deleteHubApiKey(), ensureMachineId(), getAccounts(), getHubApiKey(), loadConfig(), runPathMigration() (+4 more)

### Community 30 - "Security and Dormant Repo Tests"
Cohesion: 0.20
Nodes (10): assert, { describe, it }, os, path, security, lib/dormant.js, lib/git-parse.js, PR Body: Test Suite Addition (+2 more)

### Community 31 - "Workspace Utilities"
Cohesion: 0.22
Nodes (9): ensureGitDockDir(), fs, GITDOCK_DIR, isWorkspaceConfigured(), loadWorkspace(), os, path, saveWorkspace() (+1 more)

### Community 32 - "GitHub API and Repo Operations"
Cohesion: 0.22
Nodes (9): enqueueGh(), getAccountToken(), getRepoOperation(), getRepoStatus(), githubApiForAccount(), loadPersistedTokensOnStartup(), readOsStoredToken(), runCommand() (+1 more)

### Community 33 - "PWA Manifest"
Cohesion: 0.20
Nodes (9): PWA manifest with standalone display, background_color, description, display, icons, name, short_name, start_url (+1 more)

### Community 34 - "Git Output Parsing"
Cohesion: 0.22
Nodes (8): parseStatusBranchLine(), parseStatusPorcelain(), getRepoOperation(), getRepoStatus(), runCommand(), assert, { describe, it }, gitParse

### Community 35 - "GitHub Account and Token Management"
Cohesion: 0.20
Nodes (10): enqueueGh(), getAccountToken(), getRepoPath(), githubApiForAccount(), loadPersistedTokensOnStartup(), makeUniqueLocalRepoName(), readOsStoredToken(), switchGHAccount() (+2 more)

### Community 36 - "Hub Config and Agent Management"
Cohesion: 0.29
Nodes (12): cleanupOrphanedGitconfigs(), collectHubSnapshot(), deleteHubApiKey(), ensureMachineId(), getAccounts(), getHubApiKey(), loadConfig(), runPathMigration() (+4 more)

### Community 37 - "PWA Manifest"
Cohesion: 0.22
Nodes (8): background_color, description, display, icons, name, short_name, start_url, theme_color

### Community 38 - "Hub Core and Repo Management"
Cohesion: 0.32
Nodes (8): Hub authentication module, Hub SQLite database layer, Hub Express server, Dormant repo detection, Provider dispatch layer, Local repo scanner, Input sanitization and URL parsers, One-time provider path migration

### Community 39 - "SSH Config and Host Management"
Cohesion: 0.25
Nodes (8): sanitizeSshHostAlias(), ensureGitHubKnownHosts(), ensureProviderKnownHosts(), ensureSSHDir(), getSSHDir(), syncManagedSshConfigToAccounts(), testAccountSshConnection(), writeSSHConfigBlock()

### Community 40 - "Project Overview and Packaging"
Cohesion: 0.25
Nodes (8): Debian Packaging, GitDock Project Overview, Hub Provider Support, Install Methods, Key Files Summary, Project State v1.2.0, Provider Dispatch Layer, Tech Stack & Patterns

### Community 41 - "Repository Scanning and Security"
Cohesion: 0.32
Nodes (6): buildRepoLookupMap(), findClonedRepo(), fs, path, scanLocalRepos(), security

### Community 42 - "GitLab Path Testing"
Cohesion: 0.25
Nodes (7): assert, BASE_DIR, { describe, it }, fs, os, path, routing

### Community 43 - "Contribution and Code Style"
Cohesion: 0.29
Nodes (7): Code Style Rules, Contributing Guide, Development Setup, PR Submission Process, PR: Test Suite Addition, Release & Versioning Policy, Testing Guide

### Community 44 - "Dashboard UI Components"
Cohesion: 0.29
Nodes (7): Dashboard Git Modal, Main Dashboard HTML, Dashboard Modals, Dashboard Repo Cards, Dashboard Sidebar, Dashboard Top Bar, Dashboard UI Elements

### Community 45 - "Dormant Repository Detection"
Cohesion: 0.29
Nodes (3): assert, { describe, it }, dormant

### Community 46 - "Project Documentation and Sync"
Cohesion: 0.29
Nodes (7): README Documentation, Hub Multi-Machine Sync, Prerequisites Table, Privacy & Data Handling, Project Structure Layout, Security Measures, Tech Stack Summary

### Community 47 - "Branding Graphics and Decorations"
Cohesion: 0.81
Nodes (7): GitDock OG Card White, GitDock Tentacle Bottom, GitDock Tentacle Bottom-Left, GitDock Tentacle Left 2, GitDock Tentacle Left, GitDock Tentacle Right, GitDock Tentacle Top

### Community 48 - "Dormant Repository Detection"
Cohesion: 0.29
Nodes (3): assert, { describe, it }, dormant

### Community 49 - "Git Output Parsing"
Cohesion: 0.29
Nodes (3): assert, { describe, it }, gitParse

### Community 50 - "Provider Abstraction and SSH Keys"
Cohesion: 0.33
Nodes (6): Provider abstraction (GitHub/GitLab dispatch), Multi-account SSH key management (writeSSHConfigBlock), lib/provider-routing.js, lib/security.js, API Integration Tests, HTTP Test Helpers (supertest wrapper)

### Community 51 - "GitHub API Client"
Cohesion: 0.47
Nodes (5): githubListAllPages(), githubRequestJson(), https, parseLinkHeader(), validateAccountToken()

### Community 52 - "GitHub API Foundation"
Cohesion: 0.47
Nodes (5): Phase 1: Foundation Path Restructure, githubListAllPages(), githubRequestJson(), https, parseLinkHeader()

### Community 53 - "Branding Logos"
Cohesion: 0.53
Nodes (6): GitDock Logo (Root), GitDock Logo (Transparent Background), GitDock Hub Logo, GitDock Hub Logo (Transparent Background), GitDock Logo (Site), GitDock Logo (Site, Transparent Preview)

### Community 54 - "SSH Config and Host Management"
Cohesion: 0.33
Nodes (6): ensureGitHubKnownHosts(), ensureProviderKnownHosts(), ensureSSHDir(), getSSHDir(), syncManagedSshConfigToAccounts(), writeSSHConfigBlock()

### Community 55 - "Security Testing"
Cohesion: 0.33
Nodes (5): assert, { describe, it }, os, path, security

### Community 56 - "Path Migration and Workspace Restructure"
Cohesion: 0.40
Nodes (5): Legacy flat path to provider-based path migration, scripts/migrate-to-provider-paths.js, One-Time Migration Phase 7, Rationale: Separate Repos by Provider, Workspace Directory Restructure

### Community 57 - "Release Notes and GitLab Support"
Cohesion: 0.40
Nodes (5): Changelog, GitLab Provider Support Added, Release Notes v1.2.0, Release PR Body v1.2.0, v1.2.0 Release

### Community 58 - "Account Token Management"
Cohesion: 0.50
Nodes (5): sanitizeAccountName(), deleteAccountToken(), deleteOsStoredToken(), setAccountToken(), writeOsStoredToken()

### Community 59 - "Hero Animation Script"
Cohesion: 0.60
Nodes (3): init(), makeParticle(), resize()

### Community 60 - "Hero Animation Script"
Cohesion: 0.60
Nodes (3): init(), makeParticle(), resize()

### Community 61 - "Tentacle Decorations"
Cohesion: 1.00
Nodes (5): Tentacle Decoration (Bottom), Tentacle Decoration (Bottom-Left), Tentacle Decoration (Left 2), Tentacle Decoration (Right), Tentacle Decoration (Top)

### Community 62 - "Account Token Management"
Cohesion: 0.50
Nodes (4): deleteAccountToken(), deleteOsStoredToken(), setAccountToken(), writeOsStoredToken()

### Community 63 - "Git Config and Account Validation"
Cohesion: 0.50
Nodes (4): getRepoPath(), makeUniqueLocalRepoName(), validateAccount(), writeGitconfigForAccount()

### Community 64 - "GitLab Security Testing"
Cohesion: 0.50
Nodes (3): assert, { describe, it }, security

### Community 65 - "Debian Packaging Scripts"
Cohesion: 0.67
Nodes (3): Debian post-installation script, Debian post-removal script, Debian pre-removal script

### Community 68 - "Hub Core Modules"
Cohesion: 0.67
Nodes (3): Hub Authentication (hub/auth.js), Hub Database Layer (hub/db.js), Hub SQLite Schema (users/api_keys/machines/snapshots/audit_log)

### Community 70 - "Release Publishing and Notes"
Cohesion: 1.00
Nodes (3): Publish v1.2.0 Script, Release Notes v1.2.0, Release PR Body v1.2.0

### Community 71 - "Server Startup Utilities"
Cohesion: 0.67
Nodes (3): logServerInfo(), openBrowser(), startServer()

### Community 72 - "Dashboard Screenshots"
Cohesion: 0.67
Nodes (3): GitDock Dashboard Screenshot (PNG), GitDock Dashboard Screenshot v2 (JPG, 1504x688), GitDock OG Card (White)

## Knowledge Gaps
- **414 isolated node(s):** `bcrypt`, `crypto`, `db`, `sessions`, `Database` (+409 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **15 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Phase 1: Foundation Path Restructure` connect `GitHub API Foundation` to `Provider Routing and Security`, `Security and Multi-Machine Sync`, `Security and Host Key Management`, `GitLab Integration Planning`?**
  _High betweenness centrality (0.085) - this node is a cross-community bridge._
- **Why does `GitLab Implementation Plan` connect `GitLab Integration Planning` to `Path Migration and Workspace Restructure`, `GitHub API Foundation`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **Why does `Main Dashboard HTML` connect `Dashboard UI Components` to `Project Overview and Packaging`, `Security and Multi-Machine Sync`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **What connects `bcrypt`, `crypto`, `db` to the rest of the system?**
  _414 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Hub Auth and Subscription` be split into smaller, more focused modules?**
  _Cohesion score 0.047474747474747475 - nodes in this community are weakly interconnected._
- **Should `Security and Multi-Machine Sync` be split into smaller, more focused modules?**
  _Cohesion score 0.04983388704318937 - nodes in this community are weakly interconnected._
- **Should `Authentication Core Logic` be split into smaller, more focused modules?**
  _Cohesion score 0.05384615384615385 - nodes in this community are weakly interconnected._