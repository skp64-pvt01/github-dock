const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const path = require("path");
const os = require("os");
const fs = require("fs");
const routing = require("../lib/provider-routing");

const BASE_DIR = path.join(os.tmpdir(), "gitdock-paths-test-" + Date.now());

describe("getRepoPath — GitHub flat paths", () => {
  const account = { _name: "work", provider: "github", githubUser: "octo" };
  const opts = { account, repoName: "my-app", BASE_DIR };

  it("returns correct flat path", () => {
    const p = routing.getRepoPath(opts);
    assert.equal(p, path.join(BASE_DIR, "github", "work", "my-app"));
  });

  it("ignores groupPath for GitHub", () => {
    const p = routing.getRepoPath({ ...opts, groupPath: "ignored" });
    assert.equal(p, path.join(BASE_DIR, "github", "work", "my-app"));
  });

  it("rejects traversal in repo name", () => {
    const p = routing.getRepoPath({ ...opts, repoName: "../etc" });
    assert.equal(p, null);
  });
});

describe("getRepoPath — GitLab nested paths", () => {
  const account = { _name: "acmecorp", provider: "gitlab", gitlabUser: "acmecorp" };

  it("returns nested path with group", () => {
    const p = routing.getRepoPath({ account, repoName: "api-service", groupPath: "engineering/backend", BASE_DIR });
    assert.equal(p, path.join(BASE_DIR, "gitlab", "acmecorp", "engineering", "backend", "api-service"));
  });

  it("handles repo at root of account (no group)", () => {
    const p = routing.getRepoPath({ account, repoName: "my-project", BASE_DIR });
    assert.equal(p, path.join(BASE_DIR, "gitlab", "acmecorp", "my-project"));
  });

  it("handles deeply nested groups", () => {
    const p = routing.getRepoPath({ account, repoName: "deep-app", groupPath: "a/b/c/d", BASE_DIR });
    assert.equal(p, path.join(BASE_DIR, "gitlab", "acmecorp", "a", "b", "c", "d", "deep-app"));
  });

  it("rejects traversal in group path", () => {
    const p = routing.getRepoPath({ account, repoName: "safe", groupPath: "../etc", BASE_DIR });
    assert.equal(p, null);
  });
});

describe("getLocalDir", () => {
  it("returns correct dir for GitHub", () => {
    const g = routing.getLocalDir({ BASE_DIR, account: { _name: "work", provider: "github" } });
    assert.equal(g, path.join(BASE_DIR, "github", "work"));
  });

  it("returns correct dir for GitLab", () => {
    const g = routing.getLocalDir({ BASE_DIR, account: { _name: "acmecorp", provider: "gitlab" } });
    assert.equal(g, path.join(BASE_DIR, "gitlab", "acmecorp"));
  });

  it("defaults to github when no provider", () => {
    const g = routing.getLocalDir({ BASE_DIR, account: { _name: "default" } });
    assert.equal(g, path.join(BASE_DIR, "github", "default"));
  });
});

describe("getLegacyRepoPath", () => {
  it("returns old flat path", () => {
    const p = routing.getLegacyRepoPath({ accountName: "work", repoName: "my-app", BASE_DIR });
    assert.equal(p, path.join(BASE_DIR, "work", "my-app"));
  });

  it("rejects traversal", () => {
    const p = routing.getLegacyRepoPath({ accountName: "work", repoName: "../etc", BASE_DIR });
    assert.equal(p, null);
  });
});

describe("getSshHost", () => {
  it("returns default github alias", () => {
    const h = routing.getSshHost({ _name: "work", provider: "github" });
    assert.equal(h, "github.com-work");
  });

  it("returns default gitlab alias", () => {
    const h = routing.getSshHost({ _name: "acmecorp", provider: "gitlab" });
    assert.equal(h, "gitlab.com-acmecorp");
  });

  it("honors custom sshHost", () => {
    const h = routing.getSshHost({ _name: "work", provider: "github", sshHost: "custom-github" });
    assert.equal(h, "custom-github");
  });

  it("uses instance host for self-hosted GitLab", () => {
    const h = routing.getSshHost({ _name: "self", provider: "gitlab", instanceUrl: "https://gitlab.example.com" });
    assert.equal(h, "gitlab.example.com-self");
  });
});

describe("getCloneUrl", () => {
  it("builds GitHub clone URL", () => {
    const u = routing.getCloneUrl({ account: { _name: "work", provider: "github", githubUser: "octo" }, repoName: "my-app" });
    assert.equal(u, "git@github.com-work:octo/my-app.git");
  });

  it("builds GitLab clone URL with group path", () => {
    const u = routing.getCloneUrl({ account: { _name: "acmecorp", provider: "gitlab" }, repoName: "api-service", groupPath: "engineering/backend" });
    assert.equal(u, "git@gitlab.com-acmecorp:engineering/backend/api-service.git");
  });

  it("builds GitLab clone URL without group", () => {
    const u = routing.getCloneUrl({ account: { _name: "user", provider: "gitlab" }, repoName: "my-project" });
    assert.equal(u, "git@gitlab.com-user:my-project.git");
  });
});

describe("getProviderDisplayName", () => {
  it("returns GitHub for github", () => {
    assert.equal(routing.getProviderDisplayName("github"), "GitHub");
  });

  it("returns GitLab for gitlab", () => {
    assert.equal(routing.getProviderDisplayName("gitlab"), "GitLab");
  });

  it("defaults to GitHub for unknown", () => {
    assert.equal(routing.getProviderDisplayName(undefined), "GitHub");
  });
});
