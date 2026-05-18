# tw-ecommerce-majordomo

> **台灣電商總管** — 一個 plugin 把 29 個 `tw-ecom-*` skills 和 12 個 MCP servers 一次塞進你的 coding agent，讓它像有十年台灣電商經驗的營運總管。

[English](README.en.md) (TODO)

支援 **Claude Code**、**Codex CLI / App**、**Cursor**、**Gemini CLI**、**OpenCode**、**Factory Droid**。

## 為什麼叫 majordomo？

中文裡的**掌櫃**和**總管**是有溫度的詞——指「替頭家管事的可靠人」。不是無關係的雇員 (manager)、也不是有距離的執行者 (agent)，而是把整間店、整個家當成自己事業在跑的內部人。

英文要找到對等的 register，得進到古典詞彙才有那個分量。**Majordomo** 從拉丁文 _majordomus_（家中之首）來，原指中世紀貴族府邸或皇室的總管——後來延伸到任何「替主人統管全部事務的人」。

我們想讓這個 plugin 之於你的 coding agent，就是 majordomo 之於電商頭家：金流、物流、發票、合規、客服這些瑣碎卻致命的事，一手張羅好，讓你能專心經營品牌跟顧客。

## 內容物

- **29 個 `tw-ecom-*` skills**（[完整索引 →](docs/SKILLS-INDEX.md)）
  - 💳 Payment 金流 × 5：ECPay、NewebPay、JKO Pay、TapPay、dispute
  - 🚚 Logistics 物流 × 4：超商取貨、宅配、冷鏈、跨境
  - 🏪 DTC 平台 × 3：Shopline、91APP、Shopify 在地化
  - 🛒 Marketplace × 2：Shopee、momo
  - 🧾 Invoice 電子發票 × 4：載具、ezPay、Universal EC、作廢
  - ⚖️ Compliance 合規 × 4：消保法、PDPA、商品法規、跨境
  - ⚙️ Operations 營運 × 4：客服、LINE OA、定價、促銷
  - 📊 Analytics 分析 × 2：GA4、台灣電商 benchmark
  - 🎯 Channel Strategy 通路策略 × 1

- **12 個 MCP servers**（[設定對照表 →](docs/MCP-SETUP.md)）
  - 金流：`ecpay`、`ecpay-logistics`、`newebpay`
  - 物流：`kerry-tj`、`hct-logistics`、`sf-express`
  - DTC / vendor：`shopline`、`91app`（私）、`cyberbiz`（私）、`buy123-vendor`
  - 電子發票：`ezpay-einvoice`、`universalec-einvoice`

## 前置需求

- 對應的 agent harness（Claude Code / Codex / Cursor / Gemini CLI / OpenCode / Factory Droid 擇一以上）
- [`uv`](https://docs.astral.sh/uv/)（MCP servers 透過 `uvx` 啟動）

  ```bash
  curl -LsSf https://astral.sh/uv/install.sh | sh
  ```

## 安裝

### Claude Code

```bash
# 註冊本 plugin 的 marketplace
/plugin marketplace add asgard-ai-platform/tw-ecommerce-majordomo

# 安裝
/plugin install tw-ecommerce-majordomo@tw-ecommerce-majordomo
```

### Codex CLI / App

```bash
# CLI
/plugins
# 搜尋 "tw-ecommerce-majordomo" → Install
```

或在 Codex App 的 Plugins 頁面搜尋安裝。

### Cursor

```bash
# 加入 Cursor plugin marketplace
cursor plugin add asgard-ai-platform/tw-ecommerce-majordomo
```

> Cursor plugin 目前不會自動註冊 MCP servers — 把 [`mcp.json`](mcp.json) 的 `mcpServers` 區塊複製進 `~/.cursor/mcp.json`，或在 Cursor Settings → MCP 中加入。

### Gemini CLI

```bash
gemini extensions install asgard-ai-platform/tw-ecommerce-majordomo
```

### OpenCode

在 `opencode.json`（global 或 project）加入：

```json
{
  "plugin": ["tw-ecommerce-majordomo@git+https://github.com/asgard-ai-platform/tw-ecommerce-majordomo.git"]
}
```

詳見 [`.opencode/INSTALL.md`](.opencode/INSTALL.md)。

### Factory Droid

```bash
droid plugin marketplace add https://github.com/asgard-ai-platform/tw-ecommerce-majordomo
droid plugin install tw-ecommerce-majordomo@tw-ecommerce-majordomo
```

## 設定 MCP 憑證

1. 把 [`.env.example`](.env.example) 複製成 `.env`
2. 只填你會用到的 MCP 的 env vars（缺少 env var 只會讓單一 MCP 失效，不影響其他）
3. 載入 env：建議用 [`direnv`](https://direnv.net/) 或 `set -a; source .env; set +a`

完整對照在 [`docs/MCP-SETUP.md`](docs/MCP-SETUP.md)。

## 試試看

安裝完成後，問你的 agent：

```
我要在 Shopline 開新店，幫我規劃金流、物流、發票串接
```

或：

```
ECPay 信用卡退款流程怎麼跑？順便檢查我目前的 CheckMacValue 簽章邏輯
```

agent 會挑出對應的 `tw-ecom-*` skills 與 MCP tools 來回答。

## 開發

```bash
# 同步上游 asgard-skills 到本 repo 的 skills/
SKILLS_SRC=/path/to/asgard-ai-platform/skills ./scripts/sync-skills.sh

# 預設假設上游在 ../skills
./scripts/sync-skills.sh
```

## 相關 repos

- [asgard-ai-platform/skills](https://github.com/asgard-ai-platform/skills) — 293 個 coding agent skills 主庫（本 plugin 從中挑出 29 個 `tw-ecom-*`）
- [asgard-ai-platform/*](https://github.com/asgard-ai-platform) — 12 個 MCP servers
- [obra/superpowers](https://github.com/obra/superpowers) — plugin 多 harness 打包的參考實作

## License

MIT — 見 [LICENSE](LICENSE)。
