# tw-ecommerce-majordomo

> **Taiwan e-commerce majordomo** — one plugin that pours 29 `tw-ecom-*` skills and 12 MCP servers into your coding agent, so it operates like a store manager with ten years of Taiwan e-commerce on the floor.

**Live demo →** [asgard-ai-platform.github.io/tw-ecommerce-majordomo](https://asgard-ai-platform.github.io/tw-ecommerce-majordomo/) — hero, the 29 + 12 inventory, all six install paths, and the full Shopline-onboarding use-case walkthrough.

[繁體中文](README.md)

Supports **Claude Code**, **Codex CLI / App**, **Cursor**, **Antigravity CLI (agy)**, **OpenCode**, and **Factory Droid**.

## Why "majordomo"?

In Mandarin, **掌櫃 (zhǎngguì)** and **總管 (zǒngguǎn)** are warm words — they mean "the trusted person who runs the shop on the owner's behalf." Not a detached employee (_manager_), not a distant operative (_agent_), but an insider who treats the whole storefront as their own livelihood.

English has to reach back into the older register for an equivalent that carries the same weight. **Majordomo**, from Latin _majordomus_ ("head of the house"), originally named the chief steward of a noble household — later generalized to anyone who runs all affairs on a principal's behalf.

What majordomo is to a shop owner, this plugin tries to be to your coding agent: the small, fiddly, fatal things — payments, logistics, e-invoicing, compliance, customer service — handled with one pair of hands, so you can spend your attention on the brand and the customer.

## What's inside

- **29 `tw-ecom-*` skills** ([full index →](docs/SKILLS-INDEX.md))
  - 💳 Payments × 5: ECPay, NewebPay, JKO Pay, TapPay, dispute / chargeback
  - 🚚 Logistics × 4: convenience-store pickup, home delivery, cold chain, cross-border
  - 🏪 DTC platforms × 3: Shopline, 91APP, Shopify (Taiwan localization)
  - 🛒 Marketplaces × 2: Shopee, momo
  - 🧾 E-invoicing × 4: carrier codes, ezPay, Universal EC, void / credit notes
  - ⚖️ Compliance × 4: Consumer Protection Act, PDPA, product regulation, cross-border
  - ⚙️ Operations × 4: customer service, LINE OA, pricing, promotion
  - 📊 Analytics × 2: GA4, Taiwan e-commerce benchmarks
  - 🎯 Channel strategy × 1

- **12 MCP servers** ([setup reference →](docs/MCP-SETUP.md))
  - Payments: `ecpay`, `ecpay-logistics`, `newebpay`
  - Logistics: `kerry-tj`, `hct-logistics`, `sf-express`
  - DTC / vendor: `shopline`, `91app` (private), `cyberbiz` (private), `buy123-vendor`
  - E-invoicing: `ezpay-einvoice`, `universalec-einvoice`

## Prerequisites

- A supported agent harness (Claude Code / Codex / Cursor / Antigravity CLI (agy) / OpenCode / Factory Droid — pick one or more)
- [`uv`](https://docs.astral.sh/uv/) — MCP servers launch via `uvx`

  ```bash
  curl -LsSf https://astral.sh/uv/install.sh | sh
  ```

## Installation

### Claude Code

```bash
# Register this plugin's marketplace
/plugin marketplace add asgard-ai-platform/tw-ecommerce-majordomo

# Install
/plugin install tw-ecommerce-majordomo@tw-ecommerce-majordomo
```

### Codex CLI / App

```bash
# CLI
/plugins
# Search "tw-ecommerce-majordomo" → Install
```

Or search and install from the Plugins page in the Codex App.

### Cursor

```bash
# Add the plugin from the Cursor plugin marketplace
cursor plugin add asgard-ai-platform/tw-ecommerce-majordomo
```

> Cursor's plugin system doesn't auto-register MCP servers yet — copy the `mcpServers` block from [`mcp.json`](mcp.json) into `~/.cursor/mcp.json`, or add it via Cursor Settings → MCP.

### Antigravity CLI (agy)

```bash
git clone https://github.com/asgard-ai-platform/tw-ecommerce-majordomo \
  .agents/plugins/tw-ecommerce-majordomo
```

### OpenCode

Add to your `opencode.json` (global or project):

```json
{
  "plugin": ["tw-ecommerce-majordomo@git+https://github.com/asgard-ai-platform/tw-ecommerce-majordomo.git"]
}
```

See [`.opencode/INSTALL.md`](.opencode/INSTALL.md) for details.

### Factory Droid

```bash
droid plugin marketplace add https://github.com/asgard-ai-platform/tw-ecommerce-majordomo
droid plugin install tw-ecommerce-majordomo@tw-ecommerce-majordomo
```

## Configure MCP credentials

1. Copy [`.env.example`](.env.example) to `.env`
2. Fill only the env vars for the MCPs you actually use — a missing var disables that one MCP without affecting the rest
3. Load the env: [`direnv`](https://direnv.net/) is recommended, or `set -a; source .env; set +a`

Full reference in [`docs/MCP-SETUP.md`](docs/MCP-SETUP.md).

## Try it

Once installed, ask your agent:

```
I'm opening a new Shopline store. Plan the integrations: payments
(credit card + ATM transfer + convenience-store payment code +
convenience-store COD), logistics (T-Cat home delivery + 7-11
in-store pickup), and e-invoicing (B2C cloud e-invoice + carrier codes).
Give me the wiring order and the callback to verify at each stage.
```

or:

```
Shopline order ORD-12345: customer says they paid but the platform
still shows "unpaid." Check the ECPay authorization result, reconcile
against the Shopline order status, and tell me which side dropped it.
```

or:

```
Double 11 is a month away. Plan the campaign: which SKUs to feature,
how to set the minimum-spend tier, how to split ad budget across
Shopee Ads + LINE OA broadcast + GA4 tracking, and how to forecast ROI.
```

The agent will pick the matching `tw-ecom-*` skills and MCP tools to answer.

📖 **Full scenario catalog**: [`docs/USE-CASES.md`](docs/USE-CASES.md) — 30+ common Taiwan e-commerce situations (store onboarding, order anomalies, payment reconciliation, e-invoice handling, campaign planning, customer-service SOPs, compliance checks, attribution analytics). Each scenario lists a sample prompt + the skills it triggers + the MCPs it calls + edge-case warnings.

## Development

```bash
# Sync upstream asgard-skills into this repo's skills/
SKILLS_SRC=/path/to/asgard-ai-platform/skills ./scripts/sync-skills.sh

# Defaults to ../skills if SKILLS_SRC isn't set
./scripts/sync-skills.sh
```

## Related repos

- [asgard-ai-platform/skills](https://github.com/asgard-ai-platform/skills) — the 293-skill upstream library (this plugin curates 29 `tw-ecom-*` from it)
- [asgard-ai-platform/*](https://github.com/asgard-ai-platform) — the 12 MCP servers
- [obra/superpowers](https://github.com/obra/superpowers) — reference implementation for packaging plugins across multiple agent harnesses

## License

MIT — see [LICENSE](LICENSE).
