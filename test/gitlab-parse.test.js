const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const security = require("../lib/security");

describe("parseGitLabRepoUrl", () => {
  it("parses https gitlab.com URLs with group/subgroup", () => {
    assert.deepEqual(security.parseGitLabRepoUrl("https://gitlab.com/engineering/backend/api-service"), {
      owner: "engineering",
      repo: "api-service",
      groupPath: "engineering/backend",
      fullPath: "engineering/backend/api-service",
      hostname: "gitlab.com",
      provider: "gitlab",
    });
  });

  it("parses https with personal namespace", () => {
    assert.deepEqual(security.parseGitLabRepoUrl("https://gitlab.com/john.doe/my-project"), {
      owner: "john.doe",
      repo: "my-project",
      groupPath: "john.doe",
      fullPath: "john.doe/my-project",
      hostname: "gitlab.com",
      provider: "gitlab",
    });
  });

  it("parses SSH gitlab.com URLs", () => {
    assert.deepEqual(security.parseGitLabRepoUrl("git@gitlab.com:engineering/backend/api-service.git"), {
      owner: "engineering",
      repo: "api-service",
      groupPath: "engineering/backend",
      fullPath: "engineering/backend/api-service",
      hostname: "gitlab.com",
      provider: "gitlab",
    });
  });

  it("parses SSH with SSH alias host", () => {
    assert.deepEqual(security.parseGitLabRepoUrl("git@gitlab.com-work:group/sub/project.git"), {
      owner: "group",
      repo: "project",
      groupPath: "group/sub",
      fullPath: "group/sub/project",
      hostname: "gitlab.com",
      provider: "gitlab",
    });
  });

  it("parses self-hosted GitLab URLs", () => {
    assert.deepEqual(security.parseGitLabRepoUrl("https://gitlab.example.com/team/repo"), {
      owner: "team",
      repo: "repo",
      groupPath: "team",
      fullPath: "team/repo",
      hostname: "gitlab.example.com",
      provider: "gitlab",
    });
  });

  it("rejects non-gitlab hosts", () => {
    assert.equal(security.parseGitLabRepoUrl("https://github.com/octo/repo"), null);
  });

  it("returns null for malformed URLs", () => {
    assert.equal(security.parseGitLabRepoUrl("not-a-url"), null);
    assert.equal(security.parseGitLabRepoUrl(""), null);
  });
});

describe("parseGitLabRepoFromRemote", () => {
  it("parses git@gitlab.com SSH remote", () => {
    assert.deepEqual(security.parseGitLabRepoFromRemote("git@gitlab.com:engineering/backend/api-service.git"), {
      owner: "engineering",
      repo: "api-service",
      groupPath: "engineering/backend",
      fullPath: "engineering/backend/api-service",
      provider: "gitlab",
      hostname: "gitlab.com",
    });
  });

  it("parses https gitlab.com remote", () => {
    assert.deepEqual(security.parseGitLabRepoFromRemote("https://gitlab.com/engineering/backend/api-service.git"), {
      owner: "engineering",
      repo: "api-service",
      groupPath: "engineering/backend",
      fullPath: "engineering/backend/api-service",
      provider: "gitlab",
      hostname: "gitlab.com",
    });
  });

  it("parses remote with alias host", () => {
    assert.deepEqual(security.parseGitLabRepoFromRemote("git@gitlab.com-acme:group/sub/project.git"), {
      owner: "group",
      repo: "project",
      groupPath: "group/sub",
      fullPath: "group/sub/project",
      provider: "gitlab",
      hostname: "gitlab.com",
    });
  });

  it("returns null for malformed", () => {
    assert.equal(security.parseGitLabRepoFromRemote("not-a-remote"), null);
  });
});

describe("parseRepoUrl — provider detection", () => {
  it("detects GitHub URLs", () => {
    const r = security.parseRepoUrl("https://github.com/octo/Hello-World");
    assert.equal(r.provider, "github");
    assert.equal(r.owner, "octo");
    assert.equal(r.repo, "Hello-World");
  });

  it("detects GitLab URLs", () => {
    const r = security.parseRepoUrl("https://gitlab.com/group/subgroup/project");
    assert.equal(r.provider, "gitlab");
    assert.equal(r.owner, "group");
    assert.equal(r.repo, "project");
    assert.equal(r.groupPath, "group/subgroup");
  });

  it("detects SSH git@github.com URLs", () => {
    const r = security.parseRepoUrl("git@github.com:octo/repo.git");
    assert.equal(r.provider, "github");
    assert.equal(r.owner, "octo");
  });

  it("detects SSH git@gitlab.com URLs", () => {
    const r = security.parseRepoUrl("git@gitlab.com:group/repo.git");
    assert.equal(r.provider, "gitlab");
    assert.equal(r.owner, "group");
  });

  it("returns null for unknown hosts", () => {
    assert.equal(security.parseRepoUrl("https://bitbucket.org/user/repo"), null);
  });

  it("returns null for malformed input", () => {
    assert.equal(security.parseRepoUrl(""), null);
    assert.equal(security.parseRepoUrl("abc"), null);
  });
});
