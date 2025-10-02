# npm-guard 🛡️

> Unified dependency health and supply-chain risk scanner for npm projects

[![npm version](https://img.shields.io/npm/v/npm-guard.svg)](https://www.npmjs.com/package/npm-guard)
[![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](https://opensource.org/licenses/ISC)
[![Node.js CI](https://github.com/yourusername/npm-guard/workflows/CI/badge.svg)](https://github.com/yourusername/npm-guard/actions)

## Why npm-guard?

Modern npm projects face increasing supply chain risks. While tools like `npm audit` check for known vulnerabilities, they miss critical signals like:

- 📦 **Deprecated packages** that may have security issues
- 🎯 **Typosquatting risks** from packages with similar names
- ⏰ **Fresh publishes** that haven't been vetted (<72h cooldown)
- 📊 **Maintenance signals** like stale packages or low popularity
- 🔍 **Holistic health scoring** across all risk factors

npm-guard provides a unified command to check all these risks at once.

## Features

✅ **Comprehensive Scanning**

- Deprecated package detection with messages
- Typosquatting and case-variant impersonation checks
- Cooldown warnings for recently published versions
- Maintenance signals (last publish, downloads, staleness)
- npm audit vulnerability integration

✅ **Actionable Output**

- Health score (0-100) for your entire project
- Per-package scoring and specific remediation advice
- Human-friendly console output or JSON for CI/CD
- Exit codes for CI gating

✅ **Fast & Lightweight**

- Zero runtime dependencies for scanning
- Parallel fetching for speed
- Works with existing npm/package-lock.json

## Installation

```bash
# Run without installing (recommended)
npx npm-guard

# Or install globally
npm install -g npm-guard

# Or add to your project
npm install --save-dev npm-guard
```

## Quick Scan

```bash
# Scan current directory
npx npm-guardian

# Output JSON for CI/CD
npx npm-guardian --json > report.json

# Fail if health score < 70
npx npm-guardian --fail-under 70
```

## Example Output

```
═══ npm-guardian Report ═══

Overall Health Score: 82/100
──────────────────────────────────────────────────

⚠ Deprecated packages: 1
⚠ Typosquat risks: 1
⏰ Recently published: 2

Vulnerabilities:
  🔴 Critical: 0
  🟠 High: 1
  🟡 Moderate: 3
  🔵 Low: 2

Package Details:
──────────────────────────────────────────────────

request@2.88.2
  Score: 45/100
  ⚠ DEPRECATED: request has been deprecated
  📊 Weekly downloads: 25,341,234
  📅 Last published: 4 years ago
  Recommendations:
    • Deprecated: request has been deprecated
    • Not updated in 4 years. May be unmaintained.
    • Consider migrating to: axios, node-fetch, or undici

lodash.debounce@4.0.8
  Score: 68/100
  🎯 Typosquat medium: Similar to lodash
  📊 Weekly downloads: 9,123,456
  📅 Last published: 6 years ago
```
