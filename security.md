# `security.md` --- Security & Stability Standards for Web Agents

> **Purpose:** This document is the engineering contract for any AI
> agent, developer, or automation that designs, builds, modifies, tests,
> deploys, or operates this web application.
>
> **Default rule:** Security, correctness, and operational stability are
> requirements---not optional enhancements. Prefer secure defaults,
> least privilege, explicit limits, observable behavior, and reversible
> changes.
>
> **Status:** Baseline template. Adapt values, ownership, retention
> periods, and compliance requirements to the actual system before
> production use.

## 1. Mandatory agent behavior

Before making changes:

1.  Inspect the existing architecture, framework, dependencies,
    deployment topology, authentication model, data classification, and
    operational constraints.
2.  Identify trust boundaries: browser, CDN/WAF, reverse proxy, API
    gateway, application, workers, queues, caches, and databases.
3.  Read existing configuration and tests. Do not assume that a control
    exists because a package or infrastructure component is present.
4.  Record security-sensitive assumptions and unresolved decisions. Ask
    for clarification when a requirement is ambiguous or a change could
    weaken an existing control.
5.  Make the smallest safe change. Preserve backward compatibility
    unless a breaking change is explicitly approved.
6.  Never disable authentication, authorization, validation, TLS, rate
    limits, tests, or monitoring merely to make a build pass.
7.  Never expose secrets, personal data, tokens, or production records
    in source code, logs, test fixtures, screenshots, or generated
    documentation.
8.  Add or update tests for security boundaries, failure paths,
    concurrency, and resource limits---not only the happy path.
9.  Provide a concise change summary, risks, migration/rollback
    instructions, and evidence of tests run.
10. If a critical vulnerability is discovered, stop the risky release
    path, document impact, and escalate to the responsible owner.

### Non-negotiable release blockers

Do not release when any of the following is true:

-   Known critical/high exploitable vulnerability remains without an
    approved, time-bound exception.
-   Authentication or authorization can be bypassed.
-   User-controlled input reaches SQL, shell, template, filesystem, or
    deserialization sinks without safe handling.
-   Secrets or private keys are committed, embedded in images, or
    exposed in client bundles.
-   TLS certificate validation is disabled in production.
-   Unbounded request bodies, queues, concurrency, retries, or database
    connections can exhaust resources.
-   Data integrity can be lost through non-idempotent retries or unsafe
    distributed workflows.
-   Health checks report healthy while essential dependencies are
    unusable.
-   Deployment has no tested rollback or recovery path for a high-risk
    change.

## 2. Security architecture and trust boundaries

Use defense in depth. A typical request path is:

`Client → CDN/WAF/DDoS protection → Load balancer → Reverse proxy/API gateway → Application → Cache/Queue/Database/External services`

Apply controls at more than one layer where practical. Edge controls do
not replace application validation or authorization.

-   **Reverse proxies:** Terminate TLS where appropriate, enforce
    request/header/body limits, set safe forwarding headers, and prevent
    direct public access to internal application ports.
-   **API gateways:** Centralize routing, authentication integration,
    quotas, rate limits, request size limits, schema validation where
    supported, and API version policy. Authorization must still be
    enforced by the service owning the resource.
-   **Load balancing:** Use health-aware balancing, connection draining,
    sensible idle/request timeouts, and zone/instance diversity where
    required. Do not route traffic to unready instances.
-   **Network segmentation:** Keep databases, caches, queues,
    orchestration control planes, and internal admin endpoints private.
    Apply least-privilege network policies.
-   **Service identity:** Authenticate service-to-service calls. Do not
    trust traffic solely because it originates inside a private network.
-   **CORE policy:** Treat "CORE policy" as an organization-defined
    policy name until its exact meaning and required controls are
    supplied. Do not invent an expansion. If the intended requirement is
    **CORS policy**, configure an explicit allowlist of trusted origins,
    methods, and headers; never use wildcard origins with credentialed
    requests. CORS is a browser access control, not authentication or
    authorization.

## 3. Identity, sessions, and tokens

-   Use a maintained identity provider or well-reviewed authentication
    library where possible.
-   Enforce authorization server-side on every protected operation and
    every object access. Apply deny-by-default and least privilege.
-   Prevent insecure direct object references by checking
    ownership/tenant scope in the data-access operation.
