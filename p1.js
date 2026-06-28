import { useState, useEffect, useRef } from "react";

const TOPICS = [
  "World", "India", "Technology", "Politics", "Business",
  "Sports", "Science", "Entertainment", "Health", "Environment"
];

const GREETINGS = {
  morning: "Good Morning",
  afternoon: "Good Afternoon",
  evening: "Good Evening",
  night: "Good Night"
};

function getGreeting() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return GREETINGS.morning;
  if (h >= 12 && h < 17) return GREETINGS.afternoon;
  if (h >= 17 && h < 21) return GREETINGS.evening;
  return GREETINGS.night;
}

function formatDateTime() {
  const now = new Date();
  return {
    time: now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    date: now.toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
    hour: now.getHours()
  };
}

async function fetchNewsFromClaude(topic, customQuery = null) {
  const query = customQuery || `Top 5 latest breaking news about ${topic} today worldwide. Format each as: HEADLINE | SOURCE | SUMMARY (1 sentence)`;
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      messages: [
        {
          role: "user",
          content: query + "\n\nReturn ONLY a JSON array (no markdown, no explanation):\n[{\"headline\":\"...\",\"source\":\"...\",\"summary\":\"...\",\"time\":\"...\"}]"
        }
      ]
    })
  });
  const data = await response.json();
  // Extract text from all content blocks
  const allText = data.content
    .filter(b => b.type === "text")
    .map(b => b.text)
    .join("");
  try {
    const clean = allText.replace(/```json|```/g, "").trim();
    const start = clean.indexOf("[");
    const end = clean.lastIndexOf("]") + 1;
    return JSON.parse(clean.slice(start, end));
  } catch {
    return [{ headline: "News loaded", source: "AI Search", summary: allText.slice(0, 200), time: "Just now" }];
  }
}

async function askJarvis(command) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      system: "You are JARVIS, an elite AI assistant. Be concise, intelligent, and helpful. Use web search for current info. Respond in the same language the user writes in (Gujarati, Hindi, or English).",
      messages: [{ role: "user", content: command }]
    })
  });
  const data = await response.json();
  return data.content.filter(b => b.type === "text").map(b => b.text).join("") || "Processing complete.";
}

