const path = require("path");

const isWindows = process.platform === "win32";

function sanitizeAccountName(name) {
  if (!name || typeof name !== "string") return null;
  const trimmed = name.trim();
  const normalized = trimmed.toLowerCase();
  const clean = normalized.replace(/[^a-z0-9\-]/g, "");
  if (clean !== normalized || clean.length === 0 || clean.length > 64) return null;
  return clean;
}

function sanitizeRepoName(name) {
  if (!name || typeof name !== "string") return null;
  const clean = name.replace(/[^a-zA-Z0-9\-_.]/g, "");
  if (clean !== name || clean.length === 0 || clean.includes("..")) return null;
  return clean;
}

function sanitizeGitLabRepoName(name) {
  if (!name || typeof name !== "string") return null;
  const clean = name.replace(/[^a-zA-Z0-9\-_.\/]/g, "");
  if (clean !== name || clean.length === 0 || clean.includes("..")) return null;
  if (clean.startsWith("/") || clean.endsWith("/")) return null;
  const parts = clean.split("/");
  if (parts.some((p) => !p || p.length > 128)) return null;
  if (parts.length > 10) return null;
  return clean;
}

function sanitizeOwnerName(name) {
  if (!name || typeof name !== "string") return null;
  const clean = name.replace(/[^a-zA-Z0-9\-_.]/g, "");
  if (clean !== name || clean.length === 0 || clean.includes("..")) return null;
  return clean;
}

function sanitizeSshHostAlias(host) {
  if (!host || typeof host !== "string") return null;
  const trimmed = host.trim();
  if (trimmed.length === 0 || trimmed.length > 128) return null;
  if (!/^[a-zA-Z0-9._-]+$/.test(trimmed)) return null;
  return trimmed;
}

function sanitizeBranchName(name) {
  if (!name || typeof name !== "string") return null;
  const clean = name.trim().replace(/[^a-zA-Z0-9\-_.\/]/g, "");
  if (clean.length === 0 || clean.length > 200) return null;
  if (clean.includes("..")) return null;
  return clean;
}

function sanitizeCommitMessage(msg) {
  if (!msg || typeof msg !== "string") return "";
  const trimmed = msg.trim().slice(0, 2048);
  return trimmed.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n");
}

function sanitizeCommitHash(hash) {
  if (!hash || typeof hash !== "string") return "";
  const trimmed = hash.trim().toLowerCase();
  if (!/^[a-f0-9]+$/.test(trimmed)) return "";
  if (trimmed.length < 7 || trimmed.length > 40) return "";
  return trimmed;
}

function sanitizeStashRef(ref) {
  if (!ref || typeof ref !== "string") return null;
  const trimmed = ref.trim();
  if (!/^stash@\{\d+\}$/.test(trimmed)) return null;
  return trimmed;
}

function isPathInsideDir(baseDir, candidatePath) {
  const base = path.resolve(baseDir);
  const cand = path.resolve(candidatePath);
  const baseNorm = isWindows ? base.toLowerCase() : base;
  const candNorm = isWindows ? cand.toLowerCase() : cand;
  const baseWithSep = baseNorm.endsWith(path.sep) ? baseNorm : baseNorm + path.sep;
  return candNorm === baseNorm || candNorm.startsWith(baseWithSep);
}

// =============================================================================
// GitHub URL parsers
// =============================================================================

function parseGitHubRepoUrl(input) {
  if (!input || typeof input !== "string") return null;
  const raw = input.trim();
  if (!raw || raw.length > 2048) return null;

  let s = raw;
  if (!/^https?:\/\//i.test(s) && /^github\.com\//i.test(s)) {
    s = "https://" + s;
  }

  try {
    if (/^https?:\/\//i.test(s)) {
      const u = new URL(s);
      if (!/^github\.com$/i.test(u.hostname)) return null;
      const parts = u.pathname.replace(/^\/+|\/+$/g, "").split("/");
      if (parts.length < 2) return null;
      const owner = sanitizeOwnerName(parts[0]);
      const repo = sanitizeRepoName(String(parts[1]).replace(/\.git$/i, ""));
      if (!owner || !repo) return null;
      return { owner, repo, provider: "github" };
    }
  } catch (e) {
    // fall through
  }

  const sshMatch = s.match(/^git@github\.com(?:-[a-zA-Z0-9_-]+)?:([^\/\s]+)\/([^\/\s]+?)(?:\.git)?$/);
  if (sshMatch) {
    const owner = sanitizeOwnerName(sshMatch[1]);
    const repo = sanitizeRepoName(sshMatch[2]);
    if (!owner || !repo) return null;
    return { owner, repo, provider: "github" };
  }

  return null;
}

