const https = require("https");
const url = require("url");

// =============================================================================
// GitLab REST API client (native https, no external deps)
// =============================================================================

function gitlabRequestJson({ method = "GET", url, token, body, timeoutMs = 15000 }) {
  return new Promise((resolve, reject) => {
    try {
      const u = new URL(url);
      const data = body ? JSON.stringify(body) : null;
      const headers = {
        "User-Agent": "GitDock",
        Accept: "application/json",
      };
      if (token) headers["PRIVATE-TOKEN"] = token;
      if (data) {
        headers["Content-Type"] = "application/json";
        headers["Content-Length"] = Buffer.byteLength(data);
      }

      const req = https.request(
        {
          method,
          hostname: u.hostname,
          path: u.pathname + u.search,
          headers,
        },
        (res) => {
          let raw = "";
          res.setEncoding("utf8");
          res.on("data", (chunk) => { raw += chunk; });
          res.on("end", () => {
            let json = null;
            try { json = raw ? JSON.parse(raw) : null; } catch (e) { json = null; }
            resolve({
              ok: res.statusCode >= 200 && res.statusCode < 300,
              status: res.statusCode,
              headers: res.headers || {},
              json,
              raw,
            });
          });
        }
      );
      req.on("error", reject);
      req.setTimeout(timeoutMs, () => req.destroy(new Error("GitLab request timeout")));
      if (data) req.write(data);
      req.end();
    } catch (e) {
      reject(e);
    }
  });
}

function parseLinkHeader(linkHeader) {
  if (!linkHeader || typeof linkHeader !== "string") return {};
  const out = {};
  const parts = linkHeader.split(",").map((p) => p.trim()).filter(Boolean);
  for (const part of parts) {
    const m = part.match(/^<([^>]+)>\s*;\s*rel="([^"]+)"$/i);
    if (m) out[m[2]] = m[1];
  }
  return out;
}

async function gitlabListAllPages({ initialUrl, token, maxPages = 50 }) {
  const all = [];
  let url = initialUrl;
  for (let i = 0; i < maxPages; i += 1) {
    const r = await gitlabRequestJson({ url, token, timeoutMs: 20000 });
    if (!r.ok) return { ok: false, status: r.status, json: r.json, raw: r.raw, items: all };

    if (Array.isArray(r.json)) all.push(...r.json);

    const links = parseLinkHeader(r.headers && r.headers.link);
    if (links.next) {
      url = links.next;
      continue;
    }

    if (url.includes("?page=")) {
      const currentPage = parseInt(url.match(/[?&]page=(\d+)/i)?.[1] || "1", 10);
      const currentPerPage = parseInt(url.match(/[?&]per_page=(\d+)/i)?.[1] || "20", 10);
      if (r.json && Array.isArray(r.json) && r.json.length < currentPerPage) break;
      if (r.json && Array.isArray(r.json) && r.json.length > 0) {
        const nextUrl = url.replace(/([?&])page=(\d+)/, `$1page=${currentPage + 1}`);
        url = nextUrl;
        continue;
      }
    }
    break;
  }
  return { ok: true, status: 200, items: all };
}

// =============================================================================
// Token validation
// =============================================================================

async function validateGitlabToken(token, instanceUrl) {
  if (!token) return { ok: false, apiReady: false, reason: "missing", login: null };

  const base = instanceUrl ? instanceUrl.replace(/\/+$/, "") : "https://gitlab.com";
  const r = await gitlabRequestJson({ url: `${base}/api/v4/user`, token, timeoutMs: 15000 });

  if (!r.ok || !r.json || !r.json.id) {
    return {
      ok: false,
      apiReady: false,
      reposAccess: false,
      reason: "invalid",
      login: null,
      message: "Token rejected by GitLab (GET /user failed).",
    };
  }

  const user = r.json;
  const login = String(user.username || "");
  const name = String(user.name || "");
  const userId = user.id;

  const reposR = await gitlabRequestJson({
    url: `${base}/api/v4/projects?membership=true&per_page=1`,
    token,
    timeoutMs: 15000,
  });
  const reposAccess = !!reposR.ok;
  let reposReason = reposAccess ? "ok" : "repos_forbidden";
  let message = null;
  if (!reposAccess) {
    reposReason = reposR.status === 403 ? "missing_repo_scope" : "repos_failed";
    message = reposR.status === 403
      ? "Token is valid but cannot list projects. Add api or read_api scope."
      : "Token could not list projects.";
  }

  const apiReady = reposAccess;
  const res = {
    ok: true,
    apiReady,
    reposAccess,
    reposReason,
    reason: apiReady ? "ok" : reposReason,
    login,
    name,
    userId,
    message: message || (apiReady ? "Token can access GitLab API for this account." : null),
  };
  return res;
}

