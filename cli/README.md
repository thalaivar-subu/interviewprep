# dsaquiz

A random question picker for `dsa/javascript`, for self-testing before interviews.

There is no question database to maintain. Every run, it walks
`dsa/javascript` fresh, reads each solution file's leading comment for the
LeetCode/HackerRank problem number, title, and URL (the convention already
used throughout the repo), and picks randomly from whatever it finds. Drop
a new solved problem into any existing (or new) topic folder and it's
immediately eligible next run — nothing to register.

**The point is to find the answer yourself.** The question is shown with
just the title, link, and a short description — nothing that hints at the
pattern. The topic/folder, the linked `PATTERN.md`, the solution's file
path, and its noted complexity are only shown after you explicitly ask
(press Enter, or `--reveal`). With `--count`, questions are asked one at a
time — you reveal each before moving to the next, rather than seeing every
title up front.

## Usage

Zero-setup, run directly with Node. The path to `dsaquiz.js` is relative
to your current directory, so it differs depending on where you are:

**From the `interviewprep` repo root:**
```
node cli/bin/dsaquiz.js
node cli/bin/dsaquiz.js dp
node cli/bin/dsaquiz.js --topic sliding-window --count 3
node cli/bin/dsaquiz.js --list
```

**From inside the `cli/` folder:**
```
node bin/dsaquiz.js
node bin/dsaquiz.js dp
```

(`node cli/bin/dsaquiz.js` while already inside `cli/` resolves to
`cli/cli/bin/dsaquiz.js` and fails with `MODULE_NOT_FOUND` — the fix
below avoids this entirely by giving you a plain `dsaquiz` command that
works from any directory.)

Or install it as a real `dsaquiz` command on your PATH (one-time, run
from inside `cli/`):

```
cd cli
npm link
```

Then from any terminal:

```
dsaquiz
dsaquiz backtracking
dsaquiz --list
```

Remove it later with `npm unlink -g dsaquiz` from the `cli/` folder.

## Flags

| Flag | Effect |
|---|---|
| `[topic]` (positional) | Same as `--topic` |
| `--topic <name>`, `-t` | Case-insensitive substring match against the folder path. `dp`, `backtracking`, `bfs`, `sliding-window` all work. Matches nested folders too — `recursion` matches everything under `recursion/**`. |
| `--count <n>`, `-n` | Ask `n` distinct random questions, one at a time. |
| `--list`, `-l` | List every topic with how many problems it currently has. |
| `--reveal`, `-r` | Skip the "press Enter" wait and reveal immediately (useful for scripting; not for actually testing yourself). |
| `--help`, `-h` | Usage message. |

If stdin isn't a TTY (piped/scripted), everything is printed immediately
without waiting for Enter — the interactive pause only kicks in for a real
terminal session.

## How a question is built

For each `.js` file under `dsa/javascript`:

1. First line inside the header comment matching `NNN. Problem Title` →
   number + title (the convention already used in the repo).
2. Any `leetcode.com` / `hackerrank.com` URL in the first ~80 lines → the link.
3. If there's a URL but no number/title, the title is derived from the URL slug.
4. If there's neither, the title is derived from the filename, and the
   question is shown with a note that no link was found — you just open
   the file to read the prompt. This is intentional: data-structure
   scaffolds like `linked-list/LL.js` or `heap/minHeap.js` are still valid
   self-test material ("re-implement this from scratch"), they just don't
   have a LeetCode number.
5. The topic's `PATTERN.md`, if the folder has one, is linked on reveal
   only — check it if you got the pattern wrong or want the template.
6. If the solution file has a noted `O(...) time, O(...) space` comment
   (most do, added across the repo), it's shown after you reveal — a
   quick check against your own complexity once you've solved it.

## Extending

Nothing to touch here when the DSA repo grows. Just keep following the
existing convention in `dsa/javascript/<topic>/<problem>.js`:

```
/*
NNN. Problem Title
...
https://leetcode.com/problems/problem-title/
*/
```

New topic folders, new subfolders, new files — all picked up automatically
on the next run.