-   Store passwords only with a modern password-hashing algorithm and
    appropriate work factor; never encrypt passwords reversibly.
-   Use secure, `HttpOnly`, and appropriate `SameSite` cookie settings
    for browser sessions. Set `Secure` on HTTPS deployments. Protect
    state-changing cookie-authenticated requests against CSRF.
-   Rotate session identifiers after login and privilege changes. Expire
    and revoke sessions on logout, password reset, and account
    compromise.
-   **Token JET:** The term is ambiguous. This template assumes the
    intended token topic may be **JWT (JSON Web Token)**; confirm this
    with the project owner. If JWT is used:
    -   Verify signature, allowed algorithm, issuer, audience, expiry,
        not-before, and key ID against an explicit policy.
    -   Pin accepted algorithms; reject `none` and unexpected
        algorithms.
    -   Use short-lived access tokens and a controlled refresh-token
        rotation/revocation strategy.
    -   Do not put secrets or sensitive personal data in JWT payloads; a
        signed JWT is not encrypted by default.
    -   Keep signing keys in a secret manager/KMS, rotate them, and
        never log complete tokens.
    -   Validate token scope/roles and resource authorization
        independently; token claims are not a substitute for
        object-level checks.
-   Avoid storing long-lived bearer tokens in browser-accessible
    persistent storage when a secure, HttpOnly cookie-based design is
    suitable.
-   Apply MFA and stronger controls to administrative and privileged
    accounts.

## 4. Input validation, JSON, payloads, and injection

-   Validate all input at the trust boundary: path parameters, query
    strings, headers, cookies, forms, JSON, uploaded files, and messages
    from queues.
-   Use allowlists, explicit types, length/range limits, and schema
    validation. Reject malformed, unexpected, duplicate, or unsupported
    fields as appropriate.
-   Treat client-side validation as usability only. Repeat all security
    validation on the server.
-   Set maximum request and response sizes, nesting depth, array length,
    string length, and upload size. Reject oversized payloads early with
    a clear 4xx response.
-   Parse JSON with a maintained parser. Handle invalid encodings,
    deeply nested objects, duplicate keys, and unexpected content types
    safely.
-   Do not deserialize untrusted data into executable or polymorphic
    object types without a strict allowlist.
-   Encode output for its destination context (HTML, JavaScript, URL,
    CSS, SQL parameters). Avoid unsafe HTML rendering; sanitize rich
    text with a maintained sanitizer and strict policy.
-   **SQL injection:** Always use parameterized queries/prepared
    statements or safe ORM/query-builder bindings. Never concatenate
    user input into SQL syntax. Dynamic identifiers (table/column/order
    direction) must come from a fixed allowlist. Use least-privilege
    database accounts.
-   A **query builder** is not automatically safe: verify that values
    are bound parameters and that raw SQL fragments are static or
    strictly allowlisted.
-   Protect against path traversal, command injection, template
    injection, SSRF, open redirects, mass assignment, and unsafe file
    uploads.
-   Restrict outbound network destinations for server-side URL fetching.
    Block private, loopback, link-local, and cloud metadata ranges
    unless explicitly required and safely controlled.
-   Use content-type sniffing protection and safe download headers where
    relevant.

## 5. Rate limiting, throttling, and DDoS mitigation

Apply layered limits at the CDN/WAF, gateway/proxy, and application
levels.

-   Define limits by route, identity, API key, tenant, IP/network, and
    expensive operation as appropriate. Avoid relying only on IP limits
    because NAT and distributed attackers can bypass or unfairly affect
    them.
-   Use token-bucket or leaky-bucket style controls where appropriate.
    Return `429 Too Many Requests` and a meaningful `Retry-After` when
    possible.
-   Apply stricter limits to login, password reset, OTP, search,
    exports, uploads, expensive reports, and token issuance.
-   Add concurrency limits and per-request cost budgets, not just
    requests-per-second limits.
-   Set maximum connections, header sizes, body sizes, upload rates, and
    request durations at the edge.
-   Use CDN/WAF managed DDoS protection, bot controls, caching of safe
    public content, origin shielding, and autoscaling with hard
    spending/resource limits.
-   Keep origin servers inaccessible directly where feasible; accept
    traffic only from approved edge/proxy networks.
-   Ensure proxy IP headers are trusted only from known proxies. Do not
    trust arbitrary client-supplied `X-Forwarded-For`.
