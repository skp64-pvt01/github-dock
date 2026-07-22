const fs = require("fs");
const path = require("path");
const os = require("os");
const { describe, it, before, after } = require("node:test");
const assert = require("node:assert/strict");

const testDir = fs.mkdtempSync(path.join(os.tmpdir(), "gitdock-ws-test-"));
process.env.GITDOCK_DIR = path.join(testDir, ".gitdock");
process.env.GITDOCK_TEST = "1";

const workspace = require("../workspace");

function tmpDir() {
  return fs.mkdtempSync(path.join(testDir, "ws-"));
}

function cleanGitDockDir() {
  try { fs.rmSync(process.env.GITDOCK_DIR, { recursive: true, force: true }); } catch (e) {}
}

after(() => {
  try { fs.rmSync(testDir, { recursive: true, force: true }); } catch (e) {}
});

describe("workspace module — unit", () => {
  it("starts with no workspaces", () => {
    cleanGitDockDir();
    assert.equal(workspace.listWorkspaces().length, 0);
    assert.equal(workspace.getActiveWorkspace(), null);
    assert.equal(workspace.loadWorkspace(), null);
    assert.equal(workspace.isWorkspaceConfigured(), false);
  });

  it("addWorkspace creates entry and config.json", () => {
    cleanGitDockDir();
    const d = tmpDir();
    const r = workspace.addWorkspace("Main", d);
    assert.equal(r.success, true);

    const list = workspace.listWorkspaces();
    assert.equal(list.length, 1);
    assert.equal(list[0].name, "Main");
    assert.equal(list[0].path, d);

    assert.equal(workspace.isWorkspaceConfigured(), true);
    const active = workspace.getActiveWorkspace();
    assert.equal(active.name, "Main");
    assert.equal(active.path, d);

    assert.ok(fs.existsSync(path.join(d, "config.json")));
  });

  it("addWorkspace rejects duplicate names", () => {
    cleanGitDockDir();
    const d1 = tmpDir();
    const d2 = tmpDir();
    workspace.addWorkspace("X", d1);
    const r = workspace.addWorkspace("X", d2);
    assert.equal(r.success, false);
    assert.match(r.error, /name already exists/i);
  });

  it("addWorkspace rejects duplicate paths", () => {
    cleanGitDockDir();
    const d = tmpDir();
    workspace.addWorkspace("A", d);
    const r = workspace.addWorkspace("B", d);
    assert.equal(r.success, false);
    assert.match(r.error, /path already registered/i);
  });

  it("activateWorkspace switches active workspace", () => {
    cleanGitDockDir();
    const d1 = tmpDir();
    const d2 = tmpDir();
    workspace.addWorkspace("First", d1);
    workspace.addWorkspace("Second", d2);

    let active = workspace.getActiveWorkspace();
    assert.equal(active.name, "First");

    const r = workspace.activateWorkspace("Second");
    assert.equal(r.success, true);
    assert.equal(r.name, "Second");

    active = workspace.getActiveWorkspace();
    assert.equal(active.name, "Second");
    assert.equal(active.path, d2);
    assert.equal(workspace.loadWorkspace(), d2);
  });

  it("activateWorkspace fails for unknown name", () => {
    cleanGitDockDir();
    workspace.addWorkspace("X", tmpDir());
    const r = workspace.activateWorkspace("Nope");
    assert.equal(r.success, false);
  });

  it("removeWorkspace removes from list and updates active", () => {
    cleanGitDockDir();
    workspace.addWorkspace("A", tmpDir());
    workspace.addWorkspace("B", tmpDir());

    workspace.removeWorkspace("A");
    const list = workspace.listWorkspaces();
    assert.equal(list.length, 1);
    assert.equal(list[0].name, "B");
    assert.equal(workspace.getActiveWorkspace().name, "B");
  });

  it("removeWorkspace clears active when last workspace removed", () => {
    cleanGitDockDir();
    workspace.addWorkspace("Only", tmpDir());
    workspace.removeWorkspace("Only");
    assert.equal(workspace.listWorkspaces().length, 0);
    assert.equal(workspace.getActiveWorkspace(), null);
    assert.equal(workspace.isWorkspaceConfigured(), false);
  });

  it("probePath detects config.json and accounts", () => {
    cleanGitDockDir();
    const d = tmpDir();
    fs.writeFileSync(path.join(d, "config.json"), JSON.stringify({
      accounts: {
        work: { provider: "github", githubUser: "octocat" },
        personal: { provider: "gitlab", gitlabUser: "me" },
      }
    }));
    const r = workspace.probePath(d);
    assert.equal(r.hasConfig, true);
    assert.equal(r.accounts.length, 2);
    assert.equal(r.accounts[0].name, "work");
    assert.equal(r.accounts[0].provider, "github");
    assert.equal(r.accounts[1].name, "personal");
    assert.equal(r.accounts[1].provider, "gitlab");
  });

  it("probePath detects git repos", () => {
    cleanGitDockDir();
    const d = tmpDir();
    const repoDir = path.join(d, "my-project", ".git");
    fs.mkdirSync(path.join(d, "my-project", ".git"), { recursive: true });
    fs.writeFileSync(path.join(d, "my-project", ".git", "config"),
      '[remote "origin"]\n\turl = git@github.com:user/my-project.git\n');
    const r = workspace.probePath(d);
    assert.equal(r.hasConfig, false);
    assert.equal(r.repos.length, 1);
    assert.equal(r.repos[0].name, "my-project");
    assert.equal(r.repos[0].provider, "github");
  });

  it("probePath detects gitlab repos", () => {
    cleanGitDockDir();
    const d = tmpDir();
    fs.mkdirSync(path.join(d, "gl-repo", ".git"), { recursive: true });
    fs.writeFileSync(path.join(d, "gl-repo", ".git", "config"),
      '[remote "origin"]\n\turl = git@gitlab.com:group/gl-repo.git\n');
    const r = workspace.probePath(d);
    assert.equal(r.repos.length, 1);
    assert.equal(r.repos[0].provider, "gitlab");
  });

  it("probePath returns empty for bare directory", () => {
    cleanGitDockDir();
    const d = tmpDir();
    const r = workspace.probePath(d);
    assert.equal(r.hasConfig, false);
    assert.equal(r.accounts.length, 0);
    assert.equal(r.repos.length, 0);
  });

  it("loadWorkspace returns active path or null", () => {
    cleanGitDockDir();
    assert.equal(workspace.loadWorkspace(), null);
    const d = tmpDir();
    workspace.addWorkspace("X", d);
    assert.equal(workspace.loadWorkspace(), d);
    workspace.activateWorkspace("X");
    assert.equal(workspace.loadWorkspace(), d);
  });

  it("saveWorkspace legacy compat creates Default workspace", () => {
    cleanGitDockDir();
    const d = tmpDir();
    const saved = workspace.saveWorkspace(d);
    assert.equal(saved, d);
    assert.ok(fs.existsSync(path.join(d, "config.json")));
    const active = workspace.getActiveWorkspace();
    assert.equal(active.name, "Default");
    assert.equal(active.path, d);
  });

  it("works with names containing special chars", () => {
    cleanGitDockDir();
    const d = tmpDir();
    const r = workspace.addWorkspace("My Work-Dev_1", d);
    assert.equal(r.success, true);
    assert.equal(workspace.listWorkspaces()[0].name, "My Work-Dev_1");
    const act = workspace.activateWorkspace("My Work-Dev_1");
    assert.equal(act.success, true);
  });

  it("works with deeply nested path", () => {
    cleanGitDockDir();
    const d = path.join(testDir, "a", "b", "c", "deep-ws");
    const r = workspace.addWorkspace("Deep", d);
    assert.equal(r.success, true);
    assert.ok(fs.existsSync(d));
    assert.ok(fs.existsSync(path.join(d, "config.json")));
  });

  it("multiple add+remove cycles", () => {
    cleanGitDockDir();
    for (let i = 0; i < 5; i++) {
      workspace.addWorkspace("W" + i, tmpDir());
    }
    assert.equal(workspace.listWorkspaces().length, 5);
    workspace.removeWorkspace("W2");
    assert.equal(workspace.listWorkspaces().length, 4);
    workspace.removeWorkspace("W0");
    assert.equal(workspace.listWorkspaces().length, 3);
    workspace.addWorkspace("New", tmpDir());
    assert.equal(workspace.listWorkspaces().length, 4);
    const names = workspace.listWorkspaces().map(w => w.name).sort();
    assert.deepEqual(names, ["New", "W1", "W3", "W4"]);
  });

  it("GITDOCK_DIR env var redirects storage", () => {
    cleanGitDockDir();
    const altDir = path.join(testDir, "alt-gitdock");
    const oldDir = process.env.GITDOCK_DIR;
    process.env.GITDOCK_DIR = altDir;
    // Clear module cache so workspace.js re-reads GITDOCK_DIR
    delete require.cache[require.resolve("../workspace")];
    const wsAlt = require("../workspace");
    try {
      wsAlt.addWorkspace("Alt", tmpDir());
      assert.ok(fs.existsSync(path.join(altDir, "workspace.json")));
    } finally {
      try { fs.rmSync(altDir, { recursive: true, force: true }); } catch (e) {}
      process.env.GITDOCK_DIR = oldDir;
      // Restore original cached module
      delete require.cache[require.resolve("../workspace")];
      require("../workspace");
    }
  });
});

