#!/usr/bin/env node
/**
 * Import LinkedIn writing from an official data export into src/data/linkedin.ts.
 *
 * LinkedIn does not offer a public posts API for personal portfolios. The supported
 * path is their data download (Settings → Data privacy → Get a copy of your data).
 *
 * For a FULL feed, request at least:
 *   - Articles
 *   - Posts  (this produces Shares.csv / Posts.csv with commentary + ShareLink)
 *
 * A "basic" archive often only ships Articles HTML and will not include posts.
 *
 * Usage:
 *   npm run import:linkedin -- ~/Downloads/Complete_LinkedInDataExport_....zip
 *   npm run import:linkedin -- /path/to/extracted-export-folder
 *
 * Options:
 *   --dry-run     Parse and print summary; do not write the data file
 *   --min-chars N Drop posts shorter than N chars (default 40)
 */

import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_FILE = join(ROOT, "src/data/linkedin.ts");
const DEFAULT_MIN_CHARS = 40;

function usage(code = 1) {
  console.log(`Usage: npm run import:linkedin -- <export.zip|export-dir> [--dry-run] [--min-chars N]`);
  process.exit(code);
}

function parseArgs(argv) {
  const args = { path: null, dryRun: false, minChars: DEFAULT_MIN_CHARS };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dry-run") args.dryRun = true;
    else if (a === "--min-chars") {
      args.minChars = Number(argv[++i]);
      if (!Number.isFinite(args.minChars) || args.minChars < 0) {
        console.error("Invalid --min-chars");
        usage();
      }
    } else if (a === "--help" || a === "-h") usage(0);
    else if (!a.startsWith("-") && !args.path) args.path = a;
    else {
      console.error(`Unknown arg: ${a}`);
      usage();
    }
  }
  if (!args.path) usage();
  return args;
}

function sanitizeText(input) {
  return String(input ?? "")
    .replace(/\u2014|\u2013/g, "-") // PRD: no em/en dashes in visible copy
    .replace(/\u2018|\u2019/g, "'")
    .replace(/\u201c|\u201d/g, '"')
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stripHtml(html) {
  return sanitizeText(
    String(html ?? "")
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
  );
}

function wordCount(text) {
  const t = sanitizeText(text);
  if (!t) return 0;
  return t.split(/\s+/).length;
}

function readMinutesFromWords(words) {
  return Math.max(1, Math.round(words / 200));
}

function formatPubDate(dateIso) {
  const d = new Date(`${dateIso}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return dateIso;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function toDateIso(raw) {
  const s = String(raw ?? "").trim();
  if (!s) return null;
  // "2026-05-22 09:28" | "2026-05-22" | ISO
  const m = s.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  const parsed = new Date(s);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }
  return null;
}

/** Sortable instant; keeps time-of-day when the export provides it. */
function toSortKey(raw) {
  const s = String(raw ?? "").trim();
  if (!s) return "1970-01-01T00:00:00Z";
  const withTime = s.match(
    /(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/
  );
  if (withTime) {
    const sec = withTime[6] ?? "00";
    return `${withTime[1]}-${withTime[2]}-${withTime[3]}T${withTime[4]}:${withTime[5]}:${sec}Z`;
  }
  const day = toDateIso(s);
  return day ? `${day}T00:00:00Z` : "1970-01-01T00:00:00Z";
}

function slugify(input) {
  return sanitizeText(input)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

function titleFromBody(body, fallback = "LinkedIn post") {
  const clean = sanitizeText(body);
  if (!clean) return fallback;
  const first = clean.split(/(?<=[.!?])\s+/)[0] || clean;
  if (first.length <= 90) return first;
  const cut = first.slice(0, 87);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 40 ? cut.slice(0, lastSpace) : cut).trim()}...`;
}

function excerptFromBody(body, max = 180) {
  const clean = sanitizeText(body);
  if (!clean) return "";
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  let trimmed = (lastSpace > 80 ? cut.slice(0, lastSpace) : cut).trim();
  trimmed = trimmed.replace(/[.,;:]+$/, "");
  return `${trimmed}...`;
}

/** Minimal CSV parser that respects quotes and newlines inside fields. */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let i = 0;
  let inQuotes = false;
  const src = text.replace(/^\uFEFF/, "");

  while (i < src.length) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += ch;
      i++;
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (ch === ",") {
      row.push(field);
      field = "";
      i++;
      continue;
    }
    if (ch === "\n" || (ch === "\r" && src[i + 1] === "\n")) {
      if (ch === "\r") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      i++;
      continue;
    }
    if (ch === "\r") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      i++;
      continue;
    }
    field += ch;
    i++;
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function rowsToObjects(rows) {
  if (!rows.length) return [];
  const headers = rows[0].map((h) => h.trim());
  return rows.slice(1).map((cells) => {
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = cells[idx] ?? "";
    });
    return obj;
  });
}

