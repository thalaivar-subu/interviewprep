# Deployment Strategies

Tradeoff axis for all of them: downtime vs infra cost vs blast radius vs rollback speed.

## Recreate
- Kill all old instances, then start new ones. Downtime = full restart window.
- Only acceptable for internal tools / when versions can't coexist (e.g. breaking DB lock).
- Example: Jenkins / GitLab runner upgrades, internal admin dashboards, nightly batch jobs. Also forced when a migration takes an exclusive table lock -> you schedule a maintenance window.

## Rolling
- Replace instances in batches (e.g. 25% at a time), old and new run side by side during the roll.
- No downtime, no extra infra (reuses the same pool). Default in Kubernetes (`maxSurge` / `maxUnavailable`).
- Catch: rollback is slow (must roll *back* batch by batch), and both versions serve traffic -> needs backward-compatible API + DB schema.
- Example: the default k8s `Deployment`, AWS ECS rolling update — i.e. most stateless microservice fleets, by default, without anyone deciding.

## Blue-Green
- Two full identical environments. Blue = live, Green = new version. Test Green privately, then flip the load balancer / DNS to Green all at once.
- Instant rollback (flip back to Blue) — biggest advantage.
- Catch: 2x infra cost during the switch, and stateful things (DB, sessions, in-flight jobs) don't flip cleanly — DB is usually shared, so schema still has to be compatible with both.
- Example: AWS Elastic Beanstalk "Swap Environment URLs"; flipping an ALB target group or Route53 record. Typical for checkout/payment services where a bad deploy must be undone in seconds, not minutes.

## Canary
- Route a small % of real traffic to the new version (1% -> 5% -> 25% -> 100%), watching metrics at each step; auto-rollback if error rate/latency regresses.
- Smallest blast radius — only the canary % sees a bad deploy.
- Needs good observability + a traffic splitter (service mesh, ingress weights) to be worth it. Slowest rollout.
- Route by % of requests, or sticky by user/region so a user doesn't flip between versions mid-session.
- Example (server): Istio / Linkerd traffic weights, Argo Rollouts, AWS Lambda weighted aliases.
- Example (mobile — the most visible canary in the world): **Google Play staged rollout** and **Apple App Store phased release** are exactly this pattern at store level. Apple's runs automatically over 7 days: 1% -> 2% -> 5% -> 10% -> 20% -> 50% -> 100%. Play lets you pick the percentages yourself and halt at any step.

## A/B Testing
- Looks like canary mechanically, but the *intent* differs: canary asks "is this build broken?", A/B asks "which variant converts better?" A/B splits by user attribute and runs for days/weeks.
- Example: Netflix artwork personalisation (which thumbnail gets the click), Booking.com running hundreds of concurrent experiments. Tools: Optimizely, Statsig, LaunchDarkly.

## Shadow / Dark Launch
- Mirror real production traffic to the new version, but discard its responses — users only ever see the old version.
- Validates performance/correctness under real load with zero user risk. Catch: careful with side effects — mirrored writes/payments/emails must be stubbed.
- Example: GitHub's `Scientist` library (runs old + new code paths, returns the old result, logs mismatches); Envoy/Istio request mirroring. Classic use is replacing a search, pricing or payments engine where "does it behave identically on real traffic?" is the only question that matters.

## Feature Flags
- Decouple *deploy* from *release*: ship the code dark, enable per user/segment at runtime, kill instantly without redeploying.
- Complements the above rather than replacing them. Catch: flag debt — stale flags must be cleaned up or the code becomes untestable combinatorics.
- Example: LaunchDarkly / Unleash / Split, Facebook's Gatekeeper. Also the standard incident lever — turn off an expensive feature (recommendations, search suggestions) to shed load without deploying anything.

## Mobile is different
Worth its own section, because the assumptions behind every strategy above break:

- **You cannot roll back.** Users who already installed the bad build keep it. Halting a staged rollout only stops *new* users getting it — everyone already on it stays broken until you ship a fix forward.
- **Fix-forward has store latency.** A new build goes back through review (hours to days; expedited review exists for genuine emergencies). So the loop is far slower than a server rollback.
- **Users may never update.** You support old client versions for years -> the API must stay backward compatible far longer than server-to-server.
- **Therefore server-side feature flags are the only real kill switch.** Ship the feature dark behind remote config (Firebase Remote Config, LaunchDarkly) so a broken feature can be disabled without a store release. On mobile, flags aren't a nice-to-have — they're the rollback mechanism.
- Force-upgrade prompt (block the app until updated) is the nuclear option for genuinely broken old versions.

## Picking one
- Internal tool, downtime fine -> Recreate
- Default stateless service -> Rolling
- Need instant rollback, can afford 2x infra -> Blue-Green
- High-risk change, good metrics in place -> Canary
- Risky perf/rewrite, want zero user exposure -> Shadow first, then Canary
- Mobile app -> staged/phased store rollout + feature flags (flags do the rollback the store can't)

## Always required regardless of strategy
- Backward-compatible DB migrations (expand/contract: add column -> dual-write -> backfill -> switch reads -> drop old). Old and new code run simultaneously in every strategy except Recreate.
- Health checks / readiness probes, else the LB sends traffic to a not-yet-ready instance.
- Defined rollback trigger + who calls it, decided *before* the deploy (see deploy-checklist thinking).