describe("workspace API — integration", () => {
  const { app } = require("../server");
  const { api } = require("./helpers/http");

  before(() => {
    cleanGitDockDir();
  });

  it("GET /api/workspaces returns empty list", async () => {
    const res = await api(app).get("/api/workspaces");
    assert.equal(res.status, 200);
    assert.equal(res.body.workspaces.length, 0);
  });

  it("POST /api/workspaces adds a workspace", async () => {
    const d = tmpDir();
    const res = await api(app).post("/api/workspaces", { name: "TestWS", path: d });
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.match(res.body.message, /TestWS/);
  });

  it("POST /api/workspaces rejects duplicate name", async () => {
    const d = tmpDir();
    await api(app).post("/api/workspaces", { name: "Dup", path: d });
    const res = await api(app).post("/api/workspaces", { name: "Dup", path: tmpDir() });
    assert.equal(res.status, 400);
    assert.match(res.body.error, /name already exists/i);
  });

  it("POST /api/workspaces rejects invalid name", async () => {
    const res = await api(app).post("/api/workspaces", { name: "", path: tmpDir() });
    assert.equal(res.status, 400);
  });

  it("POST /api/workspaces rejects name with slashes", async () => {
    const res = await api(app).post("/api/workspaces", { name: "a/b", path: tmpDir() });
    assert.equal(res.status, 400);
  });

  it("POST /api/workspaces rejects invalid path", async () => {
    const res = await api(app).post("/api/workspaces", { name: "Bad", path: "/" });
    assert.equal(res.status, 400);
  });

  it("POST /api/workspaces rejects path outside home", async () => {
    const res = await api(app).post("/api/workspaces", { name: "Bad", path: "/etc/passwd" });
    assert.ok(res.status >= 400);
  });

  it("POST /api/workspaces rejects short path", async () => {
    const res = await api(app).post("/api/workspaces", { name: "Bad", path: "ab" });
    assert.equal(res.status, 400);
  });

  it("GET /api/workspaces lists all workspaces", async () => {
    await api(app).post("/api/workspaces", { name: "ListA", path: tmpDir() });
    await api(app).post("/api/workspaces", { name: "ListB", path: tmpDir() });
    const res = await api(app).get("/api/workspaces");
    assert.equal(res.status, 200);
    assert.ok(res.body.workspaces.length >= 2);
    const names = res.body.workspaces.map(w => w.name);
    assert.ok(names.includes("ListA"));
    assert.ok(names.includes("ListB"));
  });

  it("PUT /api/workspaces/activate switches workspace", async () => {
    const d1 = tmpDir();
    const d2 = tmpDir();
    await api(app).post("/api/workspaces", { name: "SwitchA", path: d1 });
    await api(app).post("/api/workspaces", { name: "SwitchB", path: d2 });
    const res = await api(app).put("/api/workspaces/activate", { name: "SwitchB" });
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.name, "SwitchB");
    assert.equal(res.body.path, d2);

    const status = await api(app).get("/api/workspaces");
    const a = status.body.workspaces.find(w => w.name === "SwitchB");
    assert.equal(a.active, true);
  });

  it("PUT /api/workspaces/activate fails for unknown name", async () => {
    const res = await api(app).put("/api/workspaces/activate", { name: "NoSuchWS" });
    assert.equal(res.status, 400);
    assert.match(res.body.error, /not found/i);
  });

  it("PUT /api/workspaces/activate requires name", async () => {
    const res = await api(app).put("/api/workspaces/activate", {});
    assert.equal(res.status, 400);
  });

  it("POST /api/workspaces/probe detects nothing in empty dir", async () => {
    const d = tmpDir();
    const res = await api(app).post("/api/workspaces/probe", { path: d });
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.hasConfig, false);
    assert.equal(res.body.repos.length, 0);
  });

  it("POST /api/workspaces/probe detects config.json", async () => {
    const d = tmpDir();
    fs.writeFileSync(path.join(d, "config.json"), JSON.stringify({
      accounts: { dev: { provider: "github" } }
    }));
    const res = await api(app).post("/api/workspaces/probe", { path: d });
    assert.equal(res.status, 200);
    assert.equal(res.body.hasConfig, true);
    assert.equal(res.body.accounts.length, 1);
    assert.equal(res.body.accounts[0].name, "dev");
  });

  it("POST /api/workspaces/probe detects git repos", async () => {
    const d = tmpDir();
    fs.mkdirSync(path.join(d, "found-repo", ".git"), { recursive: true });
    fs.writeFileSync(path.join(d, "found-repo", ".git", "config"),
      '[remote "origin"]\n\turl = git@github.com:user/found-repo.git\n');
    const res = await api(app).post("/api/workspaces/probe", { path: d });
    assert.equal(res.status, 200);
    assert.equal(res.body.repos.length, 1);
    assert.equal(res.body.repos[0].name, "found-repo");
  });

  it("POST /api/workspaces/probe rejects invalid path", async () => {
    const res = await api(app).post("/api/workspaces/probe", { path: "/" });
    assert.equal(res.status, 400);
  });

  it("DELETE /api/workspaces/:name removes workspace", async () => {
    const d = tmpDir();
    await api(app).post("/api/workspaces", { name: "DeleteMe", path: d });
    const list1 = await api(app).get("/api/workspaces");
    const count1 = list1.body.workspaces.length;

    const res = await api(app).del("/api/workspaces/DeleteMe");
    assert.equal(res.status, 200);

    const list2 = await api(app).get("/api/workspaces");
    assert.equal(list2.body.workspaces.length, count1 - 1);
    assert.equal(list2.body.workspaces.find(w => w.name === "DeleteMe"), undefined);
  });

  it("GET /api/workspace/status returns configured info (test mode)", async () => {
    const res = await api(app).get("/api/workspace/status");
    assert.equal(res.status, 200);
    assert.equal(res.body.configured, true);
    assert.ok(typeof res.body.path === "string");
  });

  it("POST /api/workspace/setup legacy compat", async () => {
    cleanGitDockDir();
    const d = tmpDir();
    const res = await api(app).post("/api/workspace/setup", { path: d });
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    const ws = workspace.getActiveWorkspace();
    assert.equal(ws.name, "Default");
    assert.equal(ws.path, d);
  });
});