function findFiles(root, predicate) {
  const out = [];
  const stack = [root];
  while (stack.length) {
    const dir = stack.pop();
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      let st;
      try {
        st = statSync(full);
      } catch {
        continue;
      }
      if (st.isDirectory()) stack.push(full);
      else if (predicate(full, name)) out.push(full);
    }
  }
  return out.sort();
}

function extractZip(zipPath) {
  const dir = mkdtempSync(join(tmpdir(), "linkedin-export-"));
  execFileSync("unzip", ["-q", "-o", zipPath, "-d", dir], { stdio: "pipe" });
  return dir;
}

function resolveExportRoot(inputPath) {
  const abs = resolve(inputPath);
  if (!existsSync(abs)) {
    throw new Error(`Path not found: ${abs}`);
  }
  const st = statSync(abs);
  if (st.isDirectory()) return { root: abs, cleanup: null };

  const lower = abs.toLowerCase();
  if (!lower.endsWith(".zip")) {
    throw new Error("Expected a .zip export or an extracted directory");
  }
  const root = extractZip(abs);
  return { root, cleanup: () => rmSync(root, { recursive: true, force: true }) };
}

function parseArticles(root) {
  const files = findFiles(
    root,
    (_full, name) =>
      name.toLowerCase().endsWith(".html") &&
      (_full.includes(`${join("Articles", "Articles")}`) ||
        /Articles[/\\]Articles[/\\]/i.test(_full) ||
        /[/\\]Articles[/\\][^/\\]+\.html$/i.test(_full))
  );

  // Prefer nested Articles/Articles/*.html; fall back to any under Articles/
  const articleFiles =
    files.length > 0
      ? files
      : findFiles(
          root,
          (full, name) =>
            name.toLowerCase().endsWith(".html") &&
            /[/\\]Articles[/\\]/i.test(full)
        );

  const entries = [];
  for (const file of articleFiles) {
    const html = readFileSync(file, "utf8");
    const titleMatch =
      html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) ||
      html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = sanitizeText(stripHtml(titleMatch?.[1] ?? basename(file, ".html")));
    const pubMatch = html.match(/Published on\s+([^<]+)/i);
    const createdMatch = html.match(/Created on\s+([^<]+)/i);
    const stamp = pubMatch?.[1] || createdMatch?.[1] || "";
    const dateIso = toDateIso(stamp) || "1970-01-01";
    const sortKey = toSortKey(stamp);

    const bodyHtml =
      html.match(/<div>([\s\S]*)<\/div>\s*<\/body>/i)?.[1] ??
      html.match(/<body[^>]*>([\s\S]*)<\/body>/i)?.[1] ??
      html;
    const bodyText = stripHtml(bodyHtml);
    // Drop metadata lines that sometimes sit in the body
    const bodyClean = bodyText
      .replace(/^Published on[^.]*\.\s*/i, "")
      .replace(/^Created on[^.]*\.\s*/i, "");

    const stem = basename(file, extname(file));
    const href = `https://www.linkedin.com/pulse/${stem}`;
    const words = wordCount(bodyClean);

    entries.push({
      id: `article-${slugify(stem)}`,
      title: title || titleFromBody(bodyClean, stem),
      excerpt: excerptFromBody(bodyClean),
      href,
      date: dateIso,
      sortKey,
      pubDate: formatPubDate(dateIso),
      readMinutes: readMinutesFromWords(words),
      kind: "article",
      visibility: "PUBLIC",
    });
  }
  return entries;
}

function pickField(row, names) {
  for (const name of names) {
    if (row[name] != null && String(row[name]).trim()) return String(row[name]);
  }
  // case-insensitive fallback
  const keys = Object.keys(row);
  for (const name of names) {
    const hit = keys.find((k) => k.toLowerCase() === name.toLowerCase());
    if (hit && String(row[hit]).trim()) return String(row[hit]);
  }
  return "";
}