// =============================================================================
// Repo listing
// =============================================================================

async function listGitlabRepos({ token, instanceUrl }) {
  const base = instanceUrl ? instanceUrl.replace(/\/+$/, "") : "https://gitlab.com";
  const url = `${base}/api/v4/projects?membership=true&per_page=100&sort=updated&order_by=updated_at`;
  const result = await gitlabListAllPages({ initialUrl: url, token });
  if (!result.ok) return { ok: false, status: result.status, items: [] };

  const items = result.items.map(mapGitlabProjectToUnified);
  return { ok: true, items };
}

function mapGitlabProjectToUnified(p) {
  if (!p) return null;
  const pathWithNamespace = p.path_with_namespace || "";
  const parts = pathWithNamespace.split("/");
  const repoName = parts.pop() || "";
  const groupPath = parts.length > 0 ? parts.join("/") : "";
  const sshUrl = p.ssh_url_to_repo || "";
  const httpUrl = p.http_url_to_repo || "";

  return {
    name: repoName,
    fullPath: pathWithNamespace,
    groupPath,
    description: p.description || "",
    isPrivate: !!p.visibility && p.visibility !== "public",
    primaryLanguage: null,
    updatedAt: p.last_activity_at || "",
    url: p.web_url || "",
    stargazerCount: p.star_count || 0,
    forkCount: p.forks_count || 0,
    diskUsage: (p.statistics && p.statistics.storage_size) ? Math.round(p.statistics.storage_size / 1024) : 0,
    sshUrl,
    httpUrl,
    defaultBranch: p.default_branch || "main",
    id: p.id,
    namespace: p.namespace ? { id: p.namespace.id, kind: p.namespace.kind, path: p.namespace.path, fullPath: p.namespace.full_path } : null,
    owner: p.owner ? { id: p.owner.id, username: p.owner.username, name: p.owner.name } : null,
  };
}

// =============================================================================
// SSH key upload
// =============================================================================

async function uploadGitlabSshKey({ token, instanceUrl, title, key }) {
  const base = instanceUrl ? instanceUrl.replace(/\/+$/, "") : "https://gitlab.com";
  const r = await gitlabRequestJson({
    method: "POST",
    url: `${base}/api/v4/user/keys`,
    token,
    body: { title, key },
    timeoutMs: 20000,
  });

  if (r.ok) return { ok: true, created: true };

  if (r.status === 403) {
    return { ok: false, error: "GitLab denied adding the SSH key.", status: 403 };
  }

  if (r.status === 422) {
    const list = await gitlabListAllPages({
      initialUrl: `${base}/api/v4/user/keys?per_page=100&page=1`,
      token,
    });
    if (list.ok) {
      const exists = list.items.some((k) => k && String(k.key || "").trim() === key);
      if (exists) return { ok: true, created: false, alreadyExists: true };
    }
  }

  return { ok: false, error: "Failed to upload SSH key", status: r.status };
}

// =============================================================================
// Repo README
// =============================================================================

async function getGitlabReadme({ token, instanceUrl, projectPath }) {
  const base = instanceUrl ? instanceUrl.replace(/\/+$/, "") : "https://gitlab.com";
  const encodedPath = encodeURIComponent(projectPath);
  const r = await gitlabRequestJson({
    url: `${base}/api/v4/projects/${encodedPath}/repository/files/README.md?ref=HEAD`,
    token,
    timeoutMs: 10000,
  });
  if (!r.ok) {
    const r2 = await gitlabRequestJson({
      url: `${base}/api/v4/projects/${encodedPath}/repository/files/readme.md?ref=HEAD`,
      token,
      timeoutMs: 10000,
    });
    if (!r2.ok) return { ok: false, content: null };
    if (r2.ok && r2.json && r2.json.content) {
      return { ok: true, content: Buffer.from(r2.json.content, "base64").toString("utf8") };
    }
    return { ok: false, content: null };
  }
  if (r.json && r.json.content) {
    return { ok: true, content: Buffer.from(r.json.content, "base64").toString("utf8") };
  }
  return { ok: false, content: null };
}

