// tw-ecommerce-majordomo — Use case walkthrough data
// Scenario: Shopline 開新店全套金物流發票串接
// Source: docs/USE-CASES.md §1.1

window.USE_CASE = {
  caseTitle: 'Shopline 開新店：金流 + 物流 + 電子發票一條龍',
  caseSummary: '客戶要在 Shopline 開新店，得同步把信用卡 / ATM / 超商代碼 / 超商取貨付款 / 黑貓 + 7-11 賣貨便 / B2C 雲端發票 + 載具全部接好。每段都有台灣特有的合規與綁定規則——這是 majordomo 一次跑完串接規劃的示範。',
  steps: [
    {
      range: '0–15 分',
      title: '排串接順序，避開綁定陷阱',
      command: '我要在 Shopline 開新店，幫我規劃金流（信用卡 + ATM + 超商代碼 + 超商取貨付款）、物流（黑貓 + 7-11 賣貨便）、電子發票（B2C 雲端發票 + 載具）的串接順序',
      response: [
        'Phase 1（先接的）：ECPay 金流 — 多支付方式同個 merchant，先把信用卡 / ATM / 超商代碼開好',
        'Phase 2（綁 Phase 1）：ECPay 物流 — 超商取貨付款（COD）必須走 ecpay + ecpay-logistics 的 combined 流程，是分開兩個 MCP',
        'Phase 3（獨立）：黑貓 / 7-11 賣貨便 — 黑貓無公開 API 走 EDI 對帳檔；賣貨便走 ECPay 物流 API',
        'Phase 4（最後）：電子發票 — 出貨/取貨後 48 小時內開立（不是訂單成立就開），開錯期會吃跨期折讓',
        '關鍵綁定：Shopline 訂單狀態 → ECPay 金流 callback → 物流出貨 → 發票開立，四段缺一個 webhook 就會掉單',
      ],
      skills: ['tw-ecom-dtc-shopline', 'tw-ecom-channel-strategy'],
      mcps: ['shopline'],
    },
    {
      range: '15–50 分',
      title: 'ECPay 金流：一次串好三種支付',
      command: '幫我把 ECPay 信用卡 + ATM + 超商代碼接進 Shopline，CheckMacValue 驗證、callback 路由、訂單狀態同步都要包好',
      response: [
        '信用卡：AllInOne API，3DS 走 PaymentInfoURL（前景）+ ReturnURL（背景），缺一個會吃 chargeback',
        'ATM：14 天虛擬帳號，過期未繳要 expire 訂單；callback PaymentType=ATM_*',
        '超商代碼：14 天條碼，金流落地點是超商不是 ECPay，callback 比 ATM 慢 1-2 工作日',
        'CheckMacValue 簽章：URL encode 規則 ≠ PHP urlencode（保留 -_.!*()），這是最常見的驗章失敗原因',
        'Skill 內已封裝簽章邏輯與 callback router 樣板，不要自己重寫',
        '測試憑證：StageMerchantID=2000132，sandbox 都通了再切正式',
      ],
      skills: ['tw-ecom-payment-ecpay'],
      mcps: ['ecpay', 'shopline'],
    },
    {
      range: '50–75 分',
      title: '物流：超商取貨付款（COD）+ 宅配',
      command: '把超商取貨付款（7-11 + 全家）+ 黑貓宅配接進來，COD 的金物流綁定特別小心',
      response: [
        '超商取貨付款 = 兩個 MCP 配合：ecpay（金流入帳）+ ecpay-logistics（門市選擇、寄件單、取件回拋）',
        'COD 入帳是 T+N 工作日（依 ECPay 結算週期），不是即時；對帳要列「已取件未到帳」缺口',
        '7-11 賣貨便：常溫專用、不收冷凍；全家有冷凍店配但限制多',
        '黑貓宅急便：無公開 API，走 EDI 對帳檔 / 收件清單上傳；plugin 提供 SLA 與單號回填樣板',
        '物流 callback → Shopline 訂單狀態：「已出貨」必須是物流商實際取件後觸發，不是後台手動點',
      ],
      skills: ['tw-ecom-logistics-cvs', 'tw-ecom-logistics-home'],
      mcps: ['ecpay-logistics', 'shopline'],
    },
    {
      range: '75–100 分',
      title: '電子發票：抓對開立時機',
      command: '電子發票要 B2C 雲端 + 載具（手機條碼 / 自然人 / 捐贈碼）+ 跨期作廢折讓邏輯，全部串好',
      response: [
        '開立時機：出貨/取貨完成後 48 小時內（財政部規範）— 走 Shopline 出貨 webhook，不是訂單成立就開',
        '訂單成立就開 = 退貨機率高的店等於在每筆退貨疊作廢風險，慢慢累積跨期折讓單',
        '載具驗證正則：手機條碼 ^/[A-Z0-9.+-]{7}$ / 自然人 2 碼英文+14 碼數字 / 捐贈碼 3-7 碼',
        '跨期作廢 → 折讓：作廢只能在同期別（兩個月為一期）內；跨期了必須改開折讓單',
        '判斷邏輯：發票開立日 vs 退款日同期 → 作廢；跨期 → 折讓。Skill 有現成決策樹',
      ],
      skills: ['tw-ecom-invoice-ezpay', 'tw-ecom-invoice-carrier', 'tw-ecom-invoice-void'],
      mcps: ['ezpay-einvoice', 'shopline'],
    },
    {
      range: '100–120 分',
      title: '上線前 callback checklist',
      command: '上線前幫我確認所有 callback 都驗過了，列一份檢查清單',
      response: [
        '[✓] ECPay 信用卡 callback：CheckMacValue 驗章、訂單狀態 idempotent（重複 callback 不會疊金額）',
        '[✓] ECPay ATM/超商代碼 callback：PaymentType 路由正確、過期單有 expire',
        '[✓] ECPay 物流 callback：取件回拋 → Shopline 訂單「已出貨」、退件回拋 → 訂單「退貨中」',
        '[✓] ezPay 發票 callback：開立成功回拋字軌號碼、開立失敗有 retry queue（不是 fire-and-forget）',
        '[✓] Shopline webhook 訂閱：order/created、order/paid、order/shipped、order/refunded 全收',
        '[!] 每段都要在 sandbox 跑一次完整流程才能切正式 — plugin 的測試 prompt 在 SKILL.md 內',
      ],
      skills: ['tw-ecom-payment-ecpay', 'tw-ecom-dtc-shopline'],
      mcps: ['ecpay', 'ecpay-logistics', 'ezpay-einvoice', 'shopline'],
    },
  ],
  closingNote: 'majordomo 把台灣電商的串接陷阱替你記在 skill 裡——剩下的，是你品牌的調性、商品的擺法、客人怎麼留住。那是頭家的事，總管不代替你決定。',
};
