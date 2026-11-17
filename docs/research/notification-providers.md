# In-app notification inbox providers

Research for issue #2 (parent #1). Findings only, no recommendation. Fetched 2026-11-17 from official vendor pages; each row cites its source. "Not stated" means the cited page did not say so, not that the feature is absent.

Fit context: React Router app, SQLite via Drizzle, session-based dev users (Student, Instructor, Platform Admin). Every provider below needs a stable recipient ID (our user id) and, for production, a server-signed token/hash minted from our session.

## Summary table

| Provider | Free tier | First paid tier | React SDK | Headless | Self-host | Preferences | Email/push later |
|---|---|---|---|---|---|---|---|
| Novu | 10,000 workflow runs/mo, unlimited subscribers, 24h activity-feed retention | Pro from $30/mo (30k runs) | `@novu/react` Inbox | Yes (`useNotifications`, `useCounts`, `@novu/js`) | Yes, open-core (MIT core, commercial `enterprise` folder); needs MongoDB + Redis + object storage | Preferences UI in Inbox; preferences API not documented on pages read | Yes (email, SMS, push, chat on free tier) |
| Knock | 10,000 messages/mo, 30-day log retention | Starter $250/mo (50k msgs) | `@knocklabs/react` feed components | Yes (React hooks; `@knocklabs/client`) | Not stated (only "dedicated infrastructure" on Enterprise) | Per-recipient PreferenceSet (channels, categories, workflows); React preference center | Yes (email, push, SMS, chat) |
| Courier | 10,000 sends/mo (Developer) | Business $0.005/send | Inbox SDK (React v9; older `react-inbox` deprecated) | Yes (low-level APIs for a fully custom UI) | Not stated | Topics with opt-in/opt-out/required, per-tenant, user preference page/API | Yes (push via same SDK; other channels via routing) |
| MagicBell | Builder: 1,000 deliveries/mo (deliveries counted per channel) | Startup $249/mo (50k) | React, Preact, Svelte, Web Components, Browser/Node client | Not confirmed (API reference exists) | Not stated | Built-in user channel preferences | Yes (email, mobile/web push, SMS, Slack, Teams) |
| SuprSend | 10k notifications/mo; in-app feed shows SuprSend branding | Essentials $100/mo (unbranded feed); user preferences only on Business $250/mo | `@suprsend/react` drop-in inbox | Yes (hooks) | Enterprise only (self-hosted / BYOC beta) | Business plan and up | Yes (unlimited channels on free) |
| OneSignal | Free plan: in-app messaging unlimited up to 1,000 MAU | Growth from $19/mo | No inbox component found | No inbox API; you store history yourself | Not stated | Not applicable to an inbox | Yes (strong push/email, but no inbox) |

## Per provider

### Novu
- Pricing: Free $0 with 10,000 workflow runs/mo, 5 workflows, 2 environments, unlimited subscribers, 60 RPS, 24h activity-feed retention, all channels, up to 3 team members. Pro from $30/mo (30,000+ runs, 7-day retention), Team from $250/mo, overage $1.20 per 1K runs. Source: https://novu.co/pricing
- React: `@novu/react` Inbox component (React 18+); takes `applicationIdentifier`, `subscriber`, `routerPush` for router navigation; subscribers auto-created on first use. Updating an existing subscriber profile requires an HMAC `subscriberHash`. Source: https://docs.novu.co/platform/inbox/react/get-started
- Headless: `NovuProvider`, `useNotifications` (pagination, realtime), `useCounts`, `useNovu` (read/archive), `novu.on()` events; non-React via `@novu/js`. Source: https://docs.novu.co/platform/inbox/headless/get-started
- Self-host: multi-VM or single-VM; MongoDB, Redis (AOF), S3-compatible object storage; single VM ~4 vCPU / 8 GB. Some Cloud-only features are missing; same API. Pricing page lists self-hosted deployment under Enterprise. Sources: https://docs.novu.co/community/self-hosting-novu/overview, https://novu.co/pricing
- License: open-core, MIT core, commercial license for the `enterprise` folder. Source: https://github.com/novuhq/novu
- Preferences: embeddable preferences component, and the Inbox menu shows notifications and preferences (GitHub README, Inbox docs). Critical workflows are hidden from preferences. Preference API details were not on the pages read.
- Later channels: Email, SMS, Push, Chat listed with provider counts (20/37/8/13; in-app 1). Source: GitHub README.