-   Define graceful degradation: shed low-priority work, protect
    critical endpoints, and return controlled errors rather than
    allowing total resource collapse.
-   Load-test defensive capacity and document escalation/incident
    procedures. Do not assume autoscaling alone prevents DDoS.

## 6. Timeouts, retries, and exponential backoff

Every network, database, cache, queue, and external-service operation
must have explicit timeouts.

-   Set connect, TLS handshake, request, response/read, write, idle, and
    overall deadline limits appropriate to the operation.
-   Propagate an overall deadline across service calls; downstream
    timeouts must fit within the caller's remaining budget.
-   Avoid infinite waits and unbounded goroutines/threads/tasks.
-   Retry only transient failures and only when the operation is safe to
    retry.
-   Use exponential backoff with randomized jitter, a maximum delay, and
    a maximum attempt/deadline budget.
-   Respect `Retry-After` when applicable. Do not retry permanent 4xx
    errors or validation failures.
-   Avoid retry amplification: coordinate retry policies across layers
    and prevent every layer from independently retrying the same
    request.
-   Use circuit breakers, bulkheads, and concurrency limits for unstable
    dependencies.
-   Fail fast when a dependency is clearly unavailable; provide a
    controlled fallback only when it preserves correctness and security.

## 7. Idempotency and distributed transactions

-   Design create/payment/order/provisioning and other side-effecting
    operations to be idempotent where retries may occur.
-   Accept an idempotency key for suitable operations. Scope it to the
    authenticated principal/tenant and operation; store request
    fingerprint, processing state, result, and expiry atomically.
-   Reusing a key with a different request body must be rejected.
    Concurrent requests with the same key must not create duplicate
    effects.
-   Enforce uniqueness and integrity constraints in the database;
    application-level checks alone are insufficient under concurrency.
-   Do not assume a database transaction can atomically cover a remote
    API, message broker, and multiple databases.
-   For distributed workflows, prefer a saga with explicit steps,
    durable state, compensating actions, bounded retries, and
    reconciliation.
-   Use the transactional outbox/inbox pattern where appropriate to
    avoid losing events between database commits and message
    publication/consumption.
-   Make consumers idempotent. Expect at-least-once delivery and
    possible duplicate/out-of-order messages unless the broker contract
    guarantees otherwise.
-   Define consistency, timeout, compensation, and manual-recovery
    behavior for every multi-system workflow.

## 8. Database performance, integrity, and concurrency

### Queries and N+1

-   Detect and prevent N+1 query problems. Use joins, eager loading,
    batching, or DataLoader-style request-scoped batching where
    appropriate.
-   Avoid blindly eager-loading large relationships; paginate and select
    only required columns.
-   Add query-count/performance tests for important endpoints and
    inspect query plans for slow queries.
-   Use a query builder/ORM safely, but understand the SQL it generates.

### Indexes and fragmentation

-   Add indexes based on measured query patterns, selectivity, joins,
    sorting, and write costs---not by guessing.
-   Use query plans (`EXPLAIN`/equivalent) to validate index usage.
    Consider composite index column order and covering indexes where
    supported.
-   Monitor missing/unused indexes, slow queries, table growth, and
    index bloat/fragmentation using database-specific tools.
-   Index creation and maintenance must account for production locking,
    write amplification, storage, and deployment strategy.
-   Do not rebuild or reorganize indexes blindly in production. Use
    database-specific online/concurrent maintenance options where
    supported and plan rollback.

### Deadlocks, race conditions, and connection pools

-   Keep transactions short and access shared resources in a consistent
    order.
-   Add appropriate indexes to reduce lock scope and duration.
-   Handle deadlock/serialization failures with bounded retries of the
    entire transaction, only when safe and idempotent.
-   Never hold database locks while waiting on remote network calls or
    user input.
-   Use atomic SQL operations, unique constraints, optimistic
    locking/version columns, or appropriate row locks to protect shared
    state.
-   Identify and fix race conditions in read-modify-write flows. Do not
    rely on in-process mutexes to protect data shared across multiple
    instances.
-   Size database connection pools against database capacity and total
    application replicas. Account for workers, migrations, admin tools,
    and failover.
-   Set pool acquisition timeouts, maximum lifetime, idle timeout, and
    maximum idle/open connections appropriately.
