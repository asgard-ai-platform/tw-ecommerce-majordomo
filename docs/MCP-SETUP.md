# MCP Setup — 12 個台灣電商 MCP servers

每個 MCP server 都透過 `uvx` 從 GitHub 直接安裝（需先裝 [`uv`](https://docs.astral.sh/uv/)）。
plugin manifest 已宣告好啟動指令，你只需要在環境中提供對應的 API 憑證。

## 前置需求

```bash
# 1. 安裝 uv
curl -LsSf https://astral.sh/uv/install.sh | sh

# 2. 確認 uvx 可用
uvx --version
```

## 憑證管理

把 plugin 根目錄的 `.env.example` 複製成 `.env`、填入需要的憑證，然後讓你的 harness 或 shell 載入（如 `direnv`、`dotenvx`、`source .env`）。

每個 MCP 只在缺它自己的 env var 時才會失效，不會牽連其他 MCP。

## 各 MCP 細節對照

### 1. ECPay 綠界（金流） — `ecpay`

| Env var | 必填 | 說明 |
|---|---|---|
| `ECPAY_ENV` | optional | `stage`（預設）/ `prod` |
| `ECPAY_MERCHANT_ID` | **required** | 綠界後台特約商店編號 |
| `ECPAY_HASH_KEY` | **required** | HashKey |
| `ECPAY_HASH_IV` | **required** | HashIV |
| `ECPAY_PLATFORM_ID` | optional | 平台商代收用 |

### 2. ECPay Logistics（物流） — `ecpay-logistics`

共用 ECPay 商店帳號。`ECPAY_MERCHANT_ID` / `ECPAY_HASH_KEY` / `ECPAY_HASH_IV` 與上方相同。

### 3. NewebPay 藍新（金流） — `newebpay`

| Env var | 必填 | 說明 |
|---|---|---|
| `NEWEBPAY_ENV` | optional | `test`（預設）/ `production` |
| `NEWEBPAY_NDNF_*` | NDNF 線上付款必填 | 商店代號、HashKey、HashIV |
| `NEWEBPAY_NDNP_*` | NDNP 定期定額必填 | 同上但獨立商店 |

### 4. Kerry TJ 嘉里大榮（物流） — `kerry-tj`

| Env var | 必填 | 說明 |
|---|---|---|
| `KERRY_TJ_USERNAME` | tracing/EDI 需要 | Basic Auth username |
| `KERRY_TJ_PASSWORD` | tracing/EDI 需要 | Basic Auth password |

留空僅能 probe 公開 endpoint。

### 5. HCT 新竹貨運（物流） — `hct-logistics`

| Env var | 必填 | 說明 |
|---|---|---|
| `HCT_COMPANY` | **required** | EDI WebService2 company id |
| `HCT_PASSWORD` | **required** | EDI WebService2 password |

### 6. SF Express 順豐（物流） — `sf-express`

| Env var | 必填 | 說明 |
|---|---|---|
| `SF_ENV` | optional | `sandbox`（預設）/ `prod` |
| `SF_PARTNER_ID` | **required** | OAuth2 partnerID |
| `SF_SECRET` | **required** | OAuth2 secret |

### 7. Shopline（DTC） — `shopline`

| Env var | 必填 | 說明 |
|---|---|---|
| `SHOPLINE_API_TOKEN` | **required** | Shopline Open API access token |

### 8. 91APP（DTC） — `91app` ⚠️ private repo

需 asgard-ai-platform org access 才能 `uvx`。共 4 條認證軌（Admin / IMS / Payments / Member），分別有獨立 base URL 與 key。詳見 `.env.example` 中 `APP_91APP_*` 區塊。

### 9. Cyberbiz（DTC） — `cyberbiz` ⚠️ private repo

| Env var | 必填 | 說明 |
|---|---|---|
| `CYBERBIZ_USERNAME` | **required** | HMAC-SHA256 username |
| `CYBERBIZ_SECRET` | **required** | HMAC-SHA256 secret |

### 10. buy123 vendor — `buy123-vendor`

| Env var | 必填 | 說明 |
|---|---|---|
| `BUY123_VENDOR_ID` | **required** | 廠商 ID |
| `BUY123_VENDOR_EMAIL` | **required** | 廠商登入 email |
| `BUY123_VENDOR_PASSWORD` | **required** | 廠商登入密碼 |

### 11. ezPay 簡單付電子發票 — `ezpay-einvoice`

| Env var | 必填 | 說明 |
|---|---|---|
| `EZPAY_MERCHANT_ID` | **required** | ezPay 商店代號 |
| `EZPAY_HASH_KEY` | **required** | HashKey |
| `EZPAY_HASH_IV` | **required** | HashIV |
| `EZPAY_IS_PRODUCTION` | optional | `false`（預設）/ `true` |

### 12. Universal EC 汎宇電商電子發票 — `universalec-einvoice`

| Env var | 必填 | 說明 |
|---|---|---|
| `EINVOICE_BASE_URL` | optional | 預設為正式環境 endpoint |
| `EINVOICE_SELLER_ID` | **required** | 開立商店 ID |
| `EINVOICE_POS_ID` | **required** | POS 機台 ID |
| `EINVOICE_POS_SN` | **required** | POS 機台序號 |

## 在不同 harness 註冊 MCP

### Claude Code / Antigravity CLI (agy)

不需手動設定 — plugin manifest 已內含 `mcpServers`，安裝 plugin 後 harness 會自動拉起。

### Cursor

把 `mcp.json` 內的 `mcpServers` 區塊複製到 `~/.cursor/mcp.json`：

```bash
# 直接覆蓋（若 cursor 還沒有 mcp.json）
cp /path/to/tw-ecommerce-majordomo/mcp.json ~/.cursor/mcp.json
```

或開 Cursor → Settings → MCP 手動加入。

### Codex CLI / App

```bash
# 把 mcpServers 區塊合併進 ~/.codex/mcp.json
```

### OpenCode

OpenCode plugin 會自動把 MCP servers 合併進你的 `opencode.json`。詳見 [`.opencode/INSTALL.md`](../.opencode/INSTALL.md)。

## 驗證

啟動你的 agent 後問："列出你目前可以用的 ECPay / Shopline tools"，應該會看到對應 MCP 提供的工具清單。