export default function JarvisApp() {
  const [dt, setDt] = useState(formatDateTime());
  const [news, setNews] = useState([]);
  const [activeTopic, setActiveTopic] = useState("World");
  const [loading, setLoading] = useState(false);
  const [command, setCommand] = useState("");
  const [chat, setChat] = useState([]);
  const [view, setView] = useState("home"); // home | news | command
  const [particles] = useState(() => Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    speed: Math.random() * 20 + 10
  })));
  const chatEndRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setDt(formatDateTime()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const loadNews = async (topic) => {
    setActiveTopic(topic);
    setLoading(true);
    setNews([]);
    try {
      const results = await fetchNewsFromClaude(topic);
      setNews(results);
    } catch {
      setNews([{ headline: "Connection Error", source: "System", summary: "Could not fetch news. Please try again.", time: "" }]);
    }
    setLoading(false);
  };

  const handleCommand = async (e) => {
    if (e.key === "Enter" && command.trim()) {
      const userMsg = command.trim();
      setCommand("");
      setChat(c => [...c, { role: "user", text: userMsg }]);
      setLoading(true);

      // Check for news commands
      const newsMatch = TOPICS.find(t => userMsg.toLowerCase().includes(t.toLowerCase()));
      if (userMsg.toLowerCase().includes("news") && newsMatch) {
        setView("news");
        await loadNews(newsMatch);
        setChat(c => [...c, { role: "jarvis", text: `Fetching ${newsMatch} news for you, Sir.` }]);
      } else {
        const reply = await askJarvis(userMsg);
        setChat(c => [...c, { role: "jarvis", text: reply }]);
      }
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #000510 0%, #001a2e 50%, #000510 100%)",
      fontFamily: "'Courier New', monospace",
      color: "#00d4ff",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Animated particles */}
      {particles.map(p => (
        <div key={p.id} style={{
          position: "fixed",
          left: `${p.x}%`,
          top: `${p.y}%`,
          width: `${p.size}px`,
          height: `${p.size}px`,
          borderRadius: "50%",
          background: p.id % 3 === 0 ? "#00d4ff" : p.id % 3 === 1 ? "#0066ff" : "#00ff88",
          opacity: 0.3,
          animation: `float ${p.speed}s infinite alternate`,
          pointerEvents: "none"
        }} />
      ))}

      <style>{`
        @keyframes float { from { transform: translateY(0px); } to { transform: translateY(-20px); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
        @keyframes scan { 0% { top:0; } 100% { top:100%; } }
        @keyframes glow { 0%,100% { box-shadow: 0 0 10px #00d4ff; } 50% { box-shadow: 0 0 30px #00d4ff, 0 0 60px #0066ff; } }
        .nav-btn { background: transparent; border: 1px solid #00d4ff33; color: #00d4ff; padding: 8px 18px; border-radius: 4px; cursor: pointer; font-family: 'Courier New', monospace; font-size: 13px; transition: all 0.2s; }
        .nav-btn:hover, .nav-btn.active { background: #00d4ff22; border-color: #00d4ff; box-shadow: 0 0 15px #00d4ff44; }
        .topic-btn { background: transparent; border: 1px solid #0066ff44; color: #88ccff; padding: 6px 12px; border-radius: 3px; cursor: pointer; font-family: 'Courier New', monospace; font-size: 11px; transition: all 0.2s; margin: 3px; }
        .topic-btn:hover, .topic-btn.active { background: #0066ff33; border-color: #0066ff; color: #00d4ff; }
        .cmd-input { background: #000c1a; border: 1px solid #00d4ff44; border-radius: 4px; color: #00d4ff; padding: 12px 16px; font-family: 'Courier New', monospace; font-size: 14px; width: 100%; outline: none; box-sizing: border-box; }
        .cmd-input:focus { border-color: #00d4ff; box-shadow: 0 0 20px #00d4ff22; }
        .news-card { background: #000c1a; border: 1px solid #0066ff33; border-radius: 6px; padding: 14px; margin-bottom: 10px; border-left: 3px solid #00d4ff; transition: all 0.2s; }
        .news-card:hover { border-left-color: #00ff88; background: #001020; }
        .scrollable { overflow-y: auto; max-height: 400px; }
        .scrollable::-webkit-scrollbar { width: 4px; }
        .scrollable::-webkit-scrollbar-thumb { background: #00d4ff44; border-radius: 2px; }
        .loading-dot { display:inline-block; animation: pulse 0.8s infinite; }
        .loading-dot:nth-child(2) { animation-delay: 0.2s; }
        .loading-dot:nth-child(3) { animation-delay: 0.4s; }
      `}</style>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "20px", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <div style={{ fontSize: "11px", color: "#0066ff", letterSpacing: "6px", marginBottom: "8px" }}>
            ◈ SYSTEM ONLINE ◈
          </div>
          <div style={{
            fontSize: "42px", fontWeight: "bold", letterSpacing: "8px",
            background: "linear-gradient(90deg, #0066ff, #00d4ff, #00ff88)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            textShadow: "none", marginBottom: "4px"
          }}>
            J.A.R.V.I.S
          </div>
          <div style={{ fontSize: "11px", color: "#00d4ff88", letterSpacing: "3px" }}>
            JUST A RATHER VERY INTELLIGENT SYSTEM
          </div>

          {/* Time & Date */}
          <div style={{
            marginTop: "20px", padding: "16px 24px",
            background: "#000c1a", border: "1px solid #00d4ff33",
            borderRadius: "8px", display: "inline-block",
            animation: "glow 3s infinite"
          }}>
            <div style={{ fontSize: "36px", fontWeight: "bold", letterSpacing: "4px", color: "#00ff88" }}>
              {dt.time}
            </div>
            <div style={{ fontSize: "13px", color: "#00d4ff88", marginTop: "4px" }}>
              {dt.date}
            </div>
            <div style={{ fontSize: "14px", color: "#00d4ff", marginTop: "6px" }}>
              {getGreeting()}, Sir! Systems are fully operational.
            </div>
          </div>
        </div>

        {/* Nav */}
        <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginBottom: "24px", flexWrap: "wrap" }}>
          <button className={`nav-btn ${view === "home" ? "active" : ""}`} onClick={() => setView("home")}>⌂ HOME</button>
          <button className={`nav-btn ${view === "news" ? "active" : ""}`} onClick={() => { setView("news"); if (!news.length) loadNews("World"); }}>◉ NEWS</button>
          <button className={`nav-btn ${view === "command" ? "active" : ""}`} onClick={() => setView("command")}>▶ COMMAND</button>
        </div>

        {/* HOME VIEW */}
        {view === "home" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
              {[
                { icon: "◉", label: "LIVE NEWS", desc: "All world topics", action: () => { setView("news"); loadNews("World"); } },
                { icon: "▶", label: "COMMAND MODE", desc: "Ask anything", action: () => setView("command") },
                { icon: "◈", label: "SEARCH NEWS", desc: "Custom topic search", action: () => setView("command") },
                { icon: "◇", label: "STATUS", desc: "All systems online", action: null }
              ].map((card, i) => (
                <div key={i} onClick={card.action}
                  style={{
                    background: "#000c1a", border: "1px solid #0066ff33",
                    borderRadius: "8px", padding: "20px", cursor: card.action ? "pointer" : "default",
                    transition: "all 0.2s", borderLeft: "3px solid #0066ff"
                  }}
                  onMouseEnter={e => card.action && (e.currentTarget.style.borderLeftColor = "#00d4ff")}
                  onMouseLeave={e => card.action && (e.currentTarget.style.borderLeftColor = "#0066ff")}
                >
                  <div style={{ fontSize: "24px", color: "#00d4ff" }}>{card.icon}</div>
                  <div style={{ fontSize: "14px", fontWeight: "bold", color: "#00d4ff", marginTop: "8px", letterSpacing: "2px" }}>{card.label}</div>
                  <div style={{ fontSize: "12px", color: "#00d4ff66", marginTop: "4px" }}>{card.desc}</div>
                </div>
              ))}
            </div>

            <div style={{ background: "#000c1a", border: "1px solid #00d4ff22", borderRadius: "8px", padding: "16px" }}>
              <div style={{ fontSize: "11px", color: "#0066ff", letterSpacing: "3px", marginBottom: "12px" }}>QUICK COMMAND</div>
              <input
                className="cmd-input"
                placeholder='> Try: "India news", "What is AI?", "Technology trending today"'
                value={command}
                onChange={e => setCommand(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") { setView("command"); handleCommand(e); } }}
              />
            </div>
          </div>
        )}

        {/* NEWS VIEW */}
        {view === "news" && (
          <div>
            <div style={{ marginBottom: "16px" }}>
              <div style={{ fontSize: "11px", color: "#0066ff", letterSpacing: "3px", marginBottom: "10px" }}>SELECT TOPIC</div>
              <div style={{ display: "flex", flexWrap: "wrap" }}>
                {TOPICS.map(t => (
                  <button key={t} className={`topic-btn ${activeTopic === t ? "active" : ""}`} onClick={() => loadNews(t)}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {loading && (
              <div style={{ textAlign: "center", padding: "40px", color: "#00d4ff" }}>
                <div style={{ fontSize: "14px", letterSpacing: "3px" }}>
                  SCANNING GLOBAL FEEDS
                  <span className="loading-dot">.</span>
                  <span className="loading-dot">.</span>
                  <span className="loading-dot">.</span>
                </div>
              </div>
            )}

            {!loading && news.length > 0 && (
              <div className="scrollable">
                <div style={{ fontSize: "11px", color: "#0066ff", letterSpacing: "3px", marginBottom: "12px" }}>
                  ◉ LIVE FEED — {activeTopic.toUpperCase()} NEWS
                </div>
                {news.map((item, i) => (
                  <div key={i} className="news-card">
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ fontSize: "11px", color: "#00ff88", letterSpacing: "2px" }}>
                        [{String(i + 1).padStart(2, "0")}] {item.source || "GLOBAL"}
                      </span>
                      <span style={{ fontSize: "11px", color: "#00d4ff44" }}>{item.time || ""}</span>
                    </div>
                    <div style={{ fontSize: "14px", fontWeight: "bold", color: "#00d4ff", marginBottom: "6px", lineHeight: 1.4 }}>
                      {item.headline}
                    </div>
                    <div style={{ fontSize: "12px", color: "#00d4ff88", lineHeight: 1.5 }}>
                      {item.summary}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* COMMAND VIEW */}
        {view === "command" && (
          <div>
            <div style={{ fontSize: "11px", color: "#0066ff", letterSpacing: "3px", marginBottom: "12px" }}>
              JARVIS COMMAND INTERFACE
            </div>

            <div className="scrollable" style={{ marginBottom: "16px", minHeight: "300px" }}>
              {chat.length === 0 && (
                <div style={{ textAlign: "center", padding: "40px", color: "#00d4ff44" }}>
                  <div style={{ fontSize: "20px", marginBottom: "10px" }}>◈</div>
                  <div style={{ fontSize: "13px", letterSpacing: "2px" }}>AWAITING YOUR COMMAND, SIR</div>
                  <div style={{ fontSize: "11px", marginTop: "20px", lineHeight: 2, color: "#0066ff" }}>
                    Try: "India politics news" • "Explain quantum computing" • "World trending today"
                  </div>
                </div>
              )}
              {chat.map((msg, i) => (
                <div key={i} style={{
                  marginBottom: "12px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: msg.role === "user" ? "flex-end" : "flex-start"
                }}>
                  <div style={{
                    maxWidth: "85%",
                    background: msg.role === "user" ? "#001a33" : "#000c1a",
                    border: `1px solid ${msg.role === "user" ? "#0066ff55" : "#00d4ff33"}`,
                    borderRadius: "6px",
                    padding: "10px 14px",
                    fontSize: "13px",
                    lineHeight: 1.6,
                    color: msg.role === "user" ? "#88ccff" : "#00d4ff",
                    whiteSpace: "pre-wrap"
                  }}>
                    <div style={{ fontSize: "10px", color: msg.role === "user" ? "#0066ff" : "#00ff88", letterSpacing: "2px", marginBottom: "4px" }}>
                      {msg.role === "user" ? "▶ YOU" : "◈ JARVIS"}
                    </div>
                    {msg.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ color: "#00d4ff", fontSize: "13px", letterSpacing: "2px" }}>
                  ◈ JARVIS PROCESSING
                  <span className="loading-dot">.</span>
                  <span className="loading-dot">.</span>
                  <span className="loading-dot">.</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <input
              className="cmd-input"
              placeholder="> Enter command... (Press Enter)"
              value={command}
              onChange={e => setCommand(e.target.value)}
              onKeyDown={handleCommand}
              autoFocus
            />
            <div style={{ fontSize: "11px", color: "#00d4ff33", marginTop: "8px", letterSpacing: "1px" }}>
              Commands: news, search, explain, translate, analyze, latest updates, and anything else...
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: "30px", fontSize: "10px", color: "#00d4ff22", letterSpacing: "3px" }}>
          ◈ JARVIS v1.0 — POWERED BY CLAUDE AI — ALL SYSTEMS NOMINAL ◈
        </div>
      </div>
    </div>
  );
}