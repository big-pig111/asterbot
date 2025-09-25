import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";
import Model3D from "./Model3D";

function App() {
  const [page, setPage] = useState("home");
  const [lang, setLang] = useState("en");
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [quantity, setQuantity] = useState(0.001);
  const [cycles, setCycles] = useState(10);
  const [delay, setDelay] = useState(1);

  const [taskId, setTaskId] = useState(null);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState([]);

  // i18n 简易词典
  const i18n = {
    en: {
      nav_home: "Home",
      nav_trade: "Trade",
      lang_btn: "中文",
      hero_title_line1: "Decentralized perpetual contracts.",
      hero_title_line2: "Trade ",
      hero_title_line2_span: "cross-chain",
      hero_subtitle: "Non-custodial trading built for all — whether you're new to crypto or a seasoned pro.",
      launch_app: "Launch app",
      download_app: "Download app",
      stats_volume: "Total Trading Volume",
      stats_users: "Users",

      trading_title: "Aster Trading Bot",
      claim_window: "Claim window: Sep 17, 2025 17:00 (UTC+8) - Oct 17, 2025 17:00 (UTC+8)",
      settings_title: "Trading Settings",
      settings_desc_1: "Enter your API credentials and trading parameters.",
      settings_desc_2: "AsterBot will use these settings to run automated trades.",
      label_api_key: "API Key",
      ph_api_key: "Enter your API Key",
      label_api_secret: "API Secret",
      ph_api_secret: "Enter your API Secret",
      label_symbol: "Symbol",
      ph_symbol: "e.g., BTCUSDT",
      label_quantity: "Quantity",
      label_cycles: "Cycles",
      label_delay: "Delay (seconds)",
      start_trading: "Start Trading",
      exec_progress: "Execution Progress",
      faq_title: "FAQ",
    },
    zh: {
      nav_home: "首页",
      nav_trade: "交易",
      lang_btn: "EN",
      hero_title_line1: "去中心化永续合约平台。",
      hero_title_line2: "跨链",
      hero_title_line2_span: "交易",
      hero_subtitle: "为所有人打造的非托管交易，无论你是新手还是专业交易者。",
      launch_app: "开启应用",
      download_app: "下载应用",
      stats_volume: "累计交易量",
      stats_users: "用户数",

      trading_title: "Aster 交易机器人",
      claim_window: "认领周期：2025年9月17日 17:00(UTC+8) - 2025年10月17日 17:00(UTC+8)",
      settings_title: "交易设置",
      settings_desc_1: "请输入您的 API 凭证和交易参数。",
      settings_desc_2: "AsterBot 将使用这些设置执行自动化交易。",
      label_api_key: "API Key",
      ph_api_key: "输入您的 API Key",
      label_api_secret: "API Secret",
      ph_api_secret: "输入您的 API Secret",
      label_symbol: "交易对",
      ph_symbol: "例如：BTCUSDT",
      label_quantity: "数量",
      label_cycles: "循环次数",
      label_delay: "延迟（秒）",
      start_trading: "开始交易",
      exec_progress: "执行进度",
      faq_title: "常见问题解答",
    },
  };

  const i18nFaq = {
    en: [
      { q: "What is the $ASTER token?", a: "$ASTER is Aster's governance and utility token, used for voting, fee discounts, incentives, and ecosystem growth." },
      { q: "Who is eligible for the $ASTER airdrop?", a: "Community members who meet snapshot rules, including participants with earned points from Aster campaigns, contributors, and users who met trading conditions during the activity window." },
      { q: "What is the deadline to claim the $ASTER airdrop?", a: "Claims are open until Oct 17, 2025, 23:59 (UTC+8). Unclaimed tokens will be reclaimed and used to support ecosystem development." },
      { q: "How do I see my $ASTER after claiming?", a: "Check your wallet or the assets section on the trading page for your $ASTER balance. If it doesn't show, add the contract manually or switch to a supported network and try again." },
    ],
    zh: [
      { q: "$ASTER 代币是什么？", a: "$ASTER 是 Aster 生态的治理与效用代币，用于治理投票、费率优惠、激励与生态发展。" },
      { q: "谁有资格获得 $ASTER 空投？", a: "满足快照规则的社区成员，包括参加活动获得积分的用户、贡献者，以及在窗口期内满足交易条件的用户。" },
      { q: "领取 $ASTER 空投的截止日期是什么时候？", a: "认领截止至 2025 年 10 月 17 日 23:59 (UTC+8)。逾期未领的代币将被回收并用于支持生态发展。" },
      { q: "领取空投后如何查看 $ASTER？", a: "在钱包或交易页面的资产列表中查看 $ASTER 余额。如未显示，请手动添加合约地址或切换到支持的网络后再试。" },
    ],
  };

  const t = (k) => (i18n[lang] && i18n[lang][k]) || k;

  // FAQ 数据与展开状态（根据语言）
  const faqs = i18nFaq[lang];
  const [openFaq, setOpenFaq] = useState({});
  const toggleFaq = (idx) => {
    setOpenFaq((prev) => (prev[idx] ? {} : { [idx]: true }));
  };

  // 启动交易
  const startTrade = async () => {
    setProgress(0);
    setLogs(["🚀 Trading started..."]);

    try {
      const response = await axios.post("/api/start-trade", {
        apiKey,
        apiSecret,
        symbol,
        quantity,
        cycles,
        delay,
      });

      if (response.data.taskId) {
        setTaskId(response.data.taskId);
        setLogs((prev) => [...prev, "✅ Trade execution started on backend."]);
      } else {
        setLogs((prev) => [...prev, "❌ Failed to start trade"]);
      }
    } catch (error) {
      setLogs((prev) => [...prev, `❌ Network error: ${error.message}`]);
    }
  };

  // 轮询进度
  useEffect(() => {
    if (!taskId) return;

    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`/api/progress/${taskId}`);
        const data = res.data;

        if (data.total > 0) {
          setProgress(Math.min((data.current / data.total) * 100, 100));
        }

        setLogs((prev) => {
          const newLogs = [...prev];
          newLogs[newLogs.length - 1] = `📊 Progress: ${data.current}/${data.total}, status: ${data.status}`;
          return newLogs;
        });

        if (data.status === "done") {
          clearInterval(interval);
          setLogs((prev) => [...prev, "🎉 Trading completed."]);
        }
      } catch (err) {
        console.error("Progress polling error:", err);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [taskId]);

  // 首页
  if (page === "home") {
    return (
      <>
        <TopBar page={page} onNavigate={setPage} lang={lang} onToggleLang={() => setLang(lang === "en" ? "zh" : "en")} />
        <div className="hero-container">

        {/* 背景几何动画 */}
        <div className="geometric-bg">
          <div className="geometric-lines">
            <div className="line line-1"></div>
            <div className="line line-2"></div>
            <div className="line line-3"></div>
            <div className="line line-4"></div>
            <div className="line line-5"></div>
            <div className="line line-6"></div>
          </div>
          
          {/* 3D模型 */}
          <div className="model-3d-container">
            <div className="model-3d-rings">
              <div className="icon-outer-ring"></div>
              <div className="icon-middle-ring"></div>
            </div>
            <div className="model-3d-wrapper">
              <Model3D modelPath="/1.glb" />
            </div>
          </div>
        </div>

        {/* 主要内容 */}
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              {t('hero_title_line1')}
              <br />
              {t('hero_title_line2')} <span className="highlight-text">{t('hero_title_line2_span')}</span>
            </h1>
            <p className="hero-subtitle">{t('hero_subtitle')}</p>
            
            <div className="hero-buttons">
              <button className="launch-btn" onClick={() => setPage("trade")}>
                {t('launch_app')} <span className="arrow">→</span>
              </button>
              <a
                href="https://www.asterdex.com/zh-CN/referral/FB85A7"
                target="_blank"
                rel="noopener noreferrer"
                className="download-btn"
              >
                {t('download_app')} <span className="qr-icon">⊞</span>
              </a>
            </div>
          </div>
        </div>

        {/* 统计数据 - 移动到右下角 */}
        <div className="hero-stats-bottom">
          <div className="stat-item">
            <div className="stat-value">$584B</div>
            <div className="stat-label">{t('stats_volume')}</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">2M</div>
            <div className="stat-label">{t('stats_users')}</div>
          </div>
        </div>
        </div>
      </>
    );
  }

  // 交易页面
  return (
    <>
      <TopBar page={page} onNavigate={setPage} lang={lang} onToggleLang={() => setLang(lang === "en" ? "zh" : "en")} />
      <div className="trading-container">
      {/* 背景几何动画 - 复用首页的 */}
      <div className="geometric-bg">
        <div className="geometric-lines">
          <div className="line line-1"></div>
          <div className="line line-2"></div>
          <div className="line line-3"></div>
          <div className="line line-4"></div>
          <div className="line line-5"></div>
          <div className="line line-6"></div>
        </div>
        
        {/* 右侧3D模型 */}
        <div className="model-3d-container">
          <div className="model-3d-rings">
            <div className="icon-outer-ring"></div>
            <div className="icon-middle-ring"></div>
          </div>
          <div className="model-3d-wrapper">
            <Model3D modelPath="/1.glb" />
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="trading-content">
        <div className="trading-left">
          <div className="left-panel">
          <h1 className="trading-title">{t('trading_title')}</h1>

          

          <div className="info-section">
            <p className="info-text">{t('claim_window')}</p>
          </div>

          {/* 交易设置表单 - 移到左侧主面板 */}
          <div className="trading-card">
            <h2 className="card-title">{t('settings_title')}</h2>
            <p className="card-description">
              {t('settings_desc_1')}
              <br />
              {t('settings_desc_2')}
            </p>

            <div className="form-group">
              <label>{t('label_api_key')}</label>
              <input
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={t('ph_api_key')}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>{t('label_api_secret')}</label>
              <input
                value={apiSecret}
                onChange={(e) => setApiSecret(e.target.value)}
                placeholder={t('ph_api_secret')}
                className="form-input"
                type="password"
              />
            </div>

            <div className="form-group">
              <label>{t('label_symbol')}</label>
              <input
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                placeholder={t('ph_symbol')}
                className="form-input"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>{t('label_quantity')}</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(parseFloat(e.target.value))}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>{t('label_cycles')}</label>
                <input
                  type="number"
                  value={cycles}
                  onChange={(e) => setCycles(parseInt(e.target.value))}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label>{t('label_delay')}</label>
              <input
                type="number"
                value={delay}
                onChange={(e) => setDelay(parseInt(e.target.value))}
                className="form-input"
              />
            </div>

            <button className="start-trading-btn" onClick={startTrade}>
              {t('start_trading')}
            </button>
          </div>

          

          
          </div>
        </div>

        {/* 中间浮动的执行进度卡片 */}
        <div className="progress-floating">
          <div className="progress-card">
            <h3 className="card-title">{t('exec_progress')}</h3>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="progress-text">{progress.toFixed(1)}%</div>
            <div className="logs-container">
              {logs.map((log, i) => (
                <div key={i} className="log-item">{log}</div>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ 固定右上角浮层（独立渲染） */}
        <div className="faq-floating">
          <h3 className="faq-title">{t('faq_title')}</h3>
          {faqs.map((item, idx) => (
            <div
              key={idx}
              className={`faq-item ${openFaq[idx] ? "open" : ""}`}
            >
              <div className="faq-question" onClick={() => toggleFaq(idx)}>
                <span>{item.q}</span>
                <span className="faq-arrow">∨</span>
              </div>
              <div className="faq-answer">
                <p>{item.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>
    </>
  );
}

export default App;

function TopBar({ page, onNavigate, lang, onToggleLang }) {
  return (
    <div className="topbar">
      <div className="topbar-inner">
        <button className="brand" onClick={() => onNavigate("home")}>Aster<span className="brand-accent">Bot</span></button>
        <div className="nav-links">
          <button
            className={`nav-link ${page === "home" ? "active" : ""}`}
            onClick={() => onNavigate("home")}
          >
            {lang === 'zh' ? '首页' : 'Home'}
          </button>
          <button
            className={`nav-link ${page === "trade" ? "active" : ""}`}
            onClick={() => onNavigate("trade")}
          >
            {lang === 'zh' ? '交易' : 'Trade'}
          </button>
          <a
            className="nav-link nav-link-icon"
            href="https://x.com/Abot_bsc"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Twitter"
            title="X: @Abot_bsc"
          >
            𝕏
          </a>
          <button className="nav-link" onClick={onToggleLang}>{lang === 'en' ? '中文' : 'EN'}</button>
        </div>
      </div>
    </div>
  );
}
