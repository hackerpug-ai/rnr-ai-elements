---
stability: PRODUCT_CONTEXT
last_validated: 2026-09-08
prd_version: 1.0.0
---

# Docs Site (Astro on Cloudflare)

## Product description

A documentation site for rnr-ai-elements — the React Native Reusables port of Vercel's AI Elements — built in Astro 7 inside the existing pnpm monorepo (`apps/docs`), where every prose page is markdown in the repo (content collections) and every reference page is generated at build from the registry data that actually ships. It deploys as Cloudflare Workers static assets at **rnraielements.com** and serves the registry JSON itself from the same deploy at `/r/{engine}/{item}.json`, so install commands and docs can never diverge.

## Problem statement

The library is complete (56 registry items at v0.2.1) and installable end to end, but it is invisible: the repo ships **no README, no LICENSE, and no docs of any kind** — `registry.json` already advertises `github.com/hackerpug-ai/rnr-ai-elements` to a dead end. Every failure mode a copy-paste registry can hit is currently unguarded in public: npm confusion ("just `npm install` it"), the short-name shadcn collision that silently installs the web component, engine mixing (nativewind v3 vs uniwind/Tailwind v4), the Expo Go cliff for the 4 dev-client items, and AI agents hallucinating install commands because no machine-readable docs exist.

## Solution summary

One site answers all five personas in one visit each: an evaluation surface (home counters + QR-to-phone + changelog), install correctness (engine decision guide, absolute-URL commands with copy, per-item dependency and verdict panels), a generated 56-item ledger and 39 component reference pages that cannot drift from `public/r` because they are built from it, a theming guide that demos the library's own oklch token system live, the owns-vs-does-not boundary as tables, porting notes with deviations — plus the restored GitHub trust surface (README, LICENSE, CONTRIBUTING, release notes) and `llms.txt`/`llms-full.txt` for agents. Delivery is fail-closed: the docs build runs behind the registry-freshness chain, the deploy is gated behind every quality job, and rollback is one command.
