#!/usr/bin/env bash
set -euo pipefail

PROJECT="gitdock"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# ── colours ──────────────────────────────────────────────────────────────
if [[ -t 1 ]]; then
  BOLD='\033[1m'; DIM='\033[2m'; GREEN='\033[0;32m'; YELLOW='\033[0;33m'
  RED='\033[0;31m'; CYAN='\033[0;36m'; NC='\033[0m'
else
  BOLD=''; DIM=''; GREEN=''; YELLOW=''; RED=''; CYAN=''; NC=''
fi
info()  { echo -e "${GREEN}==>${NC} $*"; }
warn()  { echo -e "${YELLOW}==>${NC} $*"; }
err()   { echo -e "${RED}==>${NC} $*" >&2; }
header(){ echo -e "\n${BOLD}${CYAN}── $* ──${NC}\n"; }

# ── helpers ──────────────────────────────────────────────────────────────
usage() {
  cat <<EOF
${BOLD}${PROJECT} — dev helper${NC}

${BOLD}Usage:${NC}
  ./scripts/dev.sh <command> [options]

${BOLD}Commands:${NC}
  deps             Install dependencies (npm install)
  test [suite]     Run tests. Suite: all (default), unit, api
  build [--watch]  Bundle with esbuild
  package          Build .deb package (requires dpkg-dev)
  commit <type> <msg>
                   Commit staged changes with conventional commit message.
                   Type: feat, fix, chore, docs, refactor, test, style, perf, ci
  tag <version>    Create signed tag (v<version>) and push
  release <ver>    Full pipeline: test → bump package.json → commit →
                   tag → package
  status           Show project health summary
  -h, --help       Show this help

${BOLD}Examples:${NC}
  ./scripts/dev.sh test
  ./scripts/dev.sh test unit
  ./scripts/dev.sh commit feat "add frobnicator widget"
  ./scripts/dev.sh tag 1.3.0
  ./scripts/dev.sh release 1.3.0

${BOLD}Environment:${NC}
  GIT_REMOTE       Remote to push tags to (default: origin)
  SKIP_PACKAGE     Set to 1 to skip .deb build in release
EOF
  exit ${1:-0}
}

die() { err "$1"; exit 1; }
have() { command -v "$1" &>/dev/null; }

# ── commands ─────────────────────────────────────────────────────────────

cmd_deps() {
  header "Installing dependencies"
  cd "$ROOT"
  npm install
  info "Done."
}

cmd_test() {
  local suite="${1:-all}"
  cd "$ROOT"
  case "$suite" in
    all)   header "Running all tests"
           node --test ;;
    unit)  header "Running unit tests"
           npm run test:unit ;;
    api)   header "Running API integration tests"
           npm run test:api ;;
    *)     die "Unknown test suite '$suite'. Use: all, unit, api" ;;
  esac
}

cmd_build() {
  header "Building bundle"
  cd "$ROOT"
  mkdir -p dist
  npm run build:bundle "$@"
  info "Bundle written to dist/server.bundle.js"
}

cmd_package() {
  have dpkg-buildpackage || die "dpkg-buildpackage not found (install dpkg-dev)"
  header "Building .deb package"
  cd "$ROOT"
  make deb
  info "Done. Package in parent directory."
}

cmd_commit() {
  local type="${1:-}"
  local msg="${2:-}"
  [[ -z "$type" || -z "$msg" ]] && die "Usage: ./scripts/dev.sh commit <type> <message>"
  cd "$ROOT"
  git diff --cached --quiet && die "Nothing staged for commit."
  local prefix
  case "$type" in
    feat|fix|chore|docs|refactor|test|style|perf|ci) prefix="$type" ;;
    *) die "Invalid type '$type'. Valid: feat, fix, chore, docs, refactor, test, style, perf, ci" ;;
  esac
  git commit -m "${prefix}: ${msg}"
  info "Committed."
}

cmd_tag() {
  local ver="${1:-}"
  [[ -z "$ver" ]] && die "Usage: ./scripts/dev.sh tag <version>"
  local remote="${GIT_REMOTE:-origin}"
  cd "$ROOT"
  [[ "$ver" != v* ]] && ver="v$ver"
  git tag -s "$ver" -m "Release $ver" 2>/dev/null || git tag "$ver" -m "Release $ver"
  git push "$remote" "$ver"
  info "Tag $ver pushed to $remote."
}

cmd_release() {
  local ver="${1:-}"
  [[ -z "$ver" ]] && die "Usage: ./scripts/dev.sh release <version>"
  local remote="${GIT_REMOTE:-origin}"
  cd "$ROOT"

  header "Release $ver — running tests"
  cmd_test all

  header "Release $ver — bumping package.json"
  cd "$ROOT"
  local pkg="package.json"
  local curr
  curr="$(jq -r .version "$pkg")"
  if [[ "$curr" != "$ver" ]]; then
    jq --arg v "$ver" '.version = $v' "$pkg" > "${pkg}.tmp" && mv "${pkg}.tmp" "$pkg"
    info "package.json: $curr → $ver"
  else
    info "package.json already at $ver"
  fi

  header "Release $ver — committing"
  git add "$pkg"
  git diff --cached --quiet || git commit -m "chore: bump version to $ver"

  header "Release $ver — tagging"
  [[ "$ver" != v* ]] && ver="v$ver"
  git tag -s "$ver" -m "Release $ver" 2>/dev/null || git tag "$ver" -m "Release $ver"
  git push "$remote" "$ver"
  info "Tag $ver pushed to $remote."

  if [[ "${SKIP_PACKAGE:-}" != "1" ]]; then
    cmd_package
  else
    info "SKIP_PACKAGE=1 — skipping .deb build."
  fi

  header "Release $ver — done"
}

cmd_status() {
  cd "$ROOT"
  echo ""
  echo -e "  ${BOLD}Project:${NC}  $PROJECT"
  echo -e "  ${BOLD}Version:${NC}  $(jq -r .version package.json)"
  echo -e "  ${BOLD}Branch:${NC}   $(git branch --show-current)"
  echo -e "  ${BOLD}Commit:${NC}   $(git rev-parse --short HEAD)"
  echo ""
  header "Dependencies"
  echo "    $(jq -r '.dependencies | keys[]' package.json | wc -l) prod / $(jq -r '.devDependencies | keys[]' package.json | wc -l) dev"
  echo ""
  header "Unstaged changes"
  git diff --stat || echo "    (none)"
  echo ""
  header "Staged changes"
  git diff --cached --stat || echo "    (none)"
  echo ""
  header "Test count"
  local t
  t=$(find "$ROOT/test" -name '*.test.js' | wc -l)
  echo "    $t test files"
  echo ""
  header "Last tag"
  git describe --tags --abbrev=0 2>/dev/null || echo "    (none)"
  echo ""
}

# ── dispatch ─────────────────────────────────────────────────────────────
[[ $# -eq 0 ]] && usage 0
case "${1:-}" in
  -h|--help) usage 0 ;;
  deps)      shift; cmd_deps "$@" ;;
  test)      shift; cmd_test "$@" ;;
  build)     shift; cmd_build "$@" ;;
  package)   shift; cmd_package "$@" ;;
  commit)    shift; cmd_commit "$@" ;;
  tag)       shift; cmd_tag "$@" ;;
  release)   shift; cmd_release "$@" ;;
  status)    shift; cmd_status "$@" ;;
  *)         err "Unknown command: $1"; usage 1 ;;
esac
