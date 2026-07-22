# GitLab Support — User Testing Guide

End-to-end manual test plan for the GitLab provider integration.

---

## Prerequisites

- GitDock running on `dev-gitlab-support` branch
- A GitLab account with at least one repository (group or personal)
- A GitLab Personal Access Token with `read_api` scope
- SSH key pair ready (or let GitDock generate one)

---

## 1. Account Creation — GitLab Provider

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1.1 | Open GitDock dashboard (`http://127.0.0.1:3847`) | Dashboard loads, empty state shows |
| 1.2 | Click **Settings → Account Manager → Add Account** | Account form opens |
| 1.3 | Verify **Provider** radio buttons appear (GitHub / GitLab) | Two radio buttons visible, GitHub selected by default |
| 1.4 | Select **GitLab** | Form fields switch: GitHub username / Email fields replaced by GitLab username + Instance URL |
| 1.5 | Fill in: Account name = `test-gitlab`, Display label = `Test GitLab`, GitLab username = _your GitLab username or group_, Instance URL = `https://gitlab.com` (default), Email = _your email_ | All fields accept input |
| 1.6 | Click **Add** | Account added, setup timeline opens |
| 1.7 | Verify timeline header says "Set up Test GitLab (GitLab)" | Provider name displayed correctly |

### Variation — Self-Hosted GitLab
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1.8 | Repeat steps 1.2–1.5 with Instance URL = `https://gitlab.example.com` | Instance URL accepted |
| 1.9 | Verify SSH host default shows `gitlab.example.com-{account}` | SSH host derived from instance hostname |

---

## 2. Setup Timeline — GitLab

### Part A — SSH
| Step | Action | Expected Result |
|------|--------|-----------------|
| 2.1 | In setup timeline, locate **Part A (SSH)** | Links point to GitLab SSH docs (`gitlab.com/-/user_settings/ssh_keys`) |
| 2.2 | Click **Generate SSH Key** | Key generated, public key displayed |
| 2.3 | Copy the displayed public key | Clipboard has key content |
| 2.4 | Click the GitLab SSH keys link | Opens GitLab SSH keys page in new tab |
| 2.5 | Paste key there, add it | Key saved on GitLab |
| 2.6 | Click **Verify SSH** | Runs `ssh -T git@gitlab.com-test-gitlab`, status turns green |
| 2.7 | Verify `~/.ssh/known_hosts` contains GitLab host keys | GitLab.com Ed25519/ECDSA/RSA fingerprints present |

### Part B — API Token
| Step | Action | Expected Result |
|------|--------|-----------------|
| 2.8 | Locate **Part B (API Token)** | Instructions mention GitLab PAT with `read_api` scope |
| 2.9 | Click the GitLab PAT link | Opens GitLab PAT settings page in new tab |
| 2.10 | Create a token named "GitDock" with `read_api` scope | Token generated |
| 2.11 | Enter the token in the input field and click **Save Token** | Token validated, status turns green |
| 2.12 | Click **Load Repos & Close** | Dashboard loads GitLab repos |

---

## 3. Repo Listing — Provider Badges and FullPath

| Step | Action | Expected Result |
|------|--------|-----------------|
| 3.1 | After loading repos, scroll the repo grid | Each repo card shows a provider badge |
| 3.2 | Find a GitLab repo card | Badge reads "GitLab" with GitLab-themed styling |
| 3.3 | Find a GitHub repo card (if any exist) | Badge reads "GitHub" with GitHub-themed styling |
| 3.4 | For a GitLab repo in a subgroup, check the card | Full path (e.g. `engineering/backend/api-service`) shown below repo name in lighter text |
| 3.5 | For a GitLab repo in a personal namespace | Only repo name shown, no group path segment |

### Filter by Provider
| Step | Action | Expected Result |
|------|--------|-----------------|
| 3.6 | Locate the filter controls | Provider dropdown/select visible |
| 3.7 | Select "GitLab" from provider filter | Only GitLab repos shown |
| 3.8 | Select "GitHub" from provider filter | Only GitHub repos shown |
| 3.9 | Clear the filter | All repos shown again |

### Search by Provider
| Step | Action | Expected Result |
|------|--------|-----------------|
| 3.10 | Click search bar (or press `/`) | Search input focused |
| 3.11 | Type `gitlab` | GitLab repos appear in results |
| 3.12 | Type the name of a GitLab repo | Repo found by name |

---

## 4. Cloning a GitLab Repo

| Step | Action | Expected Result |
|------|--------|-----------------|
| 4.1 | Find a GitLab repo that is **not yet cloned** | Clone button visible on card |
| 4.2 | Click **Clone** | Clone starts, SSE indicator shows progress |
| 4.3 | Wait for clone to finish | Card border turns green (cloned indicator) |
| 4.4 | Verify local directory structure | Repo cloned under `<workspace>/gitlab/<account>/<group>/<subgroup>/<repo>` |
| 4.5 | Verify remote URL | `git remote -v` shows `git@gitlab.com-{account}:<fullPath>.git` |

---

## 5. Git Operations on GitLab Repos

### Status
| Step | Action | Expected Result |
|------|--------|-----------------|
| 5.1 | Click a cloned GitLab repo card | Status shows current branch, clean/dirty state |
| 5.2 | Make a local change (e.g. edit a file) | Card shows "uncommitted changes" |