// =============================================================================
// Recent commits
// =============================================================================

async function getGitlabCommits({ token, instanceUrl, projectPath, limit = 10 }) {
  const base = instanceUrl ? instanceUrl.replace(/\/+$/, "") : "https://gitlab.com";
  const encodedPath = encodeURIComponent(projectPath);
  const r = await gitlabRequestJson({
    url: `${base}/api/v4/projects/${encodedPath}/repository/commits?per_page=${limit}&ref_name=HEAD`,
    token,
    timeoutMs: 10000,
  });
  if (!r.ok || !Array.isArray(r.json)) return { ok: false, commits: [] };

  const commits = r.json.map((c) => ({
    id: c.id || "",
    shortId: (c.short_id || "").slice(0, 7),
    message: (c.title || "").split("\n")[0] || "",
    author: c.author_name || "",
    date: c.created_at || c.committed_date || "",
  }));

  return { ok: true, commits };
}

// =============================================================================
// Repo details / status
// =============================================================================

async function getGitlabProjectDetails({ token, instanceUrl, projectPath }) {
  const base = instanceUrl ? instanceUrl.replace(/\/+$/, "") : "https://gitlab.com";
  const encodedPath = encodeURIComponent(projectPath);
  const r = await gitlabRequestJson({
    url: `${base}/api/v4/projects/${encodedPath}`,
    token,
    timeoutMs: 10000,
  });
  if (!r.ok || !r.json) return { ok: false, project: null };

  return { ok: true, project: mapGitlabProjectToUnified(r.json) };
}

// =============================================================================
// GraphQL extras (MR/issue counts)
// =============================================================================

async function getGitlabRepoExtras({ token, instanceUrl, repoNames }) {
  if (!token || !Array.isArray(repoNames) || repoNames.length === 0) return { ok: false, extras: {} };

  const base = instanceUrl ? instanceUrl.replace(/\/+$/, "") : "https://gitlab.com";
  const gqlUrl = `${base}/api/graphql`;
  const extras = {};

  const fields = repoNames
    .map((fullPath, i) => {
      const escaped = fullPath.replace(/"/g, '\\"');
      return `repo_${i}: project(fullPath: "${escaped}") { issues(states: [opened]) { count } mergeRequests(states: [opened]) { count } }`;
    })
    .join(" ");

  const query = `{ ${fields} }`;
  const body = { query };

  const r = await gitlabRequestJson({
    method: "POST",
    url: gqlUrl,
    token,
    body,
    timeoutMs: 30000,
  });

  if (r.ok && r.json && r.json.data) {
    repoNames.forEach((fullPath, i) => {
      const alias = `repo_${i}`;
      if (r.json.data[alias]) {
        extras[fullPath] = {
          prs: (r.json.data[alias].mergeRequests && r.json.data[alias].mergeRequests.count) || 0,
          issues: (r.json.data[alias].issues && r.json.data[alias].issues.count) || 0,
        };
      }
    });
  }

  return { ok: true, extras };
}

// =============================================================================
// Build API base URL from instance
// =============================================================================

function getGitlabApiBase(instanceUrl) {
  if (!instanceUrl) return "https://gitlab.com/api/v4";
  const base = instanceUrl.replace(/\/+$/, "");
  return `${base}/api/v4`;
}

function getGitlabGraphqlUrl(instanceUrl) {
  if (!instanceUrl) return "https://gitlab.com/api/graphql";
  const base = instanceUrl.replace(/\/+$/, "");
  return `${base}/api/graphql`;
}

module.exports = {
  gitlabRequestJson,
  gitlabListAllPages,
  parseLinkHeader,
  validateGitlabToken,
  listGitlabRepos,
  mapGitlabProjectToUnified,
  uploadGitlabSshKey,
  getGitlabReadme,
  getGitlabCommits,
  getGitlabProjectDetails,
  getGitlabRepoExtras,
  getGitlabApiBase,
  getGitlabGraphqlUrl,
};
