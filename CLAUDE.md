# interviewprep

Personal interview-prep notes. Notes for **me to revise from**, not documentation for anyone else — optimise for recall speed, not completeness.

## Layout

- `design/<Topic>/` — one folder per system-design topic (`Uber/`, `Whatsapp/`, `Splitwise/`), each with `1 - HLD Notes.txt`, `2 - LLD Notes.txt`, `3 - Architecture Diagram.svg`.
- `design/Reference/Notes.txt` — cross-topic notes (patterns, API perf, DB scaling, topic/question list). Append under the matching `== Section ==` header; don't create new files here.
- `design/Coding Problems/` — LeetCode-style implementations, not system design.
- `concepts/` — one short `.md` per standalone concept (replication, caching, deployment, locks...). Flat, no subfolders.
- `dsa/`, `language/`, `interviews/`, `cli/` — unrelated to the above; leave alone unless asked.

## Adding a system-design topic

Use the **`system-design-notes` skill** (`Workspace/.claude/skills/system-design-notes/SKILL.md`) — it has the full structure, house style, and SVG rules. Don't hand-roll the layout.

## Writing style (applies to `design/` and `concepts/`)

- **Pseudocode over prose.** If it has an algorithm or formula, show the code block instead of explaining it in paragraphs.
- **One example, not five.** Pick the datastore actually used; don't do the same query across Redis + Mongo + ES + Postgres for completeness.
- Terse bullets, `->` for "leads to". Numbered steps only when order matters.
- Every design decision ends in "-- because X". The reason is the part worth revising.
- **Follow the real company's production architecture**, not just the generic textbook design — and mark confidence + date, since engineering blogs go stale. Never invent plausible-sounding infra.

## Gotcha

`--` is illegal inside an XML comment. House style uses `--` as an em-dash everywhere, so it's easy to type into a `<!-- ... -->` by reflex — it makes the whole SVG fail to parse and render blank. Validate before finishing:

```bash
powershell -c "[xml](Get-Content -Raw 'design/Uber/3 - Architecture Diagram.svg') | Out-Null; echo OK"
```
