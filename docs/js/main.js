// tw-ecommerce-majordomo — main.js
// All interactive behavior.

(() => {
  'use strict';

  // --- Nav: sticky blur on scroll ---
  const nav = document.getElementById('site-nav');
  const onScroll = () => {
    if (window.scrollY > 24) {
      nav.classList.add('bg-navy-900/90', 'backdrop-blur', 'border-b', 'border-line');
    } else {
      nav.classList.remove('bg-navy-900/90', 'backdrop-blur', 'border-b', 'border-line');
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // --- Nav: mobile toggle ---
  const toggle = document.getElementById('nav-toggle');
  const mobile = document.getElementById('nav-mobile');
  toggle.addEventListener('click', () => {
    const isOpen = !mobile.classList.contains('hidden');
    mobile.classList.toggle('hidden');
    toggle.setAttribute('aria-expanded', String(!isOpen));
  });
  mobile.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    mobile.classList.add('hidden');
    toggle.setAttribute('aria-expanded', 'false');
  }));
})();

// --- Use case walkthrough ---
(() => {
  'use strict';
  const data = window.USE_CASE;
  if (!data) return;

  const summaryEl = document.getElementById('case-summary');
  const stepsEl = document.getElementById('case-steps');
  const closingEl = document.getElementById('case-closing');

  summaryEl.textContent = data.caseSummary;
  closingEl.textContent = data.closingNote;

  data.steps.forEach((step, i) => {
    const isFirst = i === 0;
    const wrapper = document.createElement('div');
    wrapper.className = 'border-l-2 border-line pl-8 relative';
    wrapper.innerHTML = `
      <div class="absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-gold-500 ${isFirst ? 'bg-gold-500' : 'bg-navy-900'}" data-dot></div>
      <button class="w-full text-left py-4 flex items-start gap-4 group" aria-expanded="${isFirst}" data-toggle>
        <div class="shrink-0 text-xs font-mono text-gold-500 mt-1 w-20">${step.range}</div>
        <div class="flex-1">
          <div class="font-display text-xl md:text-2xl font-semibold text-gold-100 group-hover:text-gold-500 transition">
            Step ${i + 1}｜${step.title}
          </div>
        </div>
        <div class="shrink-0 text-gold-500 transition-transform ${isFirst ? 'rotate-180' : ''}" data-chevron>
          <svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path d="M5 7l5 5 5-5" stroke="currentColor" stroke-width="2" fill="none"/></svg>
        </div>
      </button>
      <div class="overflow-hidden transition-all duration-300 ease-out ${isFirst ? 'max-h-[3000px]' : 'max-h-0'}" data-panel>
        <div class="pb-8 grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
          <div>
            <div class="text-xs tracking-wider text-navy-300 mb-2">頭家打的指令</div>
            <div class="p-4 bg-navy-800 border-l-2 border-asgard-500 font-mono text-sm text-asgard-400 leading-relaxed">${step.command}</div>
          </div>
          <div>
            <div class="text-xs tracking-wider text-navy-300 mb-2">majordomo 做了什麼</div>
            <ul class="space-y-2 text-sm text-gold-100 leading-relaxed">
              ${step.response.map(r => `<li class="flex gap-2"><span class="text-gold-500 shrink-0">·</span><span>${r}</span></li>`).join('')}
            </ul>
          </div>
          <div>
            <div class="text-xs tracking-wider text-navy-300 mb-2">用到的 Skill</div>
            <div class="flex flex-wrap gap-2 mb-4">
              ${step.skills.map(s => `<span class="font-mono text-xs text-asgard-400 bg-navy-800 px-2 py-1">${s}</span>`).join('')}
            </div>
            ${step.mcps && step.mcps.length ? `
            <div class="text-xs tracking-wider text-navy-300 mb-2">用到的 MCP</div>
            <div class="flex flex-wrap gap-2">
              ${step.mcps.map(m => `<span class="font-mono text-xs text-gold-400 bg-navy-800 px-2 py-1 border border-gold-500/40">${m}</span>`).join('')}
            </div>` : ''}
          </div>
        </div>
      </div>
    `;
    stepsEl.appendChild(wrapper);
  });

  stepsEl.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-toggle]');
    if (!btn) return;
    const wrapper = btn.parentElement;
    const panel = wrapper.querySelector('[data-panel]');
    const dot = wrapper.querySelector('[data-dot]');
    const chevron = btn.querySelector('[data-chevron]');
    const isOpen = btn.getAttribute('aria-expanded') === 'true';

    stepsEl.querySelectorAll('[data-toggle]').forEach(b => {
      b.setAttribute('aria-expanded', 'false');
      const w = b.parentElement;
      const p = w.querySelector('[data-panel]');
      p.classList.add('max-h-0');
      p.classList.remove('max-h-[3000px]');
      const d = w.querySelector('[data-dot]');
      d.classList.remove('bg-gold-500');
      d.classList.add('bg-navy-900');
      b.querySelector('[data-chevron]').classList.remove('rotate-180');
    });

    if (!isOpen) {
      btn.setAttribute('aria-expanded', 'true');
      panel.classList.remove('max-h-0');
      panel.classList.add('max-h-[3000px]');
      dot.classList.add('bg-gold-500');
      dot.classList.remove('bg-navy-900');
      chevron.classList.add('rotate-180');
    }
  });
})();