### Commit
| Step | Action | Expected Result |
|------|--------|-----------------|
| 5.3 | Click **Git** on a cloned GitLab repo with changes | Git modal opens |
| 5.4 | Verify changed files listed | Files visible with status indicators |
| 5.5 | Enter commit message, click **Commit** | Commit succeeds |
| 5.6 | Verify git log locally | `git log -1` shows the commit with correct author email |

### Push
| Step | Action | Expected Result |
|------|--------|-----------------|
| 5.7 | Click **Push** in Git modal | Push succeeds |
| 5.8 | Verify on GitLab web | Commit visible in repo |

### Pull
| Step | Action | Expected Result |
|------|--------|-----------------|
| 5.9 | Click **Pull** on a GitLab repo | Pull succeeds (or reports up-to-date) |

### Branch
| Step | Action | Expected Result |
|------|--------|-----------------|
| 5.10 | Open Git modal → Branch tab | Current branch shown |
| 5.11 | Create a new branch | Branch created, visible in branch list |
| 5.12 | Switch branches | Branch switches, status updates |

---

## 6. Focus View — GitLab Repos

| Step | Action | Expected Result |
|------|--------|-----------------|
| 6.1 | Click a GitLab repo card to open focus view | Focus view opens |
| 6.2 | Verify provider badge displayed | "GitLab" badge visible at top |
| 6.3 | Verify fullPath shown | Group/subgroup path displayed below repo name |
| 6.4 | Check action buttons | Clone/Pull/Push/Git/Open buttons all visible |

---

## 7. Transfer Modal — GitLab Repos

| Step | Action | Expected Result |
|------|--------|-----------------|
| 7.1 | Open **Transfer** from a cloned GitLab repo's ⋮ menu | Transfer modal opens |
| 7.2 | Verify provider badge shown | "GitLab" badge near repo info |
| 7.3 | Verify destination account list | Only GitLab accounts listed (same provider) |
| 7.4 | Close modal | No action taken |

---

## 8. Account Management — GitLab

| Step | Action | Expected Result |
|------|--------|-----------------|
| 8.1 | Open Settings → Account Manager | Both GitHub and GitLab accounts listed |
| 8.2 | Verify each account shows its provider label | "GitHub" or "GitLab" badge next to each account |
| 8.3 | Edit a GitLab account | Form pre-filled with GitLab fields (username, instance URL) |
| 8.4 | Remove a GitLab account | Account removed, confirmation shown |

---

## 9. Hub — Provider Badges (if Hub is configured)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 9.1 | Open Hub dashboard | Repo cards show provider badges |
| 9.2 | Find a GitLab repo card | "GitLab" badge visible |
| 9.3 | Verify fullPath shown | Group/subgroup path below repo name |
| 9.4 | Use Hub search with `gitlab` | GitLab repos filtered |
| 9.5 | Use Hub search with a fullPath value | Matched repos shown |

---

## 10. One-Time Migration (existing installs only)

> Only relevant if upgrading from a version before GitLab support. Skip for fresh installs.

| Step | Action | Expected Result |
|------|--------|-----------------|
| 10.1 | Stop GitDock if running | Server stopped |
| 10.2 | Run `node scripts/migrate-to-provider-paths.js --dry-run` | Lists repos that would be moved, no files changed |
| 10.3 | Verify the plan looks correct | Old paths match expected layout |
| 10.4 | Run `node scripts/migrate-to-provider-paths.js` | Repos moved to `BASE_DIR/github/<account>/`, config updated |
| 10.5 | Verify repos work in dashboard | Start GitDock, repos load and operate normally |
| 10.6 | (Optional) Test undo: `node scripts/migrate-to-provider-paths.js --undo` | Repos restored to original locations, config reverted |

---

## 11. Self-Hosted GitLab Instance

| Step | Action | Expected Result |
|------|--------|-----------------|
| 11.1 | Create account with `https://gitlab.example.com` | Account created |
| 11.2 | Verify SSH host alias | Defaults to `gitlab.example.com-{account}` |
| 11.3 | Complete SSH and token setup | Timeline completes |
| 11.4 | Load repos | Repos from self-hosted instance listed |
| 11.5 | Clone a repo | Cloned under `<workspace>/gitlab/<account>/<path>` |
| 11.6 | Verify clone URL | Uses `git@gitlab.example.com-{account}:<path>.git` |

---

## 12. Edge Cases

| Scenario | Action | Expected Result |
|----------|--------|-----------------|
| **Deeply nested subgroups** | Clone a repo at `group/a/b/c/d/e` | Path creates full directory tree `group/a/b/c/d/e/` |
| **Repo at root of group** | Clone `group/repo` (no subgroup) | Path is `group/repo` (one level) |
| **Invalid GitLab URL** | Try adding account with malformed instance URL | Validation rejects invalid URL |
| **Missing token scopes** | Use a PAT without `read_api` | API calls fail gracefully, error toast shown |
| **SSH alias collision** | Create two GitLab accounts on the same instance | Each gets unique SSH host alias (e.g. `gitlab.com-acmecorp`, `gitlab.com-personal`) |
| **Switching provider** | Edit a GitHub account to try changing to GitLab | Form tabs preserve original provider (cannot switch — re-create) |