-   Always close/release connections, rows, cursors, statements, and
    transactions on every success and error path.
-   Monitor active/idle connections, wait time, pool saturation, leaked
    connections, long transactions, lock waits, and deadlock rates.
-   Prevent database connection pool exhaustion with admission control,
    bounded concurrency, query timeouts, and load shedding.
-   Investigate database deadlock storms as an incident: identify
    conflicting query patterns, transaction order, lock duration, and
    retry amplification before increasing retries.

## 9. Cache design and consistency

-   Cache only data whose sensitivity, authorization, and staleness
    characteristics are understood.
-   Include tenant/user/role/locale and other authorization-relevant
    dimensions in cache keys where necessary. Never let one user's
    private response leak to another user.
-   Set TTLs, size limits, eviction policies, and negative-cache
    behavior intentionally.
-   Use cache stampede protection (single-flight/request coalescing,
    jittered TTLs, or controlled refresh) for expensive hot keys.
-   Avoid caching secrets, authentication responses, or private data in
    shared/public caches unless explicitly designed and proven safe.
-   Invalidate or version cache entries when underlying data changes.
    Document eventual consistency and acceptable staleness.
-   Treat cache failure as a dependency failure scenario; decide whether
    to fail open or closed based on data sensitivity and correctness.
-   Do not allow untrusted users to control cache keys in ways that
    cause unbounded cardinality or cache poisoning.

## 10. Message queues and background work

-   Bound queue depth, message size, concurrency, processing time, and
    retry count.
-   Define acknowledgement timing, visibility/lease timeout, dead-letter
    queue (DLQ), retention, and replay procedures.
-   Validate message schemas and authenticate/authorize producers and
    consumers.
-   Assume duplicate delivery. Make handlers idempotent and safe under
    concurrent processing.
-   Use exponential backoff with jitter for transient errors; route
    poison messages to a DLQ after bounded attempts.
-   Avoid hot loops and immediate requeue storms. Apply backpressure
    when consumers or dependencies are overloaded.
-   Monitor queue age, depth, throughput, consumer lag, retry count, DLQ
    growth, and processing failures.
-   Do not put secrets or unnecessary personal data in messages. Encrypt
    transport and storage where supported.
-   Ensure queue publication and database state changes are coordinated
    using an outbox or equivalent reliable pattern when loss would be
    harmful.

## 11. WebSocket and gRPC

### WebSocket

-   Require authenticated connection establishment and authorize every
    subscription, room, channel, and message action.
-   Validate the `Origin` header against an explicit allowlist; do not
    treat Origin as authentication.
-   Enforce message size, schema, rate, connection count, idle timeout,
    and per-user/tenant limits.
-   Revalidate session/token expiry and support revocation or forced
    disconnect.
-   Avoid broadcasting private events to broad channels. Prevent
    cross-tenant room access.
-   Use heartbeat/ping-pong and stale-connection cleanup. Bound outbound
    buffers and disconnect slow consumers safely.
-   Use `wss://` in production and avoid logging full message bodies or
    credentials.

### gRPC

-   Use TLS or mutually authenticated TLS for service-to-service traffic
    as required.
-   Authenticate callers and authorize methods/resources. Do not rely on
    network location alone.
-   Set deadlines on every RPC and propagate cancellation.
-   Enforce maximum inbound/outbound message sizes, metadata limits,
    concurrency limits, and per-method quotas.
-   Validate protobuf messages and avoid assuming that a field's
    presence implies authorization.
-   Configure retries only for suitable idempotent methods and
    coordinate them with backoff/jitter and service budgets.
-   Monitor status codes, latency, deadline exceeded, cancellations,
    connection churn, and message sizes.

## 12. TLS, certificates, and transport security

-   Use HTTPS everywhere in production. Redirect HTTP to HTTPS and
    enable HSTS after confirming all required subdomains support HTTPS.
-   Use modern TLS configurations supported by the deployment
    environment; disable obsolete protocol versions and weak cipher
    suites.
-   Validate certificates and hostnames. Never disable certificate
    verification to work around an environment issue.
-   Automate certificate issuance/renewal and alert before expiry.
-   Protect private keys using a secret manager or KMS with restricted
    access and rotation.
-   Encrypt sensitive service-to-service traffic and database/broker
    connections where supported.
-   Set secure cookie flags and avoid mixed content.
-   Document TLS termination points and ensure internal hops are
    protected according to the threat model.

