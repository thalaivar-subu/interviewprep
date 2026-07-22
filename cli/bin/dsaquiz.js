#!/usr/bin/env node
'use strict';

const path = require('path');
const readline = require('readline');
const { buildIndex, matchesTopic, listTopics, ROOT } = require('../lib/scanner');
const { bold, cyan, green, yellow, dim } = require('../lib/format');

function printHelp() {
  console.log(`
${bold('dsaquiz')} - random DSA/LeetCode question picker from dsa/javascript

Run it with no flags in a real terminal and you get an interactive
session: one question at a time, nothing that hints at the pattern until
you ask for it, and you keep going until you quit.

Usage:
  dsaquiz [topic]              start an interactive session, optionally
                                filtered by topic
  dsaquiz --topic <name>        same, explicit flag
  dsaquiz --list                list all topics with problem counts, then exit
  dsaquiz --reveal              non-interactive: print --count question(s)
                                with immediate reveal, then exit (for
                                scripting - not for actually testing yourself)
  dsaquiz --count <n>           with --reveal, how many questions to print
  dsaquiz --help                this message

Topic matching is a case-insensitive substring match against the folder
path, e.g. "dp", "backtracking", "sliding-window", "bfs" all work.

Inside an interactive session:
  [Enter]        reveal the answer / move to the next question
  s              skip the current question without revealing
  t <topic>      switch the topic filter (blank clears it)
  l              list topics
  q              quit

Examples:
  dsaquiz
  dsaquiz dp
  dsaquiz --topic sliding-window
  dsaquiz --reveal --count 3
`);
}

function parseArgs(argv) {
  const opts = { topic: null, count: 1, list: false, reveal: false, help: false };

  const normalized = [];
  for (const a of argv) {
    const eq = a.match(/^(--[a-zA-Z-]+)=(.*)$/);
    if (eq) normalized.push(eq[1], eq[2]);
    else normalized.push(a);
  }

  for (let i = 0; i < normalized.length; i++) {
    const a = normalized[i];
    if (a === '--list' || a === '-l') opts.list = true;
    else if (a === '--topic' || a === '-t') opts.topic = normalized[++i];
    else if (a === '--count' || a === '-n') opts.count = parseInt(normalized[++i], 10) || 1;
    else if (a === '--reveal' || a === '-r') opts.reveal = true;
    else if (a === '--help' || a === '-h') opts.help = true;
    else if (!a.startsWith('-') && !opts.topic) opts.topic = a;
  }

  return opts;
}

function pickRandom(arr, n) {
  const pool = arr.slice();
  const picked = [];
  const count = Math.min(n, pool.length);
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    picked.push(pool.splice(idx, 1)[0]);
  }
  return picked;
}

// Only the problem itself - no topic, no pattern folder, no file path.
// Nothing here should tell you which pattern to use; that's what you're
// testing yourself on.
function printQuestion(entry, n) {
  console.log('');
  console.log(bold(cyan(`Question ${n}`)));
  console.log(bold(entry.number ? `${entry.number}. ${entry.title}` : entry.title));
  if (entry.url) console.log(green(entry.url));
  else console.log(dim('(no LeetCode/HackerRank link found in the file - open it to read the prompt)'));
  if (entry.description) console.log(entry.description);
}

// Everything that would give away the pattern: topic/folder, PATTERN.md,
// the solution's own file path, and its noted complexity. Shown only
// once you've asked to see it.
function reveal(entry) {
  console.log(dim(`Topic: ${entry.topic || '(uncategorized)'}`));
  if (entry.hasPattern) console.log(dim(`Pattern notes: ${entry.patternPath}`));
  console.log(yellow(`Solution: ${path.relative(process.cwd(), entry.absPath)}`));
  if (entry.complexity) console.log(dim(`Noted complexity: ${entry.complexity}`));
}

function printTopicsList(index) {
  console.log(bold(`Topics under ${path.relative(process.cwd(), ROOT)}:`));
  for (const [topic, count] of listTopics(index)) {
    console.log(`  ${topic.padEnd(24)} ${count}`);
  }
  console.log(dim(`\n${index.length} total problems.`));
}

function askEnter(rl, prompt) {
  return new Promise((resolve) => rl.question(prompt, resolve));
}

