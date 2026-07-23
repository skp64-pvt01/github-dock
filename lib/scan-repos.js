const fs = require("fs");
const path = require("path");
const security = require("./security");

function scanLocalRepos({ localDir, accountName, account }) {
  const results = [];
  if (!fs.existsSync(localDir)) return results;

  const provider = account.provider || "github";
  const isGitLab = provider === "gitlab";

  const walk = (dirPath, relGroupPath) => {
    let entries;
    try {
      entries = fs.readdirSync(dirPath, { withFileTypes: true });
    } catch (e) {
      return;
    }

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (entry.name === ".git") {
        const fullRepoPath = path.dirname(path.join(dirPath, entry.name));
        const repoName = path.basename(fullRepoPath);
        if (!security.isPathInsideDir(localDir, fullRepoPath)) continue;
        results.push({
          name: repoName,
          groupPath: relGroupPath || null,
          fullPath: relGroupPath ? `${relGroupPath}/${repoName}` : repoName,
          repoPath: fullRepoPath,
          account: accountName,
          provider,
        });
        continue;
      }

      if (entry.name.includes("..")) continue;
      const fullPath = path.join(dirPath, entry.name);
      if (!security.isPathInsideDir(localDir, fullPath)) continue;

      // ponytail: if this subdirectory is itself a git repo (contains .git),
      // add it and do not walk inside it. Prevents path duplication and double listing.
      const gitDir = path.join(fullPath, ".git");
      if (fs.existsSync(gitDir)) {
        results.push({
          name: entry.name,
          groupPath: relGroupPath || null,
          fullPath: relGroupPath ? `${relGroupPath}/${entry.name}` : entry.name,
          repoPath: fullPath,
          account: accountName,
          provider,
        });
        continue;
      }

      const childRel = relGroupPath ? `${relGroupPath}/${entry.name}` : entry.name;
      if (isGitLab) {
        if (!/^[a-zA-Z0-9\-_.\/]+$/.test(entry.name)) continue;
        walk(fullPath, childRel);
      } else {
        if (!/^[a-zA-Z0-9\-_.]+$/.test(entry.name)) continue;
        walk(fullPath, childRel);
      }
    }
  };

  walk(localDir, null);
  return results;
}

function buildRepoLookupMap(accountName, account) {
  const repos = scanLocalRepos({ localDir: account.localDir, accountName, account });
  const map = new Map();

  for (const r of repos) {
    const key = r.name;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(r);
  }

  return { repos, map };
}

function findClonedRepo({ repoName, groupPath, accountName, account }) {
  const results = scanLocalRepos({ localDir: account.localDir, accountName, account });
  const byName = results.filter((r) => r.name === repoName);

  if (byName.length === 0) return null;

  if (groupPath) {
    const byGroup = byName.find((r) => r.groupPath === groupPath);
    if (byGroup) return byGroup;
  }

  return byName[0];
}

module.exports = {
  scanLocalRepos,
  buildRepoLookupMap,
  findClonedRepo,
};