// --- Scenarios tabs ---
(() => {
  'use strict';
  const SCENARIOS = {
    order: {
      scenario: '訂單卡在「付款失敗」、「重複付款」，要快速判斷是金流、平台同步哪一邊出問題。',
      pipeline: ['tw-ecom-payment-ecpay', 'tw-ecom-dtc-shopline', 'tw-ecom-payment-dispute'],
      mcps: ['ecpay', 'shopline'],
      outputs: ['ECPay 授權結果查詢', 'Shopline 訂單狀態比對', '掉單環節定位', '重複 callback 去重檢查', '客人補救 SOP'],
    },
    refund: {
      scenario: '客人退貨：金流退、發票作廢還是折讓、訂單狀態怎麼更新，順序給我。',
      pipeline: ['tw-ecom-payment-ecpay', 'tw-ecom-invoice-void', 'tw-ecom-compliance-consumer', 'tw-ecom-dtc-shopline'],
      mcps: ['ecpay', 'ezpay-einvoice', 'shopline'],
      outputs: ['信用卡退刷請求', '同期作廢 vs 跨期折讓判斷', '消保法鑑賞期條款應用', 'Shopline 訂單狀態更新', '退款金額計算 (扣超商取貨費)'],
    },
    '11.11': {
      scenario: '雙 11 還有一個月，選品 + 滿額門檻 + 廣告預算 + ROI 預估，一次規劃。',
      pipeline: ['tw-ecom-operations-promotion', 'tw-ecom-operations-pricing', 'tw-ecom-operations-line-oa', 'tw-ecom-analytics-benchmarks', 'tw-ecom-analytics-ga4'],
      mcps: ['shopline'],
      outputs: ['主推 SKU 名單 (高毛利 × 高庫存)', '滿額門檻試算', '廣告預算分配 (Shopee + LINE OA)', 'GA4 追蹤埋點', 'ROI 預估與底線價'],
    },
    cs: {
      scenario: '客人來信問訂單為何沒到，要在回覆前撈訂單 + 物流 + 客服歷史 + 政策。',
      pipeline: ['tw-ecom-operations-customer-service', 'tw-ecom-dtc-shopline', 'tw-ecom-logistics-home'],
      mcps: ['shopline', 'kerry-tj', 'hct-logistics', 'sf-express'],
      outputs: ['訂單狀態與出貨單號', '物流即時進度', '過去客服紀錄整合', '回覆草稿 (語氣 + 補償方案)', '逾期補救 SOP'],
    },
    pdpa: {
      scenario: '收到客人 DSAR 個資存取請求，法定 30 天內回覆，要撈所有系統的個資。',
      pipeline: ['tw-ecom-compliance-pdpa'],
      mcps: ['shopline'],
      outputs: ['30 天時限算法', 'Shopline 個資欄位清單', 'LINE OA / 客服紀錄整合', 'DSAR 回覆格式範本', '工本費收取上限'],
    },
  };

  const panelsEl = document.getElementById('sc-panels');
  const tabs = document.querySelectorAll('[data-sc]');

  function render(key) {
    const sc = SCENARIOS[key];
    panelsEl.innerHTML = `
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div>
          <div class="text-xs tracking-wider text-gold-600 mb-2">情境</div>
          <p class="font-display text-xl text-ink leading-relaxed mb-8">${sc.scenario}</p>
          <div class="text-xs tracking-wider text-gold-600 mb-3">Skill Pipeline</div>
          <div class="flex flex-wrap items-center gap-2 mb-6">
            ${sc.pipeline.map((s, i) => `
              <span class="font-mono text-xs text-asgard-600 bg-white px-3 py-2 border border-asgard-500/30">${s}</span>
              ${i < sc.pipeline.length - 1 ? '<span class="text-navy-300">→</span>' : ''}
            `).join('')}
          </div>
          <div class="text-xs tracking-wider text-gold-600 mb-3">會呼叫的 MCP</div>
          <div class="flex flex-wrap gap-2">
            ${sc.mcps.map(m => `<span class="font-mono text-xs text-gold-700 bg-cream px-3 py-2 border border-gold-500/50">${m}</span>`).join('')}
          </div>
        </div>
        <div>
          <div class="text-xs tracking-wider text-gold-600 mb-3">預期輸出物</div>
          <ul class="space-y-3">
            ${sc.outputs.map(o => `<li class="flex gap-3 text-ink"><span class="text-gold-600 mt-0.5">✓</span><span>${o}</span></li>`).join('')}
          </ul>
        </div>
      </div>
    `;
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => {
        t.setAttribute('aria-selected', 'false');
        t.classList.remove('border-gold-500', 'text-navy-900');
        t.classList.add('border-transparent', 'text-navy-700');
      });
      tab.setAttribute('aria-selected', 'true');
      tab.classList.add('border-gold-500', 'text-navy-900');
      tab.classList.remove('border-transparent', 'text-navy-700');
      render(tab.dataset.sc);
    });
  });

  render('order');
})();