## 13. CI/CD and software supply chain

-   Require code review and protected branches for production changes.
-   Run formatting, linting, unit/integration tests, type checks, static
    analysis, secret scanning, dependency scanning, and applicable
    DAST/security tests in CI.
-   Pin dependencies and base images; generate and review an SBOM where
    practical.
-   Build immutable artifacts once and promote the same artifact through
    environments.
-   Sign artifacts/images where supported and verify provenance at
    deployment.
-   Use short-lived CI credentials with least privilege; do not store
    production secrets in repository files or build logs.
-   Separate build, deploy, and runtime permissions. Production
    deployment should require explicit authorization and auditable
    identity.
-   Use staged/canary/blue-green rollout for high-risk changes, with
    health-based promotion and automatic or documented rollback.
-   Run database migrations as controlled jobs. Prefer
    backward-compatible expand/migrate/contract changes; do not couple
    destructive schema changes to an unverified rollout.
-   Test rollback and recovery, not only forward deployment.
-   Never expose CI runners, deployment dashboards, or orchestration
    control planes publicly without strong access controls.

## 14. Docker and Kubernetes

### Docker / containers

-   Use minimal, trusted, pinned base images and rebuild regularly for
    security updates.
-   Run as a non-root user; drop unnecessary Linux capabilities; use
    read-only filesystems where feasible.
-   Do not bake secrets into Dockerfiles, image layers, build arguments,
    or images. Inject secrets at runtime from an approved secret
    manager.
-   Use multi-stage builds and exclude development tools, source
    secrets, and unnecessary files from runtime images.
-   Set CPU, memory, process, and filesystem limits. Handle SIGTERM
    gracefully and stop accepting traffic before shutdown.
-   Scan images and dependencies; sign images where supported.

### Kubernetes

-   Use namespaces and RBAC with least privilege. Avoid cluster-admin
    for workloads.
-   Apply Pod Security standards, network policies, service accounts,
    and restricted admission policies.
-   Do not mount the container runtime socket or privileged host paths
    into ordinary workloads.
-   Set requests/limits, replicas, disruption budgets, topology
    spread/anti-affinity where appropriate, and autoscaling bounds.
-   Use startup, readiness, and liveness probes correctly. Readiness
    determines whether a pod receives traffic; liveness should detect a
    process that cannot recover. Do not make liveness depend on a flaky
    remote dependency.
-   Keep secrets out of ConfigMaps and source control; restrict secret
    access and enable encryption at rest for cluster secrets.
-   Use rolling updates with safe surge/unavailable settings and
    graceful connection draining.
-   Restrict and audit access to the Kubernetes API, etcd, dashboards,
    and nodes.

## 15. Stability, resource management, and failure modes

-   **Memory leaks:** Monitor heap/RSS, allocation rate, garbage
    collection, object retention, and process growth. Close resources,
    unregister listeners, cancel tasks, and remove references when no
    longer needed. Add soak tests for long-running processes.
-   **OOM:** Set realistic memory limits and headroom. Profile memory
    under peak and sustained load. Bound caches, buffers, payloads,
    concurrency, and queues. Handle OOM restarts with alerts and
    root-cause analysis; do not simply raise limits without evidence.
-   **Disk I/O bottlenecks:** Monitor IOPS, throughput, queue depth,
    utilization, filesystem capacity, and latency. Avoid synchronous
    heavy work on request paths. Use batching and appropriate storage
    classes without weakening durability.
-   **Disk write latency spikes:** Monitor p95/p99 write latency,
    fsync/flush behavior, storage throttling, and database WAL/log
    volume. Alert on sustained spikes and test degraded-storage
    behavior.
-   **TCP port exhaustion:** Monitor ephemeral port usage, `TIME_WAIT`,
    connection churn, NAT limits, and socket errors. Reuse keep-alive
    connections safely, configure pool limits, close sockets, and avoid
    creating a new connection per request.
-   **Concurrent map writes:** In languages with unsafe concurrent map
    access (for example, Go), protect shared maps with synchronization
    or use a concurrency-safe structure. Run race detection/tests where
    available.
-   **Unchecked type assertions:** Check assertion success and handle
    unexpected types safely. Validate external data at boundaries; never
    allow a failed assertion to crash a critical request path.
