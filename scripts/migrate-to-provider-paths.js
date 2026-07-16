#!/usr/bin/env node
// =============================================================================
// scripts/migrate-to-provider-paths.js
//
// One-time migration: move existing GitHub repos from
//   BASE_DIR/<account>/<repo>  →  BASE_DIR/github/<account>/<repo>
//
// This converts the old flat directory layout to the new provider-based layout.
// Only affects accounts without an explicit "provider" field (assumed GitHub).
//
// Usage:
//   node scripts/migrate-to-provider-paths.js                    # normal run
//   node scripts/migrate-to-provider-paths.js --dry-run          # preview only
//   node scripts/migrate-to-provider-paths.js --undo             # revert last run
//   node scripts/migrate-to-provider-paths.js --base-dir <path>  # custom workspace
// =============================================================================

const fs = require("fs");
const path = require("path");

// ── Config ───────────────────────────────────────────────────────────────────
const BASE_DIR = findBaseDir();
const CONFIG_PATH = path.join(BASE_DIR, "config.json");
const UNDO_LOG = path.join(BASE_DIR, ".migration-undo.json");
const DRY_RUN = process.argv.includes("--dry-run");
const DO_UNDO = process.argv.includes("--undo");

// ── Helpers ──────────────────────────────────────────────────────────────────

function findBaseDir() {
  const idx = process.argv.indexOf("--base-dir");
  if (idx !== -1 && process.argv[idx + 1]) {
    return path.resolve(process.argv[idx + 1]);
  }
  const isPkg = !!require.main?.filename?.includes("/snapshot/");
  if (isPkg) {
    return path.dirname(process.execPath);
  }
  return path.resolve(__dirname, "..");
}

function log(msg) {
  const prefix = DRY_RUN ? "[DRY-RUN] " : "";
  console.log(prefix + msg);
}

function warn(msg) {
  console.warn("  ⚠  " + msg);
}

function info(msg) {
  console.log("  • " + msg);
}

function ok(msg) {
  console.log("  ✓ " + msg);
}

function exists(p) {
  return fs.existsSync(p);
}

function isGitRepo(dir) {
  try {
    return fs.existsSync(path.join(dir, ".git"));
  } catch { return false; }
}

function isDirEmpty(dir) {
  try {
    return fs.readdirSync(dir).length === 0;
  } catch { return false; }
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf8");
}

// ── Undo Log ─────────────────────────────────────────────────────────────────

function loadUndoLog() {
  if (!exists(UNDO_LOG)) return null;
  return readJson(UNDO_LOG);
}

function saveUndoLog(entries) {
  writeJson(UNDO_LOG, {
    migratedAt: new Date().toISOString(),
    baseDir: BASE_DIR,
    entries,
  });
  log("Undo log saved to: " + UNDO_LOG);
}

// ── Undo Previous Migration ──────────────────────────────────────────────────

function undoMigration() {
  console.log("\n=== Undo Previous Migration ===\n");
  const logData = loadUndoLog();
  if (!logData || !Array.isArray(logData.entries) || logData.entries.length === 0) {
    console.log("No migration undo log found at: " + UNDO_LOG);
    process.exit(0);
  }
  console.log("Undoing migration from " + logData.migratedAt + "\n");
  let reverted = 0;
  for (const entry of logData.entries) {
    const target = entry.oldPath;
    const source = entry.newPath;
    if (!exists(source)) {
      warn("Source gone, skipping: " + source);
      continue;
    }
    if (exists(target)) {
      warn("Target exists, skipping: " + target);
      continue;
    }
    if (!isGitRepo(source)) {
      warn("Not a git repo, skipping: " + source);
      continue;
    }
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.renameSync(source, target);
    ok("Reverted: " + source + " → " + target);
    reverted++;
  }
  // Clean up empty github/account dirs
  for (const entry of logData.entries) {
    const parent = path.dirname(entry.newPath);
    try { if (isDirEmpty(parent)) { fs.rmdirSync(parent); info("Removed empty: " + parent); } } catch {}
    const grandparent = path.dirname(parent);
    try { if (isDirEmpty(grandparent)) { fs.rmdirSync(grandparent); info("Removed empty: " + grandparent); } } catch {}
  }
  // Remove undo log
  try { fs.unlinkSync(UNDO_LOG); } catch {}
  console.log("\nReverted " + reverted + " repos. Undo log cleared.");
  process.exit(0);
}

// ── Main Migration ───────────────────────────────────────────────────────────