### Knock
- Pricing: Free $0 with up to 10,000 messages/mo, 500 guide recipients, 30-day log retention. Starter $250/mo incl. 50,000 messages then $0.005 each. Self-hosting not mentioned on the page. Source: https://knock.app/pricing
- React: `@knocklabs/react`; `KnockProvider`, `KnockFeedProvider`, `NotificationIconButton`, `NotificationFeedPopover`; unread vs unseen badge; `renderItem` override; i18n (English default). Production needs "enhanced security" with a signed `userToken`. Source: https://docs.knock.app/in-app-ui/react/feed
- Headless: React hooks and lower-level primitives for custom UI. Source: https://docs.knock.app/in-app-ui/react/overview
- Preferences: per-user PreferenceSet recording opted-out channels, categories, workflows; checked before each workflow send. Per-tenant/object preferences and a hosted preference center also exist. Source: https://docs.knock.app/concepts/preferences
- Later channels: email, push, SMS, chat; workflows can fall back from in-app to email. Source: https://docs.knock.app/in-app-ui/overview

### Courier
- Pricing: Developer free, 10,000 sends/mo (one template to one recipient = one send, regardless of channels). Business $0.005/send. Self-hosting not mentioned. Source: https://www.courier.com/pricing
- Inbox: embeddable inbox, toasts, preference UI; SDKs for React (v9), Web Components, Vue, Angular, iOS, Android, Flutter, React Native. Auth: backend mints a JWT with the Courier API key, client calls `signIn`. Read/archive/unread counts, cross-device sync, custom theme or fully custom UI via low-level APIs. Older `@trycourier/react-inbox` packages are marked deprecated. Add `inbox` to message routing. Source: https://www.courier.com/docs/platform/inbox/inbox-overview
- Preferences: subscription topics with defaults `OPTED_IN`/`OPTED_OUT`/`REQUIRED`, tenant defaults, user opt-in/out via preference page or API. Blocked sends still count toward usage. Source: https://www.courier.com/docs/platform/preferences/preferences-overview

### MagicBell
- Pricing: Builder $0 with 1,000 deliveries/mo, unlimited users; Startup $249/mo with 50,000 deliveries then $0.0025 each; delivery counted per channel. Self-hosting not mentioned. Source: https://www.magicbell.com/pricing
- SDKs: React, Preact, Svelte, Web Components, Browser/Node client, Go client, CLI; auth via Project JWT and User JWT. Source: https://www.magicbell.com/docs. React-specific and headless pages were not retrievable (404).
- Preferences: end users pick channels per notification; applied automatically. Source: https://www.magicbell.com
- Channels: email (SES, Mailgun, SendGrid, SMTP), mobile push (APNs, FCM, Expo), web push, SMS (Twilio), Slack, Teams, in-app. Source: https://www.magicbell.com/docs

### SuprSend
- Pricing: Free 10k notifications/mo, unlimited channels and team members; in-app feed carries SuprSend branding. Essentials $100/mo (50k, unbranded feed); Business $250/mo adds batching/digest and user preferences; self-hosted and BYOC (beta) are Enterprise. Source: https://www.suprsend.com/pricing
- SDK: `@suprsend/react` with drop-in components or headless hooks; JWT user tokens (older `@suprsend/react-inbox` unsupported). Source: https://docs.suprsend.com/docs/inbox-react

### OneSignal
- Free plan: in-app messaging unlimited up to 1,000 MAU, 10,000 email sends/mo; Growth from $19/mo. The pricing page does not mention an inbox. Source: https://onesignal.com/pricing
- No built-in inbox: OneSignal "does not currently store the history of messages sent to each individual user"; the documented approach is to store history on your own server via the REST API or Event Streams and render it yourself. Source: https://documentation.onesignal.com/docs/en/create-an-activity-feed.md
- The `message-center` docs URL returned 404 and the llms.txt index listed no inbox page (only the activity-feed guide and the OS notification tray page), so on the evidence found it is not an inbox provider.

## Cross-cutting notes
- Free-tier units differ and are not directly comparable: workflow runs (Novu), messages (Knock), sends (Courier), deliveries per channel (MagicBell), notifications (SuprSend).
- Only Novu has a documented, publicly self-hostable open-core option (Docker, MongoDB, Redis). SuprSend self-host is Enterprise-only. Knock, Courier, MagicBell: self-hosting not stated on pages read.
- Retention on free tiers: Novu activity feed 24h; Knock log retention 30 days, with feed retention stated as unlimited but configurable. Whether Novu's 24h applies to inbox notifications or only the activity log was not explicit.
- All candidates except OneSignal ship a React component plus a headless/hook path, and all use a server-signed credential (HMAC or JWT) for production, which the app would mint from its session user.
- Gaps: Novu preference API, MagicBell React/headless and preferences docs, and self-host status for Knock/Courier/MagicBell were not confirmed from primary sources. Not researched: Pusher Beams, Engagespot, NotificationAPI, a DIY inbox table in SQLite/Drizzle.
