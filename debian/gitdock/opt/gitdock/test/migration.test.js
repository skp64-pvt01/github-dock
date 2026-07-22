const { describe, it, before, after } = require("node:test");
const assert = require("node:assert/strict");
const path = require("path");
const fs = require("fs");
const os = require("os");

const BASE_DIR = path.join(os.tmpdir(), "gitdock-migration-test-" + Date.now());

function runMigration(args) {
  const cp = require("child_process");
  const script = path.resolve(__dirname, "..", "scripts", "migrate-to-provider-paths.js");
  const result = cp.spawnSync(process.execPath, [script, "--base-dir", BASE_DIR, ...args], {
    encoding: "utf8",
    timeout: 10000,
  });
  return { code: result.status, stdout: result.stdout, stderr: result.stderr };
}

function exists(p) { return fs.existsSync(p); }
function mkdir(p) { fs.mkdirSync(p, { recursive: true }); }
function writeJson(p, data) { fs.writeFileSync(p, JSON.stringify(data, null, 2), "utf8"); }
function writeConfig(accounts) {
  writeJson(path.join(BASE_DIR, "config.json"), { accounts });
}
function initRepo(dir) {
  mkdir(dir);
  fs.writeFileSync(path.join(dir, ".git"), "dummy git dir marker", "utf8");
}

describe("migration script", () => {
  before(() => {
    mkdir(BASE_DIR);
  });

  after(() => {
    fs.rmSync(BASE_DIR, { recursive: true, force: true });
  });

  it("exits cleanly when no accounts exist", () => {
    writeConfig({});
    const r = runMigration([]);
    assert.equal(r.code, 0);
    assert.match(r.stdout, /No accounts found/);
  });

  it("exits cleanly when no repos need migration", () => {
    writeConfig({ work: { provider: "github", githubUser: "octo" } });
    const r = runMigration([]);
    assert.equal(r.code, 0);
    assert.match(r.stdout, /up to date/);
  });

  it("migrates repos from old layout to new layout", () => {
    const oldDir = path.join(BASE_DIR, "work");
    const newDir = path.join(BASE_DIR, "github", "work");
    mkdir(oldDir);
    initRepo(path.join(oldDir, "my-app"));
    initRepo(path.join(oldDir, "another-repo"));
    // Config without provider — needs migration
    writeConfig({ work: { githubUser: "octo" } });

    const r = runMigration([]);
    assert.equal(r.code, 0, "stdout: " + r.stdout);
    assert.match(r.stdout, /Moved.*my-app/);
    assert.match(r.stdout, /Moved.*another-repo/);
    assert.match(r.stdout, /Updated config\.json/);

    // Verify new locations
    assert.ok(!exists(path.join(oldDir, "my-app")), "old repo should not exist");
    assert.ok(exists(path.join(newDir, "my-app")), "new repo should exist");
    assert.ok(exists(path.join(newDir, "another-repo")), "new repo should exist");

    // Verify config was updated
    const config = JSON.parse(fs.readFileSync(path.join(BASE_DIR, "config.json"), "utf8"));
    assert.equal(config.accounts.work.provider, "github");

    // Clean up for next test
    fs.rmSync(oldDir, { recursive: true, force: true });
    fs.rmSync(newDir, { recursive: true, force: true });
  });

  it("skips repos that already exist in target", () => {
    const oldDir = path.join(BASE_DIR, "work");
    const newDir = path.join(BASE_DIR, "github", "work");
    mkdir(oldDir);
    mkdir(newDir);
    initRepo(path.join(oldDir, "my-app"));
    initRepo(path.join(newDir, "my-app")); // pre-existing
    writeConfig({ work: { githubUser: "octo" } });

    const r = runMigration([]);
    assert.equal(r.code, 0);
    assert.match(r.stderr, /Target exists, skipping/);
    assert.match(r.stdout, /Skipped: 1/);

    // Clean up
    fs.rmSync(oldDir, { recursive: true, force: true });
    fs.rmSync(newDir, { recursive: true, force: true });
  });

  it("dry-run does not move any files", () => {
    const oldDir = path.join(BASE_DIR, "dry");
    mkdir(oldDir);
    initRepo(path.join(oldDir, "test-repo"));
    writeConfig({ dry: { githubUser: "test" } });

    const r = runMigration(["--dry-run"]);
    assert.equal(r.code, 0);
    assert.match(r.stdout, /DRY RUN/);
    assert.match(r.stdout, /DRY RUN complete/);
    // Old repo should still exist
    assert.ok(exists(path.join(oldDir, "test-repo")));
    assert.ok(!exists(path.join(BASE_DIR, "github", "dry", "test-repo")));

    // Clean up
    fs.rmSync(oldDir, { recursive: true, force: true });
  });

  it("undo restores moved repos to original location", () => {
    const oldDir = path.join(BASE_DIR, "undo");
    const newDir = path.join(BASE_DIR, "github", "undo");
    mkdir(oldDir);
    initRepo(path.join(oldDir, "undo-repo"));
    initRepo(path.join(oldDir, "another"));
    writeConfig({ undo: { githubUser: "test" } });

    // Run migration
    let r = runMigration([]);
    assert.equal(r.code, 0);

    // Verify moved
    assert.ok(exists(path.join(newDir, "undo-repo")));

    // Run undo
    r = runMigration(["--undo"]);
    assert.equal(r.code, 0);
    assert.match(r.stdout, /Reverted/);

    // Verify restored
    assert.ok(exists(path.join(oldDir, "undo-repo")));
    assert.ok(!exists(path.join(newDir, "undo-repo")));

    // Clean up
    fs.rmSync(oldDir, { recursive: true, force: true });
    fs.rmSync(newDir, { recursive: true, force: true });
  });
});
