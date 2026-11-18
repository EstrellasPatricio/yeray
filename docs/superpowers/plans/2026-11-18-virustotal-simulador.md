# VirusTotal Simulator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a backend function that takes a site URL and returns a fictional random integer score from 0 to 100.

**Architecture:** A standalone TypeScript service validates the site-only URL and generates a score with `Math.random`. Node's test runner, loaded through the existing `tsx` dependency, tests the contract without external services.

**Tech Stack:** TypeScript, Node.js, `tsx`; existing Fastify backend (no route changes).

**Spec:** `docs/superpowers/specs/2026-11-18-virustotal-simulador-design.md`

## Global Constraints

- Do not transmit or retain visited paths, queries, fragments, credentials, or ports.
- Do not call VirusTotal, Supabase, or the network.
- Do not add an HTTP endpoint in this change.

## Review Focus

- Invalid and non-HTTP URL: reject with `TypeError`.
- Site URLs with a path, query, fragment, credentials, or port: reject with `TypeError`.
- Local or private destinations: reject with `TypeError`.
- Random values at the low and high edges: return 0 and 100 respectively.
- Returned score: always an integer in [0, 100].

---

### Task 1: Implement simulator service

**Files:**
- Create: `backend/src/services/virustotal-simulator.ts`
- Create: `backend/src/services/virustotal-simulator.test.ts`
- Modify: `backend/package.json` (add `test` script)

**Interfaces:**
- Produces: `simularVirusTotal(url: string): number`.

- [x] **Step 1: Write failing tests** for accepted HTTP and HTTPS site URLs, invalid URLs, forbidden URL parts, local/private hosts, random boundaries, and integer range.
- [x] **Step 2: Run `npm test` in `backend`** and confirm tests fail because the function is missing.
- [x] **Step 3: Implement `simularVirusTotal(url: string): number`** using `URL` for parsing, validation before score generation, and `Math.floor(Math.random() * 101)` for an inclusive 0–100 integer.
- [x] **Step 4: Run `npm test` and `npm run build`** in `backend`; both must exit 0.
- [x] **Step 5: Review the diff** against the spec and commit the change on `codex/virustotal-simulador`.
