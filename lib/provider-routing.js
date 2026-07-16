const path = require("path");
const security = require("./security");

function getProviderDir(provider) {
  return provider === "gitlab" ? "gitlab" : "github";
}

function getRepoPath({ account, repoName, groupPath, BASE_DIR }) {
  if (!account || !repoName) return null;

  const provider = account.provider || "github";
  const providerDir = getProviderDir(provider);

  let safeName;
  if (provider === "gitlab") {
    safeName = security.sanitizeGitLabRepoName(repoName);
    if (groupPath) {
      const safeGroup = security.sanitizeGitLabRepoName(groupPath);
      if (!safeGroup) return null;
      safeName = safeGroup + "/" + safeName;
    }
  } else {
    safeName = security.sanitizeRepoName(repoName);
  }
  if (!safeName) return null;

  const repoPath = path.join(BASE_DIR, providerDir, account.name || account._name, safeName);
  const localDir = path.join(BASE_DIR, providerDir, account.name || account._name);

  if (!security.isPathInsideDir(localDir, repoPath)) return null;
  return repoPath;
}

function getLegacyRepoPath({ accountName, repoName, BASE_DIR }) {
  const safeName = security.sanitizeRepoName(repoName);
  if (!safeName) return null;
  const repoPath = path.join(BASE_DIR, accountName, safeName);
  if (!security.isPathInsideDir(BASE_DIR, repoPath)) return null;
  return repoPath;
}

function getLocalDir({ BASE_DIR, account }) {
  const provider = account.provider || "github";
  const providerDir = getProviderDir(provider);
  return path.join(BASE_DIR, providerDir, account._name || account.name);
}

function getSshHost(account) {
  if (account.sshHost && account.sshHost !== `github.com-${account._name || account.name}`) {
    return account.sshHost;
  }
  const provider = account.provider || "github";
  if (provider === "gitlab") {
    const instance = account.instanceUrl ? new URL(account.instanceUrl).hostname : "gitlab.com";
    return `${instance}-${account._name || account.name}`;
  }
  return `github.com-${account._name || account.name}`;
}

function getCloneUrl({ account, repoName, groupPath, owner }) {
  const provider = account.provider || "github";
  const sshHost = getSshHost(account);

  if (provider === "gitlab") {
    const path = groupPath ? `${groupPath}/${repoName}` : repoName;
    return `git@${sshHost}:${path}.git`;
  }

  const ghUser = owner || account.githubUser || "";
  return `git@${sshHost}:${ghUser}/${repoName}.git`;
}

function getTransferApiPath({ account, owner, repo }) {
  if (account.provider === "gitlab") {
    return null;
  }
  return `/repos/${owner}/${repo}/transfer`;
}

function getProviderDisplayName(provider) {
  if (provider === "gitlab") return "GitLab";
  return "GitHub";
}

module.exports = {
  getProviderDir,
  getRepoPath,
  getLegacyRepoPath,
  getLocalDir,
  getSshHost,
  getCloneUrl,
  getTransferApiPath,
  getProviderDisplayName,
};