function migrate() {
  console.log("\n=== GitDock Repository Path Migration ===\n");
  if (DRY_RUN) console.log("DRY RUN — no files will be moved\n");
  console.log("Workspace: " + BASE_DIR);
  console.log("Config:    " + CONFIG_PATH + "\n");

  // 1. Load config
  const config = readJson(CONFIG_PATH);
  if (!config) {
    console.error("ERROR: Could not read config.json at " + CONFIG_PATH);
    process.exit(1);
  }

  const accounts = config.accounts || {};
  const accountKeys = Object.keys(accounts);
  if (accountKeys.length === 0) {
    console.log("No accounts found. Nothing to migrate.");
    process.exit(0);
  }

  // 2. Identify accounts needing migration (no provider field = old GitHub)
  const needsMigration = [];
  for (const name of accountKeys) {
    const acc = accounts[name];
    if (acc.provider && acc.provider !== "github") continue;
    const oldDir = path.join(BASE_DIR, name);
    if (!exists(oldDir)) continue;
    // Check if there are any repos in the old location
    const entries = fs.readdirSync(oldDir).filter(f => {
      const full = path.join(oldDir, f);
      return fs.statSync(full).isDirectory() && isGitRepo(full);
    });
    if (entries.length === 0) continue;
    // Also check if repos already exist in new location (e.g. partially migrated)
    const newDir = path.join(BASE_DIR, "github", name);
    const alreadyMigrated = exists(newDir) && fs.readdirSync(newDir).length > 0;
    needsMigration.push({ name, acc, oldDir, newDir, repos: entries, alreadyMigrated });
  }

  if (needsMigration.length === 0) {
    console.log("No repos need migration. All directories are up to date.");
    process.exit(0);
  }

  // 3. Display migration plan
  let totalRepos = 0;
  for (const m of needsMigration) {
    console.log("Account: " + m.name);
    console.log("  " + m.repos.length + " repo(s) at: " + m.oldDir);
    console.log("  Target: " + m.newDir);
    if (m.alreadyMigrated) warn("Target directory already has content — will skip conflicting names.");
    for (const repo of m.repos) {
      console.log("    • " + repo);
      totalRepos++;
    }
    console.log();
  }
  console.log("Total: " + totalRepos + " repo(s) across " + needsMigration.length + " account(s)\n");

  if (DRY_RUN) {
    console.log("DRY RUN complete. Pass no flags to execute.");
    process.exit(0);
  }

  // 4. Confirm
  console.log("WARNING: This will move " + totalRepos + " directory(ies).");
  console.log("An undo log will be saved to: " + UNDO_LOG);
  console.log("You can revert with: node scripts/migrate-to-provider-paths.js --undo\n");

  // 5. Execute migration
  const undoEntries = [];
  let moved = 0;
  let skipped = 0;

  for (const m of needsMigration) {
    const acc = m.acc;
    for (const repoName of m.repos) {
      const oldPath = path.join(m.oldDir, repoName);
      const newPath = path.join(m.newDir, repoName);

      if (exists(newPath)) {
        warn("Target exists, skipping: " + newPath);
        skipped++;
        continue;
      }

      if (!isGitRepo(oldPath)) {
        warn("Not a git repo, skipping: " + oldPath);
        skipped++;
        continue;
      }

      // Ensure target parent exists
      fs.mkdirSync(m.newDir, { recursive: true });

      // Move the directory
      try {
        fs.renameSync(oldPath, newPath);
        ok("Moved: " + oldPath + " → " + newPath);
        undoEntries.push({ oldPath, newPath, account: m.name, repo: repoName });
        moved++;
      } catch (err) {
        warn("Failed to move " + oldPath + ": " + err.message);
        skipped++;
      }
    }
  }

  // 6. Update config.json — add provider field
  let configUpdated = false;
  for (const m of needsMigration) {
    if (!m.acc.provider) {
      m.acc.provider = "github";
      configUpdated = true;
    }
  }
  if (configUpdated) {
    writeJson(CONFIG_PATH, config);
    ok("Updated config.json with provider: 'github' for migrated accounts.");
  }

  // 7. Clean up empty old directories
  for (const m of needsMigration) {
    try {
      if (isDirEmpty(m.oldDir)) {
        // Only remove if the only contents were .gitconfig-* (non-dir files are OK)
        const remaining = fs.readdirSync(m.oldDir);
        const onlyFiles = remaining.every(f => !fs.statSync(path.join(m.oldDir, f)).isDirectory());
        if (onlyFiles) {
          // Remove files and empty dir
          for (const f of remaining) fs.unlinkSync(path.join(m.oldDir, f));
          fs.rmdirSync(m.oldDir);
          info("Removed empty directory: " + m.oldDir);
        }
      }
    } catch {}
  }

  // 8. Save undo log
  if (undoEntries.length > 0) {
    saveUndoLog(undoEntries);
  }

  // 9. Summary
  console.log("\n=== Migration Complete ===");
  console.log("  Moved:  " + moved + " repo(s)");
  console.log("  Skipped: " + skipped + " repo(s)");
  if (moved > 0) {
    console.log("\n  Undo: node scripts/migrate-to-provider-paths.js --undo");
  }
  console.log();
}

// ── Entry ────────────────────────────────────────────────────────────────────
if (DO_UNDO) {
  undoMigration();
} else {
  migrate();
}