// --- Inventory (skills + MCPs) + filter ---
(() => {
  'use strict';

  // 29 skills + 12 MCPs
  const INVENTORY = [
    // Payment skills (5)
    { slug: 'tw-ecom-payment-ecpay', title: 'ECPay 綠界', desc: 'AllInOne API、CheckMacValue 驗章、3DS、信用卡退刷、ATM/超商代碼/COD', cat: 'payment' },
    { slug: 'tw-ecom-payment-newebpay', title: 'NewebPay 藍新', desc: 'NDNF 線上一次性 + NDNP 定期定額兩個 merchant，AES+SHA256 加解密', cat: 'payment' },
    { slug: 'tw-ecom-payment-jkopay', title: 'JKO Pay 街口', desc: 'app 內掃碼 + JKO 幣回饋，適合 app 內金流場景', cat: 'payment' },
    { slug: 'tw-ecom-payment-tappay', title: 'TapPay', desc: 'TCS tokenization、3DS 2.0、SaaS 訂閱與 app 場景首選', cat: 'payment' },
    { slug: 'tw-ecom-payment-dispute', title: '信用卡 Dispute', desc: 'Chargeback 證據包：3DS 紀錄、出貨追蹤、客人簽收、客服往來', cat: 'payment' },
    // Logistics skills (4)
    { slug: 'tw-ecom-logistics-cvs', title: '超商取貨', desc: '7-11 賣貨便 + 全家、ECPay 物流綁定、COD 流程', cat: 'logistics' },
    { slug: 'tw-ecom-logistics-home', title: '宅配 (黑貓/嘉里/新竹/順豐/郵局)', desc: '溫層分流、單號回填、SLA 與對帳檔處理', cat: 'logistics' },
    { slug: 'tw-ecom-logistics-cold-chain', title: '冷鏈物流', desc: '生鮮/冷凍出貨、保冷劑與乾冰使用、保鮮期 SLA', cat: 'logistics' },
    { slug: 'tw-ecom-logistics-cross-border', title: '跨境物流', desc: 'DHL/FedEx/UPS/郵局國際、報關、DDP vs DDU', cat: 'logistics' },
    // Invoice skills (4)
    { slug: 'tw-ecom-invoice-ezpay', title: 'ezPay 雲端發票', desc: '出貨後 48 小時內開立、字軌號碼分發、開立失敗 retry', cat: 'invoice' },
    { slug: 'tw-ecom-invoice-universalec', title: 'Universal-EC 發票', desc: 'B2B 三聯式、統編 checksum 驗證、抬頭即時帶入', cat: 'invoice' },
    { slug: 'tw-ecom-invoice-carrier', title: '載具 (手機條碼/自然人/捐贈)', desc: '四種載具驗證規則 + 結帳頁 UI 邏輯', cat: 'invoice' },
    { slug: 'tw-ecom-invoice-void', title: '作廢 / 折讓判斷', desc: '同期作廢、跨期折讓自動轉換邏輯', cat: 'invoice' },
    // DTC skills (3)
    { slug: 'tw-ecom-dtc-shopline', title: 'Shopline', desc: '訂單 webhook、商品上架、會員、金物流發票完整串接', cat: 'dtc' },
    { slug: 'tw-ecom-dtc-91app', title: '91APP', desc: '私有 MCP、訂單管理、會員 + 行銷整合', cat: 'dtc' },
    { slug: 'tw-ecom-dtc-shopify-localization', title: 'Shopify 在地化', desc: '台灣金流 app 整合、繁中、發票串接', cat: 'dtc' },
    // Marketplace skills (2)
    { slug: 'tw-ecom-marketplace-shopee', title: '蝦皮 Shopee', desc: '上架審核、11.11 報名活動、SIP 跨境計畫、價格機制', cat: 'marketplace' },
    { slug: 'tw-ecom-marketplace-momo', title: 'momo', desc: '上架審核、best-price 強制比價條款、抽成計算', cat: 'marketplace' },
    // Compliance skills (4)
    { slug: 'tw-ecom-compliance-consumer', title: '消保法 / 鑑賞期', desc: '7 天鑑賞期、例外品揭露、退款扣費規則', cat: 'compliance' },
    { slug: 'tw-ecom-compliance-pdpa', title: 'PDPA 個資法', desc: 'DSAR 30 天回覆、跨境傳輸告知、會員 consent', cat: 'compliance' },
    { slug: 'tw-ecom-compliance-product', title: '商品法規', desc: '食安法、化妝品登錄、健康食品 vs 保健食品、菸酒', cat: 'compliance' },
    { slug: 'tw-ecom-compliance-cross-border', title: '跨境合規', desc: '境外電商營業稅、稅籍登記、發票本地化', cat: 'compliance' },
    // Operations skills (4)
    { slug: 'tw-ecom-operations-customer-service', title: '客服 / CS', desc: '客服回覆 SOP、負評應對 (PTT/Dcard)、7 天鑑賞期 SOP', cat: 'operations' },
    { slug: 'tw-ecom-operations-line-oa', title: 'LINE OA', desc: '標籤分群、broadcast、ROI 追蹤、PDPA consent 檢查', cat: 'operations' },
    { slug: 'tw-ecom-operations-pricing', title: '定價策略', desc: '含稅售價、平台抽成、毛利底線、跨通路 price parity', cat: 'operations' },
    { slug: 'tw-ecom-operations-promotion', title: '促銷 / 檔期', desc: '雙 11 / 雙 12 / 母親節、滿額門檻、清庫存策略', cat: 'operations' },
    // Analytics skills (2)
    { slug: 'tw-ecom-analytics-ga4', title: 'GA4 Enhanced Ecommerce', desc: 'Shopline/91app 事件埋點、含稅 revenue、BigQuery export', cat: 'analytics' },
    { slug: 'tw-ecom-analytics-benchmarks', title: '台灣電商 Benchmark', desc: 'CVR / ROAS / AOV / repeat rate by vertical × channel', cat: 'analytics' },
    // Channel strategy (1)
    { slug: 'tw-ecom-channel-strategy', title: '通路策略', desc: 'DTC vs Marketplace 選型、Hybrid、跨境品牌進台灣', cat: 'operations' },

    // MCPs (12)
    { slug: 'ecpay', title: 'MCP · ECPay', desc: '金流：信用卡、ATM、超商代碼授權與退刷', cat: 'mcp', isMcp: true },
    { slug: 'ecpay-logistics', title: 'MCP · ECPay Logistics', desc: '物流：超商門市選擇、寄件單、取件回拋', cat: 'mcp', isMcp: true },
    { slug: 'newebpay', title: 'MCP · NewebPay', desc: '金流：NDNF 一次性 + NDNP 定期定額', cat: 'mcp', isMcp: true },
    { slug: 'kerry-tj', title: 'MCP · 嘉里大榮', desc: '物流：託運單、追蹤、簽收照', cat: 'mcp', isMcp: true },
    { slug: 'hct-logistics', title: 'MCP · 新竹物流', desc: '物流：託運、追蹤、對帳', cat: 'mcp', isMcp: true },
    { slug: 'sf-express', title: 'MCP · 順豐', desc: '物流：OAuth2、託運、追蹤、跨境', cat: 'mcp', isMcp: true },
    { slug: 'shopline', title: 'MCP · Shopline', desc: 'DTC：訂單、商品、會員、webhook', cat: 'mcp', isMcp: true },
    { slug: '91app', title: 'MCP · 91APP', desc: 'DTC：訂單/會員/金流/IMS（私有 repo）', cat: 'mcp', isMcp: true },
    { slug: 'cyberbiz', title: 'MCP · Cyberbiz', desc: 'DTC：訂單、商品、會員（私有 repo）', cat: 'mcp', isMcp: true },
    { slug: 'buy123-vendor', title: 'MCP · Buy123 Vendor', desc: 'Marketplace vendor portal 整合', cat: 'mcp', isMcp: true },
    { slug: 'ezpay-einvoice', title: 'MCP · ezPay 發票', desc: 'B2B/B2C 開立、作廢、折讓', cat: 'mcp', isMcp: true },
    { slug: 'universalec-einvoice', title: 'MCP · Universal-EC 發票', desc: 'B2B 三聯式、字軌、折讓單', cat: 'mcp', isMcp: true },
  ];

  const grid = document.getElementById('inv-cards');
  const filter = document.getElementById('inv-filter');

  grid.innerHTML = INVENTORY.map(s => `
    <div data-cat="${s.cat}" class="p-6 ${s.isMcp ? 'bg-navy-900 text-gold-100 border border-gold-500/40' : 'bg-white text-ink border border-navy-100'} transition-all duration-200">
      <div class="font-mono text-xs ${s.isMcp ? 'text-gold-400' : 'text-asgard-600'} mb-3">${s.slug}</div>
      <div class="font-display text-xl font-semibold ${s.isMcp ? 'text-gold-100' : 'text-ink'} mb-2">${s.title}</div>
      <p class="text-sm ${s.isMcp ? 'text-navy-100' : 'text-navy-700'} leading-relaxed">${s.desc}</p>
    </div>
  `).join('');

  filter.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-cat]');
    if (!btn) return;
    const cat = btn.dataset.cat;

    filter.querySelectorAll('button').forEach(b => {
      b.classList.remove('bg-navy-900', 'text-gold-100', 'border-navy-900');
      b.classList.add('bg-transparent', 'text-navy-700', 'border-navy-300');
    });
    btn.classList.add('bg-navy-900', 'text-gold-100', 'border-navy-900');
    btn.classList.remove('bg-transparent', 'text-navy-700', 'border-navy-300');

    grid.querySelectorAll('[data-cat]').forEach(card => {
      if (cat === 'all' || card.dataset.cat === cat) {
        card.classList.remove('opacity-[0.15]', 'grayscale', 'pointer-events-none');
      } else {
        card.classList.add('opacity-[0.15]', 'grayscale', 'pointer-events-none');
      }
    });
  });
})();

