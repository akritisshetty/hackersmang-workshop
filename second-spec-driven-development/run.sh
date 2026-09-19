#!/usr/bin/env bash
#
# One-shot runner for the spec-driven shop (frontend-only React app).
#   ./run.sh          install deps, run all spec files, build the client
#   ./run.sh dev      start the dev server (http://localhost:5173)
#   ./run.sh test     only run the spec files
#   ./run.sh start    serve the production build (http://localhost:4173)
#
set -euo pipefail
cd "$(dirname "$0")"

BOLD=$'\033[1m'
GREEN=$'\033[0;32m'
RED=$'\033[0;31m'
YELLOW=$'\033[0;33m'
RESET=$'\033[0m'

step() { printf "%s\n" "${BOLD}==>${RESET} $*"; }
ok()   { printf "%s\n" "${GREEN}✓${RESET} $*"; }
fail() { printf "%s\n" "${RED}✗${RESET} $*"; exit 1; }
warn() { printf "%s\n" "${YELLOW}!${RESET} $*"; }

command -v node >/dev/null 2>&1 || fail "Node.js is required but not installed."
command -v npm  >/dev/null 2>&1 || fail "npm is required but not installed."

install() {
  step "Installing all dependencies..."
  npm install
  ok "Dependencies installed."
}

run_specs() {
  step "Running all spec files (login, dashboard, cart)..."
  npm test
  ok "All spec files passed."
}

build_client() {
  step "Building the production bundle..."
  npm run build
  ok "Build complete (dist/)."
}

dev() {
  warn "Demo credentials: user@example.com / password123"
  step "Starting the development server on http://localhost:5173 ..."
  npm run dev
}

serve_built() {
  if [ ! -d dist ]; then
    warn "dist/ missing – building first."
    build_client
  fi
  warn "Demo credentials: user@example.com / password123"
  step "Serving the production build on http://localhost:4173 ..."
  npm run start
}

case "${1:-}" in
  dev)
    [ -d node_modules ] || install
    dev
    ;;
  test)
    [ -d node_modules ] || install
    run_specs
    ;;
  start)
    [ -d node_modules ] || install
    build_client
    serve_built
    ;;
  *)
    install
    run_specs
    build_client
    step "Done. Start the app with: ${BOLD}./run.sh dev${RESET}"
    ;;
esac