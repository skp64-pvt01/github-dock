const fs = require("fs");
const path = require("path");
const os = require("os");

const GITDOCK_DIR = process.env.GITDOCK_DIR || path.join(os.homedir(), ".gitdock");
const WORKSPACE_PATH = path.join(GITDOCK_DIR, "workspace.json");

function ensureGitDockDir() {
  if (!fs.existsSync(GITDOCK_DIR)) {
    fs.mkdirSync(GITDOCK_DIR, { recursive: true });
  }
}

function getDefaultWorkspacePath() {
  return path.join(os.homedir(), "GitDock");
}

function loadData() {
  try {
    if (fs.existsSync(WORKSPACE_PATH)) {
      return JSON.parse(fs.readFileSync(WORKSPACE_PATH, "utf8"));
    }
  } catch (e) {
    console.warn("[workspace] Could not load workspace data:", e.message);
  }
  return { workspaces: [], active: null };
}

function saveData(data) {
  ensureGitDockDir();
  fs.writeFileSync(WORKSPACE_PATH, JSON.stringify(data, null, 2), "utf8");
}

function listWorkspaces() {
  return loadData().workspaces || [];
}

function getActiveWorkspace() {
  const data = loadData();
  if (!data.active) return null;
  return (data.workspaces || []).find(w => w.name === data.active) || null;
}

function activateWorkspace(name) {
  const data = loadData();
  const ws = (data.workspaces || []).find(w => w.name === name);
  if (!ws) return { success: false, error: "Workspace not found: " + name };
  data.active = name;
  saveData(data);
  return { success: true, path: ws.path, name: ws.name };
}

function addWorkspace(name, dirPath) {
  const resolved = path.resolve(dirPath.trim());
  if (!fs.existsSync(resolved)) {
    fs.mkdirSync(resolved, { recursive: true });
  }
  const data = loadData();
  const wsList = data.workspaces || [];
  if (wsList.find(w => w.name === name)) {
    return { success: false, error: "Workspace name already exists" };
  }
  if (wsList.find(w => w.path === resolved)) {
    return { success: false, error: "Path already registered as a workspace" };
  }
  wsList.push({ name, path: resolved });
  data.workspaces = wsList;
  if (!data.active) data.active = name;
  saveData(data);

  const configPath = path.join(resolved, "config.json");
  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, JSON.stringify({ accounts: {} }, null, 2), "utf8");
    console.log("[workspace] Created empty config.json in " + resolved);
  }
  return { success: true };
}

function removeWorkspace(name) {
  const data = loadData();
  data.workspaces = (data.workspaces || []).filter(w => w.name !== name);
  if (data.active === name) {
    data.active = (data.workspaces[0] || {}).name || null;
  }
  saveData(data);
  return { success: true };
}

function loadWorkspace() {
  const ws = getActiveWorkspace();
  return ws ? ws.path : null;
}

function isWorkspaceConfigured() {
  return loadWorkspace() !== null;
}

function saveWorkspace(dirPath) {
  const resolved = path.resolve(dirPath.trim());
  if (!fs.existsSync(resolved)) {
    fs.mkdirSync(resolved, { recursive: true });
  }
  const data = loadData();
  const wsList = data.workspaces || [];
  let existing = wsList.find(w => w.name === "Default");
  if (existing) {
    existing.path = resolved;
  } else {
    wsList.push({ name: "Default", path: resolved });
  }
  data.workspaces = wsList;
  data.active = "Default";
  saveData(data);

  const configPath = path.join(resolved, "config.json");
  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, JSON.stringify({ accounts: {} }, null, 2), "utf8");
  }
  return resolved;
}

function probePath(dirPath) {
  const resolved = path.resolve(dirPath);
  const result = { hasConfig: false, accounts: [], repos: [] };

  const configPath = path.join(resolved, "config.json");
  if (fs.existsSync(configPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
      result.hasConfig = true;
      if (config.accounts) {
        result.accounts = Object.keys(config.accounts).map(name => ({
          name,
          provider: config.accounts[name].provider || "github"
        }));
      }
    } catch (e) {}
  }

  try {
    const entries = fs.readdirSync(resolved, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const gitPath = path.join(resolved, entry.name, ".git");
      if (fs.existsSync(gitPath)) {
        let provider = "github";
        try {
          const gitConfig = fs.readFileSync(path.join(resolved, entry.name, ".git", "config"), "utf8");
          if (gitConfig.includes("gitlab")) provider = "gitlab";
        } catch (e) {}
        result.repos.push({ name: entry.name, provider });
      }
    }
  } catch (e) {}

  return result;
}

module.exports = {
  GITDOCK_DIR,
  WORKSPACE_PATH,
  ensureGitDockDir,
  getDefaultWorkspacePath,
  loadWorkspace,
  saveWorkspace,
  isWorkspaceConfigured,
  listWorkspaces,
  getActiveWorkspace,
  activateWorkspace,
  addWorkspace,
  removeWorkspace,
  probePath,
};