// --- Install tabs + copy-to-clipboard ---
(() => {
  'use strict';
  const INSTALLS = {
    claude: {
      note: '官方 marketplace。一行加 marketplace、一行安裝。',
      code: '/plugin marketplace add asgard-ai-platform/tw-ecommerce-majordomo\n/plugin install tw-ecommerce-majordomo@tw-ecommerce-majordomo',
    },
    codex: {
      note: 'CLI 內輸入 <code class="font-mono text-sm bg-navy-800 text-gold-100 px-1">/plugins</code> 進入搜尋；或在 Codex App 的 Plugins 頁面搜尋安裝。',
      code: '/plugins\n# 搜尋 "tw-ecommerce-majordomo" → Install',
    },
    cursor: {
      note: 'Cursor plugin 目前不會自動註冊 MCP servers — 把 <code class="font-mono text-sm bg-navy-800 text-gold-100 px-1">mcp.json</code> 的 mcpServers 區塊複製進 <code class="font-mono text-sm bg-navy-800 text-gold-100 px-1">~/.cursor/mcp.json</code>，或在 Cursor Settings → MCP 中加入。',
      code: 'cursor plugin add asgard-ai-platform/tw-ecommerce-majordomo',
    },
    gemini: {
      note: 'Gemini CLI extension。',
      code: 'gemini extensions install asgard-ai-platform/tw-ecommerce-majordomo',
    },
    opencode: {
      note: '在 <code class="font-mono text-sm bg-navy-800 text-gold-100 px-1">opencode.json</code>（global 或 project）加入 plugin 條目。詳見 <a href="https://github.com/asgard-ai-platform/tw-ecommerce-majordomo/blob/main/.opencode/INSTALL.md" target="_blank" rel="noopener" class="text-asgard-400 hover:text-asgard-500 underline">.opencode/INSTALL.md</a>。',
      code: '{\n  "plugin": [\n    "tw-ecommerce-majordomo@git+https://github.com/asgard-ai-platform/tw-ecommerce-majordomo.git"\n  ]\n}',
    },
    droid: {
      note: 'Factory Droid plugin marketplace。',
      code: 'droid plugin marketplace add https://github.com/asgard-ai-platform/tw-ecommerce-majordomo\ndroid plugin install tw-ecommerce-majordomo@tw-ecommerce-majordomo',
    },
  };

  const panels = document.getElementById('install-panels');
  const tabs = document.querySelectorAll('[data-inst]');

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function render(key) {
    const inst = INSTALLS[key];
    panels.innerHTML = `
      <div class="reveal is-visible">
        <p class="text-lg text-ink leading-relaxed mb-5">${inst.note}</p>
        <div class="relative">
          <pre class="bg-navy-900 p-6 pr-20 font-mono text-sm text-gold-100 leading-loose whitespace-pre-wrap overflow-x-auto" data-code>${escapeHtml(inst.code)}</pre>
          <button data-copy class="absolute top-4 right-4 px-3 py-1.5 text-xs font-semibold bg-gold-500 text-navy-900 hover:bg-gold-400 transition">Copy</button>
        </div>
      </div>
    `;
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => {
        t.setAttribute('aria-selected', 'false');
        t.classList.remove('border-gold-500', 'text-navy-900');
        t.classList.add('border-transparent', 'text-navy-700');
      });
      tab.setAttribute('aria-selected', 'true');
      tab.classList.add('border-gold-500', 'text-navy-900');
      tab.classList.remove('border-transparent', 'text-navy-700');
      render(tab.dataset.inst);
    });
  });

  render('claude');

  panels.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-copy]');
    if (!btn) return;
    const codeEl = btn.parentElement.querySelector('[data-code]');
    const code = codeEl.textContent;
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = code;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    // Cache the original label once per button so rapid re-clicks during the
    // 1500ms reset window don't capture '已複製 ✓' as the new "previous" label.
    if (btn.dataset.originalLabel === undefined) {
      btn.dataset.originalLabel = btn.textContent;
    }
    clearTimeout(btn._resetTimer);
    btn.textContent = '已複製 ✓';
    btn.classList.add('bg-gold-400');
    btn._resetTimer = setTimeout(() => {
      btn.textContent = btn.dataset.originalLabel;
      btn.classList.remove('bg-gold-400');
    }, 1500);
  });
})();

// --- Scroll reveal (IntersectionObserver) ---
(() => {
  'use strict';
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
})();