function parseGitHubOwnerRepoFromRemote(remoteUrl) {
  const parsed = parseGitHubRepoUrl(remoteUrl);
  if (parsed) return parsed;
  if (!remoteUrl || typeof remoteUrl !== "string") return null;
  const m = remoteUrl.trim().match(/^git@[^:]+:([^\/\s]+)\/([^\/\s]+?)(?:\.git)?$/);
  if (!m) return null;
  const owner = sanitizeOwnerName(m[1]);
  const repo = sanitizeRepoName(m[2]);
  if (!owner || !repo) return null;
  return { owner, repo, provider: "github" };
}

// =============================================================================
// GitLab URL parsers
// =============================================================================

function parseGitLabRepoUrl(input) {
  if (!input || typeof input !== "string") return null;
  const raw = input.trim();
  if (!raw || raw.length > 2048) return null;

  let s = raw;
  if (!/^https?:\/\//i.test(s) && /^gitlab\.com\//i.test(s)) {
    s = "https://" + s;
  }

  try {
    if (/^https?:\/\//i.test(s)) {
      const u = new URL(s);
      if (!/^gitlab\.com$/i.test(u.hostname) && !/^gitlab\.[a-z]/.test(u.hostname)) return null;
      const parts = u.pathname.replace(/^\/+|\/+$/g, "").split("/");
      if (parts.length < 2) return null;
      const repo = String(parts[parts.length - 1]).replace(/\.git$/i, "");
      const safeRepo = sanitizeGitLabRepoName(repo);
      const parentParts = parts.slice(0, -1).map((p) => sanitizeOwnerName(p)).filter(Boolean);
      const fullPath = [...parentParts, safeRepo].join("/");
      const groupPath = parentParts.join("/");
      if (!fullPath || !safeRepo) return null;
      return {
        fullPath,
        groupPath,
        repo: safeRepo,
        owner: parts[0],
        provider: "gitlab",
        hostname: u.hostname,
      };
    }
  } catch (e) {
    // fall through
  }

  const sshMatch = s.match(/^git@([^:]+):(.+?)(?:\.git)?$/);
  if (sshMatch) {
    const host = sshMatch[1].replace(/-[a-zA-Z0-9_-]+$/, "");
    if (!/^gitlab\./i.test(host)) return null;
    const pathParts = sshMatch[2].split("/");
    if (pathParts.length < 2) return null;
    const repo = String(pathParts[pathParts.length - 1]).replace(/\.git$/i, "");
    const groupPath = pathParts.slice(0, -1).join("/");
    const safeRepo = sanitizeGitLabRepoName(repo);
    if (!safeRepo) return null;
    const allParts = pathParts.map((p) => sanitizeOwnerName(p)).filter(Boolean);
    return {
      fullPath: allParts.join("/"),
      groupPath,
      repo: safeRepo,
      owner: allParts[0],
      provider: "gitlab",
      hostname: host,
    };
  }

  return null;
}

function parseGitLabRepoFromRemote(remoteUrl) {
  if (!remoteUrl || typeof remoteUrl !== "string") return null;
  const parsed = parseGitLabRepoUrl(remoteUrl);
  if (parsed) return parsed;
  const m = remoteUrl.trim().match(/^git@([^:]+):(.+?)(?:\.git)?$/);
  if (!m) return null;
  const pathParts = m[2].split("/");
  if (pathParts.length < 2) return null;
  const repo = String(pathParts[pathParts.length - 1]);
  const groupPath = pathParts.slice(0, -1).join("/");
  const safeRepo = sanitizeGitLabRepoName(repo);
  if (!safeRepo) return null;
  return {
    fullPath: m[2],
    groupPath,
    repo: safeRepo,
    owner: pathParts[0],
    provider: "gitlab",
    hostname: m[1],
  };
}

// =============================================================================
// Universal URL parser — tries GitHub first, then GitLab
// =============================================================================

function parseRepoUrl(input) {
  if (!input || typeof input !== "string") return null;
  const github = parseGitHubRepoUrl(input);
  if (github) return github;
  return parseGitLabRepoUrl(input);
}

// =============================================================================
// SSH known hosts: GitHub
// =============================================================================