-   **Leaked database connections:** Close rows/cursors and release
    connections in guaranteed cleanup paths. Test cancellation and error
    paths; alert on long-held connections and pool wait time.
-   **Database connection pool exhaustion:** Bound concurrency and pool
    size, set acquisition deadlines, and investigate slow queries or
    leaks before increasing pool capacity.
-   **Database deadlock storm:** Use consistent lock ordering, short
    transactions, bounded retry with jitter, and incident-level
    observability. Avoid synchronized retries that amplify contention.
-   **Queue overload:** Apply backpressure, bounded queues, consumer
    scaling with caps, and load shedding. Do not accept unlimited
    background work.
-   **Thread/goroutine/task leaks:** Ensure cancellation propagation,
    bounded worker pools, and lifecycle cleanup.
-   **Graceful shutdown:** Stop accepting new work, drain in-flight
    requests within a deadline, stop consumers safely, flush required
    telemetry, and close dependencies.

## 16. Health checks, monitoring, and log aggregation

### Health checks

-   Provide separate liveness and readiness checks where the platform
    supports them.
-   Liveness should answer whether the process is alive and able to make
    progress; readiness should answer whether it can safely receive
    traffic.
-   Use startup probes for slow initialization. Avoid aggressive probe
    intervals that cause restart loops.
-   Check critical local initialization and dependency readiness without
    creating a cascading failure by probing every dependency too
    frequently.
-   Expose health endpoints without leaking versions, credentials,
    internal topology, stack traces, or sensitive dependency details.

### Logs, metrics, and traces

-   Centralize structured logs, metrics, and distributed traces using an
    approved observability platform.
-   Include correlation/request IDs and trace IDs. Propagate them across
    services and queue messages.
-   Never log passwords, access/refresh tokens, API keys, session
    cookies, private keys, payment data, or unnecessary personal data.
-   Sanitize untrusted log fields to prevent log injection and control
    log size/cardinality.
-   Use consistent timestamps (UTC), severity levels,
    service/environment/version fields, and event names.
-   Set retention, access control, encryption, and deletion policies for
    telemetry.
-   Monitor golden signals: latency, traffic, errors, and saturation.
    Also monitor security events, authentication failures, rate-limit
    hits, queue lag, database pool use, lock waits, cache hit ratio,
    OOMs, restarts, disk capacity/latency, TCP/socket exhaustion, and
    certificate expiry.
-   Define actionable alerts with an owner, severity, runbook, and
    escalation path. Avoid noisy alerts and alert fatigue.
-   Audit privileged actions, permission changes, secret access,
    deployment events, and sensitive data access.

## 17. Variables, configuration, and secrets

-   Use clear, typed, validated configuration variables. Fail startup on
    missing or invalid required configuration rather than silently using
    insecure defaults.
-   Separate development, test, staging, and production configuration.
-   Keep credentials in a secret manager or protected runtime injection
    mechanism. Never hardcode credentials in source, frontend bundles,
    Docker images, database seeders, fixtures, or CI logs.
-   Do not commit `.env` files containing real secrets. Provide a safe
    `.env.example` with placeholders only.
-   Rotate secrets and document ownership, scope, expiry, and emergency
    revocation.
-   Restrict environment-variable exposure: avoid dumping the full
    environment in logs, debug pages, crash reports, or support bundles.
-   Treat client-side variables as public. Any variable bundled into
    browser code must contain no secret.
-   Use feature flags for controlled rollout, but protect flag
    administration and remove stale flags.

## 18. Database seeders and migrations

-   Seeders must be deterministic, repeatable, and safe to run more than
    once where possible.
-   Never seed production with default passwords, public admin accounts,
    real personal data, or predictable credentials.
-   Separate reference data from demo/test data. Require explicit
    approval for production data changes.
-   Use synthetic or anonymized data in non-production environments.
-   Ensure migrations are versioned, reviewed, observable, and
    compatible with rolling deployments.
-   Back up data before risky migrations and verify restore procedures
    regularly.
-   Avoid destructive migration steps until all application versions no
    longer depend on the old schema.
-   Do not run large backfills in a deployment transaction if they can
    lock critical tables; use resumable batches with checkpoints.

## 19. Testing and verification requirements

At minimum, add or run tests appropriate to the change:

-   Authentication, authorization, tenant isolation, and privilege
    escalation tests.