function parseCommand(raw) {
  const s = raw.trim();
  if (s === '') return { type: 'enter' };
  const low = s.toLowerCase();
  if (low === 'q' || low === 'quit' || low === 'exit') return { type: 'quit' };
  if (low === 's' || low === 'skip') return { type: 'skip' };
  if (low === 'l' || low === 'list') return { type: 'list' };
  const topicMatch = s.match(/^t(?:opic)?(?:\s+(.+))?$/i);
  if (topicMatch) return { type: 'topic', value: (topicMatch[1] || '').trim() };
  return { type: 'unknown', raw: s };
}

const PRE_REVEAL_PROMPT = dim('\n[Enter] reveal   s skip   t <topic> switch   l list   q quit\n> ');
const POST_REVEAL_PROMPT = dim('\n[Enter] next question   t <topic> switch   l list   q quit\n> ');

async function runInteractiveSession(index, initialTopic) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  let topic = initialTopic || null;
  let asked = 0;

  const finish = () => {
    rl.close();
    console.log(dim(`\n${asked} question(s) this session. Good luck out there.`));
  };

  console.log('');
  console.log(bold('dsaquiz - interactive practice session'));
  console.log(dim(topic ? `Topic filter: ${topic}` : 'Topic filter: (any)'));
  console.log(dim('Nothing below hints at the pattern until you reveal it.'));

  for (;;) {
    const filtered = index.filter((e) => matchesTopic(e.topic, topic));
    if (!filtered.length) {
      console.log(yellow(`\nNo problems match "${topic}". Clearing the filter.`));
      topic = null;
      continue;
    }

    const [entry] = pickRandom(filtered, 1);
    asked += 1;
    printQuestion(entry, asked);

    // action is one of 'revealed' | 'skipped' | 'switched' - explicit, so it
    // can't be confused with "no action yet" the way a shared value could
    // when clearing the topic filter also means setting it back to null.
    let action = null;
    let pendingTopic = topic;

    for (;;) {
      const cmd = parseCommand(await askEnter(rl, PRE_REVEAL_PROMPT));
      if (cmd.type === 'quit') return finish();
      if (cmd.type === 'enter') {
        console.log('');
        reveal(entry);
        action = 'revealed';
        break;
      }
      if (cmd.type === 'skip') {
        action = 'skipped';
        break;
      }
      if (cmd.type === 'list') {
        console.log('');
        printTopicsList(index);
        continue;
      }
      if (cmd.type === 'topic') {
        pendingTopic = cmd.value || null;
        action = 'switched';
        break;
      }
      console.log(dim('Not sure what that means - try Enter, s, t <topic>, l, or q.'));
    }

    if (action === 'switched') {
      topic = pendingTopic;
      continue; // skip the post-reveal prompt entirely, straight to next question
    }
    if (action === 'skipped') {
      continue;
    }

    for (;;) {
      const cmd = parseCommand(await askEnter(rl, POST_REVEAL_PROMPT));
      if (cmd.type === 'quit') return finish();
      if (cmd.type === 'list') {
        console.log('');
        printTopicsList(index);
        continue;
      }
      if (cmd.type === 'topic') topic = cmd.value || null;
      break; // enter, topic-switch, or anything else -> move to the next question
    }
  }
}

function runNonInteractive(picks) {
  picks.forEach((entry, i) => {
    printQuestion(entry, i + 1);
    console.log('');
    reveal(entry);
    console.log('');
  });
}

function main() {
  const opts = parseArgs(process.argv.slice(2));

  if (opts.help) {
    printHelp();
    return;
  }

  const index = buildIndex();

  if (opts.list) {
    printTopicsList(index);
    return;
  }

  const useInteractiveSession = Boolean(process.stdin.isTTY) && !opts.reveal;

  if (useInteractiveSession) {
    runInteractiveSession(index, opts.topic);
    return;
  }

  const filtered = index.filter((e) => matchesTopic(e.topic, opts.topic));

  if (filtered.length === 0) {
    console.error(`No problems found for topic "${opts.topic}".`);
    console.error('Run with --list to see available topics.');
    process.exitCode = 1;
    return;
  }

  runNonInteractive(pickRandom(filtered, opts.count));
}

main();
