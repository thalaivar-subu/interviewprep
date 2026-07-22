'use strict';

const fs = require('fs');
const path = require('path');

// dsa/javascript lives two levels above this file (cli/lib/scanner.js -> cli -> interviewprep -> dsa/javascript)
const ROOT = path.join(__dirname, '..', '..', 'dsa', 'javascript');

function walk(dir, results) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, results);
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      results.push(full);
    }
  }
  return results;
}

function deriveTitleFromUrl(url) {
  const m = url.match(/(?:leetcode\.com\/problems|hackerrank\.com\/challenges)\/([^/]+)/i);
  if (!m) return null;
  return m[1]
    .split('-')
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ');
}

function deriveUrlFromTitle(title) {
  const slug = title
    .toLowerCase()
    .replace(/'/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `https://leetcode.com/problems/${slug}/`;
}

function titleFromFileName(fileName) {
  const base = fileName.replace(/\.js$/, '');
  const spaced = base
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[-_]+/g, ' ')
    .trim();
  return spaced.replace(/\b\w/g, (c) => c.toUpperCase());
}

// Strips /**, /*, */, and a leading "*" from a single line, the way every
// file in this repo formats its header comment.
function stripCommentMarkers(line) {
  return line
    .trim()
    .replace(/^\/\*\*?/, '')
    .replace(/\*+\/$/, '')
    .replace(/^\*\s?/, '')
    .trim();
}

// The "NNN. Problem Title" line is only trustworthy as the FIRST piece of
// real content in the header comment - scanning further down the file
// finds false positives inside numbered example explanations (e.g.
// climbstairs.js has "1. 1 step + 1 step" inside its Example section,
// which is not a problem title).
function findNumberedTitle(lines) {
  for (const raw of lines.slice(0, 3)) {
    const line = stripCommentMarkers(raw);
    if (!line) continue;
    const m = line.match(/^(\d+)\.\s+(.+)$/);
    if (m) return { number: m[1], title: m[2].trim() };
    return null; // first real content line exists but isn't a title -> stop looking
  }
  return null;
}

const NOISE_LINES = new Set([
  'solved',
  'attempted',
  'easy',
  'medium',
  'hard',
  'topics',
  'premium lock icon',
  'companies',
  'hint',
]);
const STOP_PATTERN = /^(example\s*\d*:?|constraints:?|follow up:?|input:|output:|note:)/i;

// Matches the "O(n) time, O(n) space" style annotations added throughout
// this repo - never real problem prose, even when it's the only non-JSDoc
// line inside a file's comment block (e.g. the sort/ implementations).
function isComplexityLine(line) {
  return /O\([^)]*\)/.test(line) && /\btime\b/i.test(line) && /\bspace\b/i.test(line);
}

// Matches the boilerplate "Definition for a binary tree node. / function
// TreeNode(...) {...}" type-shape comment that many tree/list solutions
// paste ahead of the real problem statement. It's genuinely inside a
// comment (so the insideComment tracking alone won't exclude it), but
// it's still just documentation-as-code, never real prose.
function isTypeDefLine(line) {
  return /^(\/\/\s*)?definition for /i.test(line);
}

// Pulls a short (~2-3 line) plain-English summary out of the pasted
// LeetCode/HackerRank problem statement, skipping the number/title line,
// difficulty/topic noise, JSDoc @tags, URLs, and boilerplate type-shape
// comments, and stopping once the examples/constraints section starts.
// Only ever reads from INSIDE an actual /* ... */ comment block - files
// with no header comment (or where the comment closes with only JSDoc
// tags and no real prose inside it, e.g. the sort/ implementations)
// correctly yield no description instead of leaking raw source code as
// if it were problem text.
function extractDescription(lines) {
  const collected = [];
  let collecting = false;
  let insideComment = false;
  let skippingBlock = false;

  for (const raw of lines.slice(0, 80)) {
    const trimmedRaw = raw.trim();
    if (/^\/\*\*?/.test(trimmedRaw)) {
      insideComment = true;
      skippingBlock = false; // a fresh comment block - decide again
    }

    if (insideComment && skippingBlock) {
      // deliberately ignoring every line until this block closes
    } else if (insideComment) {
      const line = stripCommentMarkers(raw);

      if (!collecting) {
        if (line && isTypeDefLine(line)) {
          skippingBlock = true; // this whole block is boilerplate, not prose
        } else {
          const isRealContent =
            line &&
            line.length > 2 &&
            !NOISE_LINES.has(line.toLowerCase()) &&
            !/^\d+\.\s+/.test(line) && // the title line itself
            !/^@\w+/.test(line) && // jsdoc tag
            !/^https?:\/\//i.test(line) &&
            !isComplexityLine(line);
          if (isRealContent) {
            if (STOP_PATTERN.test(line)) return null; // hit examples before any real text
            collecting = true;
            collected.push(line);
          }
        }
      } else if (line) {
        if (
          STOP_PATTERN.test(line) ||
          /^@\w+/.test(line) ||
          /^https?:\/\//i.test(line) ||
          isComplexityLine(line)
        ) {
          break;
        }
        collected.push(line);
        if (collected.length >= 5) break;
      }
      // blank line while collecting: fall through and keep going
    } else if (collecting) {
      break; // the comment block closed while we were mid-description
    }

    if (/\*+\/\s*$/.test(trimmedRaw)) insideComment = false;
  }

  if (!collected.length) return null;
  let text = collected.join(' ').replace(/\s+/g, ' ').trim();
  if (text.length < 40) return null; // too short to be real prose (e.g. a stray complexity aside)
  if (text.length > 280) text = text.slice(0, 277).trimEnd() + '...';
  return text;
}