function parseShares(root, minChars) {
  const candidates = findFiles(
    root,
    (_full, name) => {
      const n = name.toLowerCase();
      return n === "shares.csv" || n === "posts.csv" || n === "shares.csv.csv";
    }
  );

  if (!candidates.length) return { entries: [], files: [] };

  const entries = [];
  for (const file of candidates) {
    const text = readFileSync(file, "utf8");
    const objects = rowsToObjects(parseCsv(text));
    for (const row of objects) {
      const commentary = sanitizeText(
        pickField(row, [
          "ShareCommentary",
          "ShareContent",
          "Commentary",
          "PostText",
          "Text",
          "Content",
        ])
      );
      const shareLink = sanitizeText(
        pickField(row, ["ShareLink", "Share Url", "ShareURL", "Link", "Url", "URL"])
      );
      const sharedUrl = sanitizeText(
        pickField(row, ["SharedUrl", "Shared URL", "ArticleLink"])
      );
      const visibility = sanitizeText(
        pickField(row, ["Visibility", "VisibilityState"]) || "PUBLIC"
      ).toUpperCase();
      const dateRaw = pickField(row, ["Date", "DateTime", "Created At", "CreatedAt"]);
      const dateIso = toDateIso(dateRaw);
      const sortKey = toSortKey(dateRaw);
      if (!dateIso) continue;

      // Skip empty reshare shells with no commentary
      if (commentary.length < minChars && !sharedUrl) continue;
      if (visibility && !["PUBLIC", "ANYONE", ""].includes(visibility)) {
        // Keep CONNECTIONS-visible posts; drop only truly private if labeled
        if (visibility.includes("ONLY_ME") || visibility.includes("PRIVATE")) continue;
      }

      // Prefer canonical post permalink; fall back to shared URL; else profile
      let href = shareLink || sharedUrl;
      if (href && href.startsWith("/")) {
        href = `https://www.linkedin.com${href}`;
      }
      if (!href) href = "https://www.linkedin.com/in/yashsharma31/";

      // Skip duplicates of pulse articles already imported via Articles/
      if (/linkedin\.com\/pulse\//i.test(href)) continue;

      const body = commentary || sharedUrl;
      const idBase = slugify(`${dateIso}-${titleFromBody(body).slice(0, 40)}`) || dateIso;

      entries.push({
        id: `post-${idBase}`,
        title: titleFromBody(body),
        excerpt: excerptFromBody(body),
        href,
        date: dateIso,
        sortKey,
        pubDate: formatPubDate(dateIso),
        readMinutes: readMinutesFromWords(wordCount(body)),
        kind: "post",
        visibility: visibility || "PUBLIC",
      });
    }
  }

  return { entries, files: candidates };
}

function dedupe(entries) {
  const seenHref = new Set();
  const seenId = new Set();
  const out = [];
  for (const e of entries) {
    const hrefKey = e.href.replace(/\/$/, "").toLowerCase();
    if (seenHref.has(hrefKey) || seenId.has(e.id)) continue;
    // Prefer article rows over post rows for same title+date
    seenHref.add(hrefKey);
    seenId.add(e.id);
    out.push(e);
  }
  return out;
}

function sortNewestFirst(entries) {
  return [...entries].sort((a, b) => {
    if (a.sortKey !== b.sortKey) return a.sortKey < b.sortKey ? 1 : -1;
    if (a.kind !== b.kind) return a.kind === "article" ? -1 : 1;
    return a.title.localeCompare(b.title);
  });
}

function renderDataFile(entries) {
  const payload = entries.map(
    ({ visibility: _v, sortKey: _s, ...rest }) => rest
  );
  const json = JSON.stringify(payload, null, 2);

  return `/**
 * Curated LinkedIn writing.
 * AUTO-GENERATED by scripts/import-linkedin-export.mjs - do not hand-edit.
 * Re-run: npm run import:linkedin -- <export.zip|dir>
 */

import { CONTACT_LINKS } from "@/utils/constants";

export type LinkedInEntry = {
  id: string;
  title: string;
  excerpt: string;
  href: string;
  /** ISO date YYYY-MM-DD for sort; display via pubDate */
  date: string;
  pubDate: string;
  readMinutes: number;
  kind: "article" | "post";
};

export const LINKEDIN_PROFILE = CONTACT_LINKS.linkedin;

/** Newest first. */
export const LINKEDIN_ENTRIES: LinkedInEntry[] = ${json};
`;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  let cleanup = null;
  try {
    const resolved = resolveExportRoot(args.path);
    cleanup = resolved.cleanup;
    const { root } = resolved;

    const articles = parseArticles(root);
    const { entries: posts, files: shareFiles } = parseShares(root, args.minChars);
    const merged = sortNewestFirst(dedupe([...articles, ...posts]));

    console.log(`Export root: ${root}`);
    console.log(`Articles:    ${articles.length}`);
    console.log(`Posts:       ${posts.length}${shareFiles.length ? ` (from ${shareFiles.map((f) => basename(f)).join(", ")})` : " (no Shares.csv / Posts.csv found)"}`);
    console.log(`Total kept:  ${merged.length}`);

    if (!shareFiles.length) {
      console.warn(`
⚠  No Shares.csv / Posts.csv in this archive.
   LinkedIn's "basic" download often omits posts.
   Request a new archive with Posts + Articles checked:
     LinkedIn → Settings → Data privacy → Get a copy of your data
     → Download larger data archive → select Posts and Articles
   Then re-run:
     npm run import:linkedin -- ~/Downloads/<complete-export>.zip
`);
    }

    if (!merged.length) {
      console.error("No articles or posts found. Aborting write.");
      process.exit(2);
    }

    if (args.dryRun) {
      console.log("\nDry run — first 5 entries:");
      for (const e of merged.slice(0, 5)) {
        console.log(`  [${e.kind}] ${e.date}  ${e.title}`);
      }
      return;
    }

    writeFileSync(OUT_FILE, renderDataFile(merged), "utf8");
    console.log(`Wrote ${merged.length} entries → ${OUT_FILE}`);
  } finally {
    if (cleanup) cleanup();
  }
}

main();
