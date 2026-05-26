# Use Cases — tw-ecommerce-majordomo

> 把 29 個 `tw-ecom-*` skills 與 12 個 MCP servers 組合起來，可以服務的台灣電商情境。

每個情境列出：

- **情境** — 一句話描述
- **Prompt 範例** — 丟給 coding agent 的提示
- **會用到的 skills** — 哪些 `tw-ecom-*` skill 會被觸發
- **會用到的 MCPs** — 哪些 MCP server 會被呼叫
- **注意** — 邊界、順序、台灣特有陷阱

範圍限定在 plugin 直接能服務的情境（不需要外部 WMS、ERP、自建中台）。
更上層的 agent-first 後台 / 多店治理應用，請看「[延伸：在 agent-first 後台之上](#10-延伸在-agent-first-後台之上)」段落。

> ⚠️ **Skill 完整度說明**：本文件是**能力地圖 / 情境索引**，不是 SOP 保證書。
> 目前 29 個 skills 中只有 `tw-ecom-dtc-shopline`、`tw-ecom-invoice-ezpay`、`tw-ecom-payment-newebpay` 三個有完整 step-by-step body；其餘 26 個是 skeleton 狀態（description + when-to-use 已有，完整 SOP 內容陸續補齊）。
> 遇到 skeleton skill 時，agent 仍能依 description 範圍與 MCP 工具回答，但不保證每個情境都能跑出完整可執行 playbook。每個 skill 的當前完整度看 `skills/<name>/SKILL.md`。

---

## 目錄

1. [開店建置](#1-開店建置)
2. [商品 / 上架](#2-商品--上架)
3. [訂單 / 出貨](#3-訂單--出貨)
4. [金流](#4-金流)
5. [發票](#5-發票)
6. [定價 / 促銷](#6-定價--促銷)
7. [客服 / CRM](#7-客服--crm)
8. [合規](#8-合規)
9. [分析](#9-分析)
10. [延伸：在 agent-first 後台之上](#10-延伸在-agent-first-後台之上)

---

## 1. 開店建置

### 1.1 在 Shopline 開新店，全套金物流發票串接

**情境：** 客戶要在 Shopline 開新店，需要同步把信用卡 / ATM / 超商代碼 / 超商取貨付款 / 電子發票串好。

**Prompt 範例：**
```
我要在 Shopline 開新店，幫我規劃金流（含信用卡 + ATM + 超商代碼 + 超商取貨付款）、
物流（黑貓 + 7-11 賣貨便）、電子發票（B2C 雲端發票 + 載具），給我串接順序與每段
要驗證的 callback。
```

**會用到的 skills：** `tw-ecom-dtc-shopline`、`tw-ecom-payment-ecpay`、`tw-ecom-logistics-cvs`、`tw-ecom-logistics-home`、`tw-ecom-invoice-ezpay`、`tw-ecom-invoice-carrier`

**會用到的 MCPs：** `shopline`、`ecpay`、`ecpay-logistics`、`ezpay-einvoice`

**注意：** 超商取貨付款（COD）= ECPay 金流 + ECPay 物流綁定，必須走 combined 流程，`ecpay` 與 `ecpay-logistics` 是分開的 MCP。發票要在出貨/取貨後 48 小時內開立，不是訂單成立就開。

---

### 1.2 從 Marketplace 起步：Shopee + momo 同時上架

**情境：** 新品牌沒有 DTC 站，先用 Shopee + momo 雙 marketplace 起步，需要規劃 listing、價格策略、出貨流程。

**Prompt 範例：**
```
我是新品牌，先不開 DTC，想在蝦皮和 momo 同時上架。幫我比較兩邊的上架審核、
價格機制、配合檔期、出貨 SLA，給我選品上架順序。
```

**會用到的 skills：** `tw-ecom-channel-strategy`、`tw-ecom-marketplace-shopee`、`tw-ecom-marketplace-momo`、`tw-ecom-operations-pricing`、`tw-ecom-operations-promotion`

**會用到的 MCPs：** 第一階段 marketplace API 主要靠 skill 內容；如果之後做 vendor portal 整合可加 `buy123-vendor`。

**注意：** momo 有 best-price 強制比價條款，跨平台同售價時要算清 listing fee + 平台抽成；蝦皮的 SIP 跨境計畫會自動把商品同步到他國 Shopee，要評估是否要 opt-in。

---

### 1.3 Hybrid：DTC + Marketplace 同步策略

**情境：** 已經有 Shopline / 91APP DTC 站，現在要再開 Shopee + momo 副通路，但不想自己人工同步庫存與商品。

**Prompt 範例：**
```
我有 Shopline DTC，現在要加 Shopee 跟 momo。給我建議：哪些 SKU 走 DTC 獨家、
哪些走 marketplace、價格要怎麼設才不違反 momo 比價條款，庫存要怎麼分？
```

**會用到的 skills：** `tw-ecom-channel-strategy`、`tw-ecom-dtc-shopline`、`tw-ecom-marketplace-shopee`、`tw-ecom-marketplace-momo`、`tw-ecom-operations-pricing`

**會用到的 MCPs：** `shopline`、視 marketplace 整合範圍可選 `buy123-vendor`

**注意：** Plugin 本身不提供跨通路庫存同步引擎；這個情境 plugin 能做的是「規劃 + 監看單通路狀態」，跨通路庫存對齊要自己寫 sync 邏輯。

---

### 1.4 跨境品牌進台灣

**情境：** 海外品牌想進台灣，需要選通路、處理境外電商營業稅、繁中在地化、台灣金物流。

**Prompt 範例：**
```
我們是新加坡品牌，要進台灣。幫我規劃：要不要設台灣公司、境外電商營業稅怎麼處理、
通路要選 Shopify 還是 Shopline、金流物流發票要怎麼接。
```

**會用到的 skills：** `tw-ecom-compliance-cross-border`、`tw-ecom-channel-strategy`、`tw-ecom-dtc-shopify-localization`、`tw-ecom-logistics-cross-border`、`tw-ecom-payment-ecpay`、`tw-ecom-logistics-cvs`、`tw-ecom-invoice-ezpay`

**會用到的 MCPs：** 視選型而定（`ecpay`、`ezpay-einvoice` 為主）

**注意：** 境外電商若年銷售額超過門檻必須在台辦理稅籍登記（境外電商銷售勞務）；發票必須開台灣電子發票，不是當地發票。Shopify 在台需要透過 ECPay / NewebPay app 接金流。境外出貨到台灣段（DHL / FedEx / UPS / 郵局國際）的承運商選擇、報關、DDP vs DDU 條款由 `tw-ecom-logistics-cross-border` 處理。

---

## 2. 商品 / 上架

### 2.1 商品上架前完整度檢查

**情境：** 一批新品要上 Shopline / 91APP，需要在送上去之前先把 SKU 命名、圖片、描述、分類、稅率、價格全部檢查一遍。

**Prompt 範例：**
```
這是一批新品的商品資料（CSV），幫我檢查 SKU 命名規則、圖片是否齊全、商品描述
是否有缺漏、含稅價格設定、分類選擇是否合理，給我修正建議跟可上架名單。
```

**會用到的 skills：** `tw-ecom-dtc-shopline` 或 `tw-ecom-dtc-91app`、`tw-ecom-operations-pricing`

**會用到的 MCPs：** `shopline`、`91app`（⚠️ private repo，驗證上架後狀態）

**注意：** Plugin 本身不會幫你算 SKU 命名規則 — 你要先告訴 agent 你家品牌的 SKU 規則，agent 才能按規則檢查。

---

### 2.2 規範性商品（食品 / 化妝品 / 保健食品）上架前合規檢查

**情境：** 食品、化妝品、保健食品、酒類在台灣有專屬法規（食安法、化妝品衛生安全管理法、菸酒管理法等），上架前要先確認文案沒踩雷。

**Prompt 範例：**
```
這是一款保健食品（魚油），幫我看商品文案有沒有違反食安法或健康食品管理法的
描述（例如療效宣稱），以及上架前要不要備什麼證明文件。
```

**會用到的 skills：** `tw-ecom-compliance-product`、`tw-ecom-compliance-consumer`

**會用到的 MCPs：** 無（純法規檢查 skill）

**注意：** 健康食品（小綠人）vs 保健食品（一般食品）法規範圍不同，前者需要衛福部認證才能宣稱保健功效。化妝品 2024 年起全面登錄制。

---

### 2.3 7 天鑑賞期例外品上架

**情境：** 生鮮、客製化、數位內容、開封藥品這幾類商品依消保法不適用 7 天鑑賞期，上架時要做正確揭露，否則「不適用聲明無效」。

**Prompt 範例：**
```
我們要上架一款客製化刻字商品 + 一款冷凍生鮮包，幫我確認消保法的 7 天鑑賞期
例外條款怎麼應用，商品頁要怎麼揭露才不會被認定無效。
```

**會用到的 skills：** `tw-ecom-compliance-consumer`、`tw-ecom-logistics-cold-chain`（生鮮）

**會用到的 MCPs：** 無

**注意：** 消保法第 19 條的鑑賞期例外有「合理例外情事」清單；客製化 / 易腐 / 已拆封數位 / 報紙期刊 / 影音商品。沒揭露或揭露不充分時，鑑賞期照算。

---

## 3. 訂單 / 出貨

### 3.1 訂單異常 triage

**情境：** 後台有一筆訂單卡在「付款失敗」、「重複付款」、「出貨逾期」、「庫存對不上」其中一種狀態，要快速判斷是金流 / 物流 / 平台同步哪一邊出問題。

**Prompt 範例：**
```
這筆 Shopline 訂單 ORD-12345 客人說付了錢但平台還是顯示未付款，幫我查 ECPay
那邊的授權結果，比對 Shopline 訂單狀態，告訴我是哪邊掉了。
```

**會用到的 skills：** `tw-ecom-payment-ecpay` 或 `tw-ecom-payment-newebpay`、`tw-ecom-dtc-shopline`、`tw-ecom-payment-dispute`

**會用到的 MCPs：** `ecpay` 或 `newebpay`、`shopline`

**注意：** 「重複付款」常見原因是 callback 沒驗 `CheckMacValue`（ECPay）或 AES+SHA256（NewebPay），導致重複觸發。Plugin 的 payment skill 有處理流程，不要自己重寫簽章驗證。

---

### 3.2 出貨延遲排查（物流商 vs 平台同步）

**情境：** 某筆訂單顯示「已出貨 3 天」但物流追蹤沒進度，要查是物流商實際沒動還是平台沒同步狀態。

**Prompt 範例：**
```
這幾筆訂單顯示已出貨但黑貓追蹤沒進度，幫我查物流商實際狀態 vs Shopline 上的
狀態，列出哪些是真的延遲、哪些只是同步沒到位。
```

**會用到的 skills：** `tw-ecom-logistics-home`（黑貓 / 宅配通 / 新竹 / 郵局）、`tw-ecom-dtc-shopline`

**會用到的 MCPs：** `kerry-tj`（嘉里大榮）、`hct-logistics`（新竹物流）、`sf-express`（順豐）、`shopline`

**注意：** Plugin 沒有黑貓 / 郵局的 MCP（市場上沒有公開 API），那兩家要用物流商提供的 EDI / 對帳檔；嘉里 / 新竹 / 順豐有 MCP。

---

### 3.3 退貨 / 換貨流程（退款 vs 折讓 vs 取消）

**情境：** 客人申請退貨，要判斷該走「取消訂單」、「退款」、還是「折讓」，並對應正確的發票處理（作廢 vs 折讓）。

**Prompt 範例：**
```
這筆訂單已出貨，客人收到後要退貨。發票已在出貨後開立。幫我規劃：金流要怎麼退、
發票要作廢還是開折讓、Shopline 訂單狀態要怎麼更新，順序給我。
```

**會用到的 skills：** `tw-ecom-payment-ecpay` 或 `tw-ecom-payment-newebpay`、`tw-ecom-invoice-void`、`tw-ecom-compliance-consumer`、`tw-ecom-dtc-shopline`

**會用到的 MCPs：** `ecpay` / `newebpay`、`ezpay-einvoice` 或 `universalec-einvoice`、`shopline`

**注意：** 發票作廢只能在「同期別」（兩個月為一期）內；跨期了必須改開折讓單。退款金額要扣掉超商取貨費才不會虧。

---

### 3.4 超商取貨付款（COD）對帳

**情境：** ECPay COD 訂單每月對帳，要把「ECPay 物流取件成功」、「ECPay 金流入帳」、「Shopline 訂單狀態」三邊對起來。

**Prompt 範例：**
```
給我這個月所有 ECPay 超商取貨付款訂單的對帳：物流取件成功的、金流入帳的、
Shopline 訂單狀態，三邊比一下，列出對不上的。
```

**會用到的 skills：** `tw-ecom-payment-ecpay`、`tw-ecom-logistics-cvs`、`tw-ecom-dtc-shopline`

**會用到的 MCPs：** `ecpay`、`ecpay-logistics`、`shopline`

**注意：** COD 的金流入帳有 T+N 工作日（依 ECPay 結算週期）；對帳要把「未到帳但已取件」的訂單獨立列。

---

### 3.5 冷鏈商品出貨規劃

**情境：** 生鮮 / 冷凍商品要規劃出貨流程，包含 CVS 取貨限制、保冷劑、保鮮期 SLA。

**Prompt 範例：**
```
我要賣冷凍水餃，幫我規劃：能不能走超商取貨（哪幾家有冷凍）、要不要走黑貓低溫、
保冷劑跟乾冰怎麼用、保鮮期 SLA 該怎麼訂。
```

**會用到的 skills：** `tw-ecom-logistics-cold-chain`、`tw-ecom-logistics-cvs`、`tw-ecom-logistics-home`

**會用到的 MCPs：** 無（規劃階段，沒實際呼叫物流商）

**注意：** 7-11 賣貨便不收冷凍，全家有冷凍店配（量少時限制多）；黑貓低溫宅急便分冷藏 / 冷凍兩規格，溫層錯了會被拒收。

---

## 4. 金流

### 4.1 金流選型：ECPay / NewebPay / TapPay / JKOPay 怎麼選

**情境：** 新店要選金流商，需要根據商業模式（一次性、訂閱、app）、抽成、結算週期、技術整合難度做決定。

**Prompt 範例：**
```
我們要做訂閱制美容保養盒（每月扣款），月營收估 200 萬。幫我比較 ECPay、
NewebPay、TapPay 哪一家適合做定期定額 + 信用卡分期，列抽成、結算週期、整合難度。
```

**會用到的 skills：** `tw-ecom-payment-ecpay`、`tw-ecom-payment-newebpay`、`tw-ecom-payment-tappay`、`tw-ecom-payment-jkopay`、`tw-ecom-channel-strategy`

**會用到的 MCPs：** 無（選型階段）

**注意：** NewebPay 把線上一次性（NDNF）跟定期定額（NDNP）拆兩個 merchant 帳號；TapPay 有 TCS tokenization 適合 SaaS 訂閱；JKOPay 適合 app 內掃碼 + JKO 幣回饋場景。

---

### 4.2 Callback 簽章驗證除錯

**情境：** ECPay / NewebPay callback 收到了但驗章失敗，或重複觸發。

**Prompt 範例：**
```
我們 ECPay callback 偶爾收到重複 callback 導致訂單狀態被覆蓋。幫我檢查
CheckMacValue 的驗證邏輯，包含 URL encode、排序、SHA256，告訴我哪一步可能錯了。
```

**會用到的 skills：** `tw-ecom-payment-ecpay`（CheckMacValue）、`tw-ecom-payment-newebpay`（AES+SHA256）

**會用到的 MCPs：** `ecpay` 或 `newebpay`（驗證實際 callback payload）

**注意：** ECPay 的 `CheckMacValue` 演算法雖然標準，但 URL encode 規則跟 PHP `urlencode` 有差異（保留 `-`、`_`、`.`、`!`、`*`、`(`、`)` 不轉），這是最常見坑點。Skill 內有規範實作，不要自己重寫。

---

### 4.3 信用卡退款 + 跨期折讓

**情境：** 客人 7 天內申請退款，發票已開且跨了兩個月期別，要走折讓單而非作廢。

**Prompt 範例：**
```
這筆 5 月開的發票，客人 7 月要退款。幫我規劃信用卡退款（ECPay 信用卡退刷）+
折讓單開立（不能用作廢因為跨期了）+ Shopline 訂單收款狀態調整，順序給我。
```

**會用到的 skills：** `tw-ecom-payment-ecpay`、`tw-ecom-invoice-void`（折讓段）、`tw-ecom-compliance-consumer`

**會用到的 MCPs：** `ecpay`、`ezpay-einvoice` 或 `universalec-einvoice`、`shopline`

**注意：** ECPay 信用卡退刷有「同卡」限制（要退到原卡）；折讓單金額 = 退款金額（含稅），不是未稅。

---

### 4.4 信用卡爭議（chargeback）證據包

**情境：** 收到發卡行 chargeback 通知，需要在期限內備好證據包反駁。

**Prompt 範例：**
```
ECPay 通知我們有筆訂單 chargeback（理由：未授權交易）。幫我整理證據包：
3DS 驗證紀錄、出貨追蹤、客人簽收、客服往來，並寫一份回覆範本。
```

**會用到的 skills：** `tw-ecom-payment-dispute`、`tw-ecom-payment-ecpay`、`tw-ecom-payment-tappay`（3DS 2.0）

**會用到的 MCPs：** `ecpay`、`shopline`

**注意：** Chargeback 回覆有期限（通常 acquirer 給 7-14 天），錯過視同接受；證據要包含 IP、3DS 結果、出貨憑證、簽收照、客服紀錄。

---

## 5. 發票

### 5.1 出貨後 48 小時內開立 B2C 雲端發票

**情境：** 系統要自動在訂單「出貨完成」事件後 48 小時內開立 B2C 雲端發票（不是訂單成立就開）。

**Prompt 範例：**
```
我們現在是訂單成立就開發票，常常退貨後要作廢。幫我改成「出貨完成才開」的
流程，包含 Shopline webhook 觸發點、ezPay 開立 API 呼叫、開立失敗的 retry。
```

**會用到的 skills：** `tw-ecom-invoice-ezpay`、`tw-ecom-dtc-shopline`

**會用到的 MCPs：** `ezpay-einvoice`、`shopline`

**注意：** 出貨後 48 小時內開立是財政部規範；訂單成立就開等於把作廢 / 折讓的風險疊到自己身上。雲端發票要把「字軌號碼」交給財政部分發，不是商家自己生成。

---

### 5.2 載具開立（手機條碼 / 自然人 / 會員 / 捐贈碼）

**情境：** 結帳頁要支援四種載具選項，每種驗證規則不同。

**Prompt 範例：**
```
幫我做結帳頁的載具選擇 UI + 驗證邏輯：手機條碼（/ 開頭共 8 碼）、自然人憑證
（2 碼英文大寫 + 14 碼數字）、會員載具、捐贈碼（3-7 碼）。每種錯誤訊息給我寫好。
```

**會用到的 skills：** `tw-ecom-invoice-carrier`

**會用到的 MCPs：** `ezpay-einvoice`（送載具一起開立）

**注意：** 手機條碼正則：`^/[A-Z0-9.+-]{7}$`；自然人憑證 16 碼是「英文 2 碼 + 數字 14 碼」；會員載具要去財政部備查的會員載具系統登記過。

---

### 5.3 跨期作廢 → 折讓自動轉換

**情境：** 系統要判斷退款發生時，發票是同期可作廢還是跨期須折讓，自動走對的流程。

**Prompt 範例：**
```
退款時的發票處理常常搞錯。幫我寫一段邏輯：判斷發票開立日 vs 退款日是否同期
（兩個月為一期），同期作廢、跨期折讓，自動呼叫 ezPay 對應 API。
```

**會用到的 skills：** `tw-ecom-invoice-void`

**會用到的 MCPs：** `ezpay-einvoice` 或 `universalec-einvoice`

**注意：** 期別 = 1-2月、3-4月、5-6月、7-8月、9-10月、11-12月。跨期作廢被財政部退件。

---

### 5.4 B2B 三聯式 + 統編驗證

**情境：** B2B 客戶結帳時輸入統一編號，要驗證統編格式 + 即時查公司名稱填入抬頭。

**Prompt 範例：**
```
B2B 結帳要支援統編 + 公司抬頭。幫我加：統編 checksum 驗證、抬頭即時帶入
（用財政部或 g0v 統編查詢）、三聯式發票字軌設定（要跟 B2C 二聯式分開）。
```

**會用到的 skills：** `tw-ecom-invoice-ezpay`、`tw-ecom-invoice-universalec`

**會用到的 MCPs：** `ezpay-einvoice` 或 `universalec-einvoice`

**注意：** 統編 8 碼 checksum 演算法有 2 種版本（2023 起新版），新公司可能跑舊版會誤判；抬頭查詢可用 g0v 的「台灣公司資料」open data。

---

## 6. 定價 / 促銷

### 6.1 單品建議售價（含稅、平台費、安全毛利）

**情境：** 要上一個新 SKU，需要算出含稅售價、扣掉平台抽成 / 物流費 / 金流費後的實收，確認毛利不破底。

**Prompt 範例：**
```
這款商品成本 NT$ 380，在 Shopline / 蝦皮 / momo 三邊上架。幫我算各通路的
建議含稅售價（毛利 30% 為目標）、扣完平台抽成跟物流費後的實收、最低安全價。
```

**會用到的 skills：** `tw-ecom-operations-pricing`、`tw-ecom-marketplace-shopee`、`tw-ecom-marketplace-momo`、`tw-ecom-dtc-shopline`

**會用到的 MCPs：** 無（試算階段）

**注意：** 台灣電商價格通常以 0/8/9 結尾（心理價）；momo 有強制最低價條款，DTC 價格不能低於 momo。

---

### 6.2 雙 11 / 雙 12 檔期規劃 + ROI 預估

**情境：** 檔期前一個月開始規劃選品、折扣、滿額門檻、預算分配。

**Prompt 範例：**
```
雙 11 還有一個月，幫我規劃檔期：哪些商品適合主推（高毛利 / 高庫存）、滿額
門檻怎麼設、廣告預算怎麼分（Shopee 廣告 + LINE OA broadcast + GA4 追蹤）、
ROI 怎麼預估。
```

**會用到的 skills：** `tw-ecom-operations-promotion`、`tw-ecom-operations-pricing`、`tw-ecom-operations-line-oa`、`tw-ecom-analytics-benchmarks`、`tw-ecom-analytics-ga4`

**會用到的 MCPs：** `shopline`（檔期商品設定）

**注意：** 雙 11 / 雙 12 / 年中慶 / 母親節 是台灣四大檔期；蝦皮的 11.11 跟 momo 的雙 11 規則不同，蝦皮要報名活動、momo 是強制比價。

---

### 6.3 滯銷品折扣清庫存策略

**情境：** 倉庫有一批滯銷 6 個月以上的商品，要用折扣 + 加購 + 組合包清掉。

**Prompt 範例：**
```
這批滯銷品在倉庫 6 個月以上，幫我規劃清庫存：折扣多少不會破毛利底線、要不
要包成福袋 / 加購品、要不要在哪個檔期出、文案怎麼寫不傷品牌。
```

**會用到的 skills：** `tw-ecom-operations-promotion`、`tw-ecom-operations-pricing`、`tw-ecom-analytics-benchmarks`

**會用到的 MCPs：** `shopline`（取得歷史銷售）

**注意：** 福袋 / 組合包要重新開 SKU，不能用原 SKU 變相降價（被檢舉「先漲再折」會被消保處罰款）。

---

### 6.4 跨通路 price parity 檢查

**情境：** DTC + 蝦皮 + momo 三邊上架同個 SKU，要定期檢查價格沒違反 momo 比價條款。

**Prompt 範例：**
```
我們在 DTC + 蝦皮 + momo 上同個 SKU。幫我每週對一次價，列出哪些 SKU 在
momo 比其他通路貴（會違反 momo 條款），給我調價建議。
```

**會用到的 skills：** `tw-ecom-operations-pricing`、`tw-ecom-marketplace-momo`、`tw-ecom-marketplace-shopee`、`tw-ecom-dtc-shopline`

**會用到的 MCPs：** `shopline`（DTC 端取價）

**注意：** Marketplace 端的價格取得目前要靠 vendor portal 或人工巡（plugin 沒有直接 marketplace 商品價 MCP）；先建立週期任務、報表化。

---

## 7. 客服 / CRM

### 7.1 客服回覆草稿（含訂單 + 物流 + 政策 context）

**情境：** 客人來信問「我的訂單為什麼還沒到」，客服要在回覆前先撈訂單狀態 + 物流追蹤 + 客服歷史 + 政策資料庫，產出草稿後人工確認。

**Prompt 範例：**
```
客人來信：「ORD-12345 我下單一週了還沒收到」。幫我撈訂單狀態、出貨單號、
物流即時進度、過去客服紀錄，產一份回覆草稿（語氣親切、說明預計到貨時間、
若延遲提供補償方案）。
```

**會用到的 skills：** `tw-ecom-operations-customer-service`、`tw-ecom-dtc-shopline`、`tw-ecom-logistics-home`

**會用到的 MCPs：** `shopline`、`kerry-tj` / `hct-logistics` / `sf-express`（依物流商）

**注意：** Plugin 提供原料（資料 + 政策 skill），不直接幫你寄信。回覆內容若涉及退款 / 補償，需走 4.x 退款流程而非單純客服回覆。

---

### 7.2 LINE OA 標籤分群 + broadcast

**情境：** 要根據顧客行為（買過 vs 沒買過、A 類商品 vs B 類商品、回購頻率）打標籤，再發針對性 broadcast。

**Prompt 範例：**
```
我要做 LINE OA broadcast：對「過去 90 天買過保健類但 60 天沒回購」的客人
推回購券。幫我規劃標籤策略、broadcast 文案、發送時間（避開週末晚上 9 點後）、
追蹤 ROI 怎麼設。
```

**會用到的 skills：** `tw-ecom-operations-line-oa`、`tw-ecom-analytics-ga4`、`tw-ecom-compliance-pdpa`

**會用到的 MCPs：** `shopline`（取客戶訂單歷史）

**注意：** LINE OA broadcast 按推播數計費，分群越窄越省；發推播給未明確同意行銷的會員違反 PDPA，要先確認 consent。

---

### 7.3 負評 / PTT / Dcard 監控應對

**情境：** PTT / Dcard 出現負評，要決定該回應、私下聯絡、還是不回應。

**Prompt 範例：**
```
PTT 出現一篇我們品牌的負評文：客人說出貨延遲又難客服。幫我分析該怎麼處理：
要不要公開回應、要不要私訊客人、回應的話文案要怎麼寫不失分。
```

**會用到的 skills：** `tw-ecom-operations-customer-service`

**會用到的 MCPs：** 無

**注意：** PTT 公開回應有「業配」標籤義務；Dcard 多數情況私訊比公開回應有效。Skill 內有 SOP。

---

### 7.4 7 天鑑賞期 SOP

**情境：** 客服常常被問鑑賞期，要有一套標準回覆 + 流程。

**Prompt 範例：**
```
幫我寫客服的「7 天鑑賞期」標準 SOP：哪些商品適用、哪些不適用、客人主張時
怎麼處理、退貨後金流跟發票要怎麼跑。
```

**會用到的 skills：** `tw-ecom-compliance-consumer`、`tw-ecom-operations-customer-service`、`tw-ecom-invoice-void`、`tw-ecom-payment-ecpay`

**會用到的 MCPs：** 無（SOP 階段）

**注意：** 「猶豫期」7 天從「收貨日」起算，不是訂購日；客製、生鮮、開封數位內容、報紙、影音商品 是例外。

---

## 8. 合規

### 8.1 PDPA：DSAR 處理流程

**情境：** 客人寄信來主張「個資存取請求」（DSAR），要在法定 30 天內回覆。

**Prompt 範例：**
```
收到一封客人 DSAR 信，要求查看我們保存的所有他的個資。幫我規劃處理流程：
30 天時限怎麼算、要回什麼欄位、Shopline / LINE OA / 客服紀錄都要撈、
回覆格式範本。
```

**會用到的 skills：** `tw-ecom-compliance-pdpa`

**會用到的 MCPs：** `shopline`、視 LINE OA 系統而定

**注意：** PDPA 的 DSAR 期限是「30 天內回覆，必要時可延長 30 天但需通知當事人」；查詢工本費可收但有上限。

---

### 8.2 個資跨境傳輸

**情境：** 用海外雲服務（AWS Singapore、Vercel global）會涉及個資跨境，要評估合規。

**Prompt 範例：**
```
我們用 Vercel 跑前端、Supabase（新加坡）存資料庫。幫我評估 PDPA 跨境傳輸
合規：要不要做跨境傳輸告知、會員條款要怎麼寫、有沒有風險產業限制。
```

**會用到的 skills：** `tw-ecom-compliance-pdpa`、`tw-ecom-compliance-cross-border`

**會用到的 MCPs：** 無

**注意：** 經濟部公告的「特定產業 + 特定國家」有跨境傳輸限制（例如金融業 → 中國大陸）；一般電商 → 新加坡 AWS / GCP 沒問題但要在隱私政策揭露。

---

### 8.3 跨境境外電商營業稅登記評估

**情境：** 海外品牌賣到台灣，年銷超過門檻必須在台辦稅籍登記。

**Prompt 範例：**
```
我們是日本品牌，去年賣到台灣約 NT$ 800 萬。幫我評估要不要在台灣辦境外電商
營業稅登記、流程是什麼、發票要不要在台開、退稅怎麼處理。
```

**會用到的 skills：** `tw-ecom-compliance-cross-border`

**會用到的 MCPs：** 無

**注意：** 境外電商銷售勞務 / 商品給台灣個人，年銷售額超過 NT$ 480,000 必須辦稅籍登記並開立電子發票。

---

## 9. 分析

### 9.1 GA4 Enhanced Ecommerce + BigQuery 對接

**情境：** 要把 Shopline / 91APP 的事件導進 GA4，啟用 BigQuery export 做後續報表。

**Prompt 範例：**
```
幫我規劃 Shopline 的 GA4 串接：Enhanced Ecommerce 事件（view_item、
add_to_cart、begin_checkout、purchase）的參數要怎麼填（含稅 vs 未稅
revenue、NT$ currency code、統編當 user property）、BigQuery export 開啟。
```

**會用到的 skills：** `tw-ecom-analytics-ga4`、`tw-ecom-dtc-shopline`

**會用到的 MCPs：** `shopline`

**注意：** GA4 的 `value` 預設是「含稅」還是「未稅」要在實作層明確（plugin 的 skill 預設含稅）；BigQuery export 有每日免費額度但跨境查詢會跨區收費。

---

### 9.2 Vertical / 通路 benchmark 比對

**情境：** 想知道自己品牌的 CVR / ROAS / LTV 在同業裡是高是低。

**Prompt 範例：**
```
我們做美妝 DTC，過去 90 天 CVR 1.8%、ROAS 3.2、平均 AOV NT$ 1,200、
30 天 repeat rate 18%。幫我比一下台灣美妝 DTC 的 benchmark，哪些是好哪些
是該補的，給我下一步建議。
```

**會用到的 skills：** `tw-ecom-analytics-benchmarks`、`tw-ecom-analytics-ga4`

**會用到的 MCPs：** 無（純對比）

**注意：** Benchmark 是參考值不是 KPI；不同 vertical（3C / 美妝 / 服飾 / 母嬰 / 生鮮）跟通路（DTC / 蝦皮 / momo）差異很大。

---

### 9.3 LINE OA × 訂單回購歸因

**情境：** 想知道 LINE OA broadcast 對回購率的影響。

**Prompt 範例：**
```
過去 3 個月發了 12 次 LINE OA broadcast，幫我算每次推播的：開封率、點擊率、
推播後 7 天內回購的客人數、回購金額，給我哪幾類 broadcast 最有效。
```

**會用到的 skills：** `tw-ecom-operations-line-oa`、`tw-ecom-analytics-ga4`

**會用到的 MCPs：** `shopline`（取訂單）

**注意：** LINE OA 的點擊歸因要在 broadcast 連結帶 UTM；沒帶 UTM 的歷史 broadcast 沒辦法事後歸因。

---

## 10. 延伸：在 agent-first 後台之上

Plugin 直接服務「單次任務 / 單次規劃 / 單次除錯」場景。如果你要把它擺進一個多店、多品牌、有 agent team 治理需求的後台產品（類似多店治理後台的規劃），Plugin 的 29 skills + 12 MCPs 會是底下的 building blocks，但上層還需要自己建：

- **StoreFront / 多店 entitlement** — Plugin 不管「使用者能存取哪幾間店」；上層後台要管 RBAC + StoreFront scope。
- **Agent runtime / task queue / human approval** — Plugin 是 skill + MCP，不是 agent runtime；中高風險操作（送出改價、送出 campaign、送出財務拋轉）要由上層平台跑審核流程。
- **資料中台 / Webhook receiver / reconciliation** — Plugin 的 MCP 是按需查詢，不負責把 Shopline / ECPay webhook event 持續化、去重、重試；那是上層中台責任。
- **AgentOps / trace / cost / audit log** — Plugin 不負責 agent 任務紀錄、tool call log、成本監控；上層平台要自己建 observability 層。
- **跨通路庫存同步引擎** — Plugin 能讀單通路庫存，但跨通路同步策略（Shopline ↔ Shopee ↔ momo）要上層自己寫。
- **企業財務拋轉（Oracle FA Fusion / SAP）** — Plugin 含發票與對帳的元件，不含 ERP 拋轉。

把這幾層蓋好，本 plugin 提供的 29 skills + 12 MCPs 就可以撐起一個 agent-first 的台灣電商營運後台的「**領域知識層**」與「**對外整合層**」。