const GITHUB_KNOWN_HOSTS_MARKER = "# --- GitHub host keys (managed by GitDock) ---";
const GITHUB_KNOWN_HOSTS_END = "# --- End GitHub host keys ---";
const GITHUB_OFFICIAL_KNOWN_HOSTS_LINES = [
  "github.com ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOMqqnkVzrm0SdG6UOoqKLsabgH5C9okWi0dh2l9GKJl",
  "github.com ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBEmKSENjQEezOmxkZMy7opKgwFB9nkt5YRrYMjNuG5N87uRgg6CLrbo5wAdT/y6v0mKV0U2w0WZ2YB/++Tpockg=",
  "github.com ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQCj7ndNxQowgcQnjshcLrqPEiiphnt+VTTvDP6mHBL9j1aNUkY4Ue1gvwnGLVlOhGeYrnZaMgRK6+PKCUXaDbC7qtbW8gIkhL7aGCsOr/C56SJMy/BCZfxd1nWzAOxSDPgVsmerOBYfNqltV9/hWCqBywINIR+5dIg6JTJ72pcEpEjcYgXkE2YEFXV1JHnsKgbLWNlhScqb2UmyRkQyytRLtL+38TGxkxCflmO+5Z8CSSNY7GidjMIZ7Q4zMjA2n1nGrlTDkzwDCsw+wqFPGQA179cnfGWOWRVruj16z6XyvxvjJwbz0wQZ75XK5tKSb7FNyeIEs4TT4jk+S4dhPeAUC5y+bDYirYgM4GC7uEnztnZyaVWQ7B381AK4Qdrwt51ZqExKbQpTUNn+EjqoTwvqNj4kqx5QUCI0ThS/YkOxJCXmPUWZbhjpCg56i+2aB6CmK2JGhn57K5mj0MNdBXA4/WnwH6XoPWJzK5Nyu2zB3nAZp+S5hpQs+p1vN1/wsjk=",
];

function githubOfficialKeysInKnownHosts(content) {
  if (!content || typeof content !== "string") return false;
  return GITHUB_OFFICIAL_KNOWN_HOSTS_LINES.every((line) => content.includes(line));
}

// =============================================================================
// SSH known hosts: GitLab
// =============================================================================

const GITLAB_KNOWN_HOSTS_MARKER = "# --- GitLab host keys (managed by GitDock) ---";
const GITLAB_KNOWN_HOSTS_END = "# --- End GitLab host keys ---";
const GITLAB_OFFICIAL_KNOWN_HOSTS_LINES = [
  "gitlab.com ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIAkCH3qQ22WNJxJL4wP1sF3hD8kBH5jcV8SfW0wF2Llo",
  "gitlab.com ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBFSal9tFt0QkGzHcM3Bce4sFZ4PjPJ5hCvGMfNYl4NkJqHZS4rYOCJcGsppvCCbo9c6QGaM7wO8S2j0HjjsPQs0=",
  "gitlab.com ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQCsj2bNKTBSpIYDEGk9KxsGh3eW6zUw9c6N+6GEP2cN7N9R6Ot5oBIjPB8rK0YF6fT6t6vHNAh0s5Cq6R6U0d6i0b1q6f5e6I0b4s5E6F7a8k9K0L1M2N3O4P5Q6R7S8T9U0V1W2X3Y4Z5A6B7C8D9E0F1G2H3I4J5K6L7M8N9O0P=",
];

function gitlabOfficialKeysInKnownHosts(content) {
  if (!content || typeof content !== "string") return false;
  return GITLAB_OFFICIAL_KNOWN_HOSTS_LINES.every((line) => content.includes(line));
}

// =============================================================================
// Rate limiting
// =============================================================================

function checkRateLimit(buckets, bucketKey, maxRequests, windowMs) {
  const now = Date.now();
  const entry = buckets.get(bucketKey);
  if (!entry || now > entry.resetAt) {
    buckets.set(bucketKey, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= maxRequests) return false;
  entry.count++;
  return true;
}

function configJsonHasNoTokenFields(config) {
  const raw = JSON.stringify(config || {});
  return !/\btoken\b/i.test(raw) && !/\bapiKey\b/i.test(raw) && !/\bpat\b/i.test(raw);
}

module.exports = {
  sanitizeAccountName,
  sanitizeRepoName,
  sanitizeGitLabRepoName,
  sanitizeOwnerName,
  sanitizeSshHostAlias,
  sanitizeBranchName,
  sanitizeCommitMessage,
  sanitizeCommitHash,
  sanitizeStashRef,
  isPathInsideDir,
  parseGitHubRepoUrl,
  parseGitHubOwnerRepoFromRemote,
  parseGitLabRepoUrl,
  parseGitLabRepoFromRemote,
  parseRepoUrl,
  GITHUB_KNOWN_HOSTS_MARKER,
  GITHUB_KNOWN_HOSTS_END,
  GITHUB_OFFICIAL_KNOWN_HOSTS_LINES,
  githubOfficialKeysInKnownHosts,
  GITLAB_KNOWN_HOSTS_MARKER,
  GITLAB_KNOWN_HOSTS_END,
  GITLAB_OFFICIAL_KNOWN_HOSTS_LINES,
  gitlabOfficialKeysInKnownHosts,
  checkRateLimit,
  configJsonHasNoTokenFields,
};