-   Input validation, malformed JSON, oversized payload, and
    content-type tests.
-   SQL injection and other injection regression tests.
-   Rate-limit, throttling, timeout, retry, and circuit-breaker tests.
-   Idempotency and duplicate/concurrent request tests.
-   Transaction rollback, deadlock handling, race-condition, and
    data-integrity tests.
-   Queue duplicate delivery, poison message, DLQ, and replay tests.
-   Cache isolation, invalidation, expiry, and stampede tests.
-   WebSocket origin/authz/message-limit tests or gRPC
    auth/deadline/size tests, when applicable.
-   Load, stress, spike, soak, and graceful-shutdown tests for critical
    services.
-   Migration forward/rollback or recovery tests.
-   Container/image scanning and dependency/secret scanning.
-   Health/readiness behavior when dependencies are slow or unavailable.

Do not claim a test passed unless it was actually executed. Report
skipped tests and environmental limitations explicitly.

## 20. Operational readiness and incident response

Every production service should have:

-   An owner and escalation contact.
-   A service diagram and dependency inventory.
-   SLOs/SLIs and alert thresholds.
-   Capacity assumptions and load-test results.
-   Backup, restore, disaster-recovery, and data-retention procedures.
-   Deployment, rollback, and migration runbooks.
-   Security incident and credential-rotation procedures.
-   Queue replay/DLQ and data reconciliation procedures.
-   A documented degraded-mode strategy.

During an incident, prioritize containment, preservation of evidence,
safe recovery, and clear communication. Do not delete logs or make
destructive changes to hide symptoms. Rotate compromised credentials and
assess the scope of exposure.

## 21. Agent implementation checklist

Before marking work complete, the agent must verify each applicable
item:

-   [ ] Trust boundaries and authorization checks are understood.
-   [ ] Inputs, JSON schemas, payload sizes, and output encoding are
    validated.
-   [ ] SQL uses parameter binding; dynamic SQL identifiers are
    allowlisted.
-   [ ] Authentication, session, JWT/token validation, and CSRF controls
    are correct.
-   [ ] CORS is restrictive if browser cross-origin access is used;
    "CORE policy" has been clarified with the owner.
-   [ ] TLS and certificate validation remain enabled.
-   [ ] Rate limits, throttles, concurrency caps, and DDoS edge
    protections are in place.
-   [ ] Timeouts, cancellation, bounded retries, exponential backoff,
    and jitter are configured.
-   [ ] Side effects are idempotent where retries or duplicate delivery
    are possible.
-   [ ] Transactions, deadlocks, race conditions, and distributed
    workflows are safe.
-   [ ] N+1 queries, query plans, indexes, fragmentation/bloat, and pool
    usage are reviewed.
-   [ ] Connections, sockets, files, cursors, and other resources are
    always released.
-   [ ] Queues have bounds, backpressure, retry policy, DLQ, and
    monitoring.
-   [ ] Cache keys preserve authorization boundaries and invalidation is
    defined.
-   [ ] Docker/Kubernetes permissions, image hygiene, resource limits,
    and probes are configured.
-   [ ] CI/CD scans, tests, artifact integrity, approvals, and rollback
    are addressed.
-   [ ] Logs/metrics/traces are useful and contain no secrets or
    unnecessary sensitive data.
-   [ ] Memory, CPU, disk I/O, disk latency, TCP ports, and OOM behavior
    are observable.
-   [ ] Seeders and migrations are repeatable, safe, and
    production-aware.
-   [ ] Tests were run and results, limitations, and residual risks are
    reported.

## 22. Required completion report from the agent

For every meaningful implementation, report:

1.  **What changed:** files, services, routes, schemas, infrastructure,
    and configuration.
2.  **Security controls:** controls added, reused, or verified.
3.  **Stability controls:** limits, timeouts, retries, resource cleanup,
    and failure behavior.
4.  **Data impact:** migrations, backfills, seeders, compatibility, and
    rollback.
5.  **Verification:** exact tests/scans/commands run and their results.
6.  **Operational impact:** dashboards, alerts, logs, capacity, and
    runbooks.
7.  **Known gaps:** unresolved "CORE policy" meaning, "Token JET"
    meaning, assumptions, accepted risks, and follow-up owners.

**Final principle:** If a security or stability property cannot be
verified, state that it is unverified. Never claim production readiness
based only on a successful build.
