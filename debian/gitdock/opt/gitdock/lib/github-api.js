const https = require("https");

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

function githubRequestJson({ method = "GET", url, token, body, timeoutMs = 15000 }) {
  return new Promise((resolve, reject) => {
    try {
      const u = new URL(url);
      const data = body ? JSON.stringify(body) : null;
      const headers = {
        "User-Agent": "GitDock",
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      };
      if (token) headers.Authorization = `Bearer ${token}`;
      if (data) headers["Content-Type"] = "application/json";
      if (data) headers["Content-Length"] = Buffer.byteLength(data);

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
      req.setTimeout(timeoutMs, () => req.destroy(new Error("GitHub request timeout")));
      if (data) req.write(data);
      req.end();
    } catch (e) {
      reject(e);
    }
  });
}

async function githubListAllPages({ initialUrl, token, maxPages = 50 }) {
  const all = [];
  let url = initialUrl;
  for (let i = 0; i < maxPages; i += 1) {
    const r = await githubRequestJson({ url, token, timeoutMs: 20000 });
    if (!r.ok) return { ok: false, status: r.status, json: r.json, raw: r.raw, items: all };
    if (Array.isArray(r.json)) all.push(...r.json);
    const links = parseLinkHeader(r.headers && r.headers.link);
    if (!links.next) break;
    url = links.next;
  }
  return { ok: true, status: 200, items: all };
}

module.exports = {
  parseLinkHeader,
  githubRequestJson,
  githubListAllPages,
};
