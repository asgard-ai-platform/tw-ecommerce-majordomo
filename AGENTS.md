# tw-ecommerce-majordomo — Agent Context Primer

You have access to the **Taiwan e-commerce majordomo** plugin, which bundles
**29 `tw-ecom-*` skills** and wires up **12 MCP servers** for the canonical
台灣電商 stack. Treat this as a domain-specific operating manual.

## What the plugin gives you

### Skills (29) — bundled under `./skills/`, auto-discovered by your harness

Organized into 8 functional layers. The `tw-ecom-` prefix is mandatory; trust
the skill's own `description` frontmatter to decide when to reach for it.

| Layer | Count | Skills |
|---|---|---|
| analytics | 2 | benchmarks, ga4 |
| channel-strategy | 1 | channel-strategy |
| compliance | 4 | consumer, cross-border, pdpa, product |
| dtc | 3 | 91app, shopify-localization, shopline |
| invoice | 4 | carrier, ezpay, universalec, void |
| logistics | 4 | cold-chain, cross-border, cvs, home |
| marketplace | 2 | momo, shopee |
| operations | 4 | customer-service, line-oa, pricing, promotion |
| payment | 5 | dispute, ecpay, jkopay, newebpay, tappay |

### MCP servers (12)

| Server | Domain | Notes |
|---|---|---|
| `ecpay`, `ecpay-logistics` | ECPay 綠界 payment + logistics | shares 綠界 merchant credentials |
| `newebpay` | NewebPay 藍新 payment | NDNF (online) + NDNP (recurring) accounts |
| `kerry-tj`, `hct-logistics`, `sf-express` | 物流：嘉里大榮 / 新竹 / 順豐 | EDI / OAuth2 |
| `shopline`, `91app`, `cyberbiz`, `buy123-vendor` | DTC + marketplace vendor portals | 91app & cyberbiz repos are private |
| `ezpay-einvoice`, `universalec-einvoice` | 電子發票 | B2B/B2C 開立、作廢、折讓 |

## How to use this primer

1. **For any台灣電商相關 task**, list the relevant `tw-ecom-*` skills first
   before writing code. Skill `description` fields tell you when to use vs not
   use each one.
2. **Before calling an MCP**, check that the matching env vars are set. If
   they aren't, surface the missing var name to the user instead of falling
   back to mock data.
3. **Cross-skill workflows** are common (e.g., 訂單 → 金流授權 → 物流派車 →
   開電子發票 → 對帳). Follow the `related_skills` / `related_mcps` lists in
   each SKILL.md frontmatter to assemble the chain.

## Taiwan-specific gotchas (load first, regret nothing)

- **電子發票 must be issued at the right moment** — the rule for B2C 雲端發票
  is "出貨/取貨後 48 小時內"，不是訂單成立就開. See `tw-ecom-invoice-*`.
- **超商取貨付款 = 物流+金流綁定**：使用 ECPay 時 `ecpay` 與
  `ecpay-logistics` 是分開的 MCP，務必走 combined 流程 skill。
- **PDPA / 個資法 vs GDPR**：兩者要求不同；跨境流量時看
  `tw-ecom-compliance-pdpa` 與 `tw-ecom-compliance-cross-border`。
- **黑五 / 雙 11 / 雙 12** 是台灣電商的三大流量峰；`tw-ecom-operations-*` 的
  promotion / pricing skills 有相應 playbook。
- **回 callback 簽章驗證**：ECPay `CheckMacValue`、NewebPay AES+SHA256 加解密
  邏輯都有專門 skill；不要重寫，呼叫 skill 即可。

## Setup pointer

If MCPs aren't responding, ask the user to confirm `.env.example` has been
filled in (copy at repo root) and `uv` is installed (the MCP servers run via
`uvx`). Full env var reference: `docs/MCP-SETUP.md`.

## Maintenance note (for agents editing this repo)

This repo distributes the same plugin to multiple agent tools, with the
**`mcpServers` block declared in 5 places**:

- `mcp_config.json` — Antigravity (agy)
- `.claude-plugin/plugin.json` — Claude Code
- `.codex-plugin/plugin.json` — Codex CLI / App
- `.cursor-plugin/plugin.json` — Cursor
- `mcp.json` — canonical reference for manual Cursor / Codex / OpenCode setup

When adding, renaming, or changing env vars on any MCP server, update **all
five** files in the same commit. There is currently no automated check —
silent drift here means one harness works while another breaks.