// Reads the leading comment header of a solution file to recover:
//   - the LeetCode/HackerRank problem number + title (repo convention: the
//     very first line inside the header comment is "NNN. Problem Title")
//   - an explicit URL if one is present
//   - a short plain-English description of the problem
//   - the noted time/space complexity, if the file has one
// Falls back gracefully (derives a title/URL, or leaves them null) for
// files that don't follow the convention (e.g. data-structure scaffolds
// like LL.js, minHeap.js) so those still show up as practice material.
function parseFile(absPath) {
  const content = fs.readFileSync(absPath, 'utf8');
  const lines = content.split(/\r?\n/);

  let number = null;
  let title = null;
  let url = null;

  const urlRegex = /(https?:\/\/(?:www\.)?(?:leetcode\.com|hackerrank\.com)\/\S+)/i;
  for (const line of lines.slice(0, 80)) {
    const m = line.match(urlRegex);
    if (m) {
      url = m[1].replace(/[)'"*]+$/, '');
      break;
    }
  }

  const titleMatch = findNumberedTitle(lines);
  if (titleMatch) {
    number = titleMatch.number;
    title = titleMatch.title;
  }

  if (!title && url) title = deriveTitleFromUrl(url);
  if (!title) title = titleFromFileName(path.basename(absPath));
  if (!url && number && title) url = deriveUrlFromTitle(title);

  const description = extractDescription(lines);

  let complexity = null;
  for (const line of lines) {
    if (/O\([^)]*\)/.test(line) && /time/i.test(line) && /space/i.test(line)) {
      complexity = line
        .replace(/^[\s/*]+/, '')
        .replace(/\*+\/\s*$/, '')
        .trim();
      break;
    }
  }

  return { number, title, url, description, complexity };
}

// Builds the full question index by walking dsa/javascript fresh every
// run - there is no manifest/database to keep in sync. Drop a new solved
// file anywhere under dsa/javascript and it's automatically included the
// next time dsaquiz runs.
function buildIndex() {
  const files = walk(ROOT, []);
  return files.map((absPath) => {
    const relPath = path.relative(ROOT, absPath).split(path.sep).join('/');
    const topic = path.dirname(relPath) === '.' ? '' : path.dirname(relPath);
    const meta = parseFile(absPath);
    const patternAbsPath = path.join(ROOT, ...(topic ? topic.split('/') : []), 'PATTERN.md');
    const hasPattern = fs.existsSync(patternAbsPath);
    return {
      relPath,
      absPath,
      topic,
      hasPattern,
      patternPath: hasPattern ? path.relative(process.cwd(), patternAbsPath) : null,
      ...meta,
    };
  });
}

function matchesTopic(entryTopic, query) {
  if (!query) return true;
  return entryTopic.toLowerCase().includes(query.toLowerCase());
}

function listTopics(index) {
  const counts = new Map();
  for (const entry of index) {
    const top = entry.topic.split('/')[0] || '(uncategorized)';
    counts.set(top, (counts.get(top) || 0) + 1);
  }
  return Array.from(counts.entries()).sort((a, b) => a[0].localeCompare(b[0]));
}

module.exports = { ROOT, buildIndex, matchesTopic, listTopics };
