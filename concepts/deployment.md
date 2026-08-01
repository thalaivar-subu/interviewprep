# Deployment Strategies

Tradeoff axis for all of them: downtime vs infra cost vs blast radius vs rollback speed.

## Recreate
- Kill all old instances, then start new ones. Downtime = full restart window.
- Only acceptable for internal tools / when versions can't coexist (e.g. breaking DB lock).

## Rolling
- Replace instances in batches (e.g. 25% at a time), old and new run side by side during the roll.
- No downtime, no extra infra (reuses the same pool). Default in Kubernetes (`maxSurge` / `maxUnavailable`).
- Catch: rollback is slow (must roll *back* batch by batch), and both versions serve traffic -> needs backward-compatible API + DB schema.

## Blue-Green
- Two full identical environments. Blue = live, Green = new version. Test Green privately, then flip the load balancer / DNS to Green all at once.
- Instant rollback (flip back to Blue) — biggest advantage.
- Catch: 2x infra cost during the switch, and stateful things (DB, sessions, in-flight jobs) don't flip cleanly — DB is usually shared, so schema still has to be compatible with both.

## Canary
- Route a small % of real traffic to the new version (1% -> 5% -> 25% -> 100%), watching metrics at each step; auto-rollback if error rate/latency regresses.
- Smallest blast radius — only the canary % sees a bad deploy.
- Needs good observability + a traffic splitter (service mesh, ingress weights) to be worth it. Slowest rollout.
- Route by % of requests, or sticky by user/region so a user doesn't flip between versions mid-session.

## A/B Testing
- Looks like canary mechanically, but the *intent* differs: canary asks "is this build broken?", A/B asks "which variant converts better?" A/B splits by user attribute and runs for days/weeks.

## Shadow / Dark Launch
- Mirror real production traffic to the new version, but discard its responses — users only ever see the old version.
- Validates performance/correctness under real load with zero user risk. Catch: careful with side effects — mirrored writes/payments/emails must be stubbed.

## Feature Flags
- Decouple *deploy* from *release*: ship the code dark, enable per user/segment at runtime, kill instantly without redeploying.
- Complements the above rather than replacing them. Catch: flag debt — stale flags must be cleaned up or the code becomes untestable combinatorics.

## Picking one
- Internal tool, downtime fine -> Recreate
- Default stateless service -> Rolling
- Need instant rollback, can afford 2x infra -> Blue-Green
- High-risk change, good metrics in place -> Canary
- Risky perf/rewrite, want zero user exposure -> Shadow first, then Canary

## Always required regardless of strategy
- Backward-compatible DB migrations (expand/contract: add column -> dual-write -> backfill -> switch reads -> drop old). Old and new code run simultaneously in every strategy except Recreate.
- Health checks / readiness probes, else the LB sends traffic to a not-yet-ready instance.
- Defined rollback trigger + who calls it, decided *before* the deploy (see deploy-checklist thinking).
