import { useState, useEffect, useRef, useCallback } from "react";

// ─── Month themes with gradient palettes and imagery ───────────────────────
const MONTH_THEMES = [
  { name: "January",  emoji: "❄️",  gradient: ["#0f2027","#203a43","#2c5364"], accent: "#7ee8fa", mood: "Winter Silence",    icon: "🏔️" },
  { name: "February", emoji: "💝",  gradient: ["#4b1248","#f10711","#c81d77"], accent: "#ff8cc8", mood: "Valentines Bloom",  icon: "🌹" },
  { name: "March",    emoji: "🌿",  gradient: ["#134e5e","#71b280","#2b7a0b"], accent: "#b5ead7", mood: "Spring Awakening",  icon: "🌱" },
  { name: "April",    emoji: "🌸",  gradient: ["#614385","#516395","#e96c7c"], accent: "#ffd6e7", mood: "Cherry Blossoms",   icon: "🌸" },
  { name: "May",      emoji: "☀️",  gradient: ["#f7971e","#ffd200","#f6a623"], accent: "#fff9c4", mood: "Golden Mornings",  icon: "🌻" },
  { name: "June",     emoji: "🌊",  gradient: ["#1a6b8a","#00b4d8","#48cae4"], accent: "#90e0ef", mood: "Ocean Breeze",     icon: "🏖️" },
  { name: "July",     emoji: "🔥",  gradient: ["#c94b4b","#4b134f","#ff6b35"], accent: "#ffd166", mood: "Summer Blaze",     icon: "🎆" },
  { name: "August",   emoji: "🌅",  gradient: ["#f77062","#fe5196","#f9a825"], accent: "#ffe082", mood: "Amber Dusk",       icon: "🌄" },
  { name: "September",emoji: "🍂",  gradient: ["#8b4513","#d2691e","#cd853f"], accent: "#ffcc80", mood: "Harvest Gold",     icon: "🍁" },
  { name: "October",  emoji: "🎃",  gradient: ["#1a1a2e","#16213e","#e94560"], accent: "#ff6b6b", mood: "Haunted Nights",   icon: "🕸️" },
  { name: "November", emoji: "🦃",  gradient: ["#2c3e50","#4a5568","#8b7355"], accent: "#d4a76a", mood: "Misty Evenings",   icon: "🍂" },
  { name: "December", emoji: "🎄",  gradient: ["#0a3d62","#1e3c72","#c0392b"], accent: "#ffd700", mood: "Festive Magic",    icon: "⭐" },
];

// Style helper for inline gradients
const getGradientStyle = (colors) => ({
  background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]}, ${colors[2]})`
});

const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const HOLIDAYS = {
  "1-1": "New Year's Day", "2-14": "Valentine's Day", "3-17": "St. Patrick's Day",
  "7-4": "Independence Day", "10-31": "Halloween", "11-11": "Veterans Day",
  "12-25": "Christmas", "12-31": "New Year's Eve", "1-15": "MLK Jr. Day",
};

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}
function isSameDay(d1, d2) {
  if (!d1 || !d2) return false;
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
}
function isInRange(date, start, end) {
  if (!start || !end || !date) return false;
  const s = start < end ? start : end;
  const e = start < end ? end : start;
  return date > s && date < e;
}
function formatDate(date) {
  if (!date) return "";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ─── Animated particle background ──────────────────────────────────────────
function ParticleCanvas({ theme }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const particles = Array.from({ length: 28 }, () => ({
      x: Math.random() * canvas.offsetWidth,
      y: Math.random() * canvas.offsetHeight,
      r: Math.random() * 3 + 1,
      dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.4,
      opacity: Math.random() * 0.4 + 0.1,
    }));

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = theme.accent + Math.floor(p.opacity * 255).toString(16).padStart(2, "0");
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      });
      animRef.current = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [theme]);

  return <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", borderRadius: "inherit" }} />;
}

// ─── Hero image panel ────────────────────────────────────────────────────────
function HeroPanel({ theme, month, year, flipping, onFlip }) {
  return (
    <div style={{
      position: "relative",
      background: `linear-gradient(135deg, ${theme.gradient[0]}, ${theme.gradient[1]}, ${theme.gradient[2]})`,
      borderRadius: "20px 20px 0 0",
      overflow: "hidden",
      minHeight: "220px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "32px 24px 24px",
      cursor: "pointer",
      userSelect: "none",
    }} onClick={onFlip} title="Click to see month details">
      <ParticleCanvas theme={theme} />

      {/* Paper rings */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, display: "flex", justifyContent: "space-around", padding: "0 40px" }}>
        {[0,1,2,3,4].map(i => (
          <div key={i} style={{
            width: 28, height: 32,
            background: "rgba(255,255,255,0.15)",
            borderRadius: "0 0 14px 14px",
            border: "2px solid rgba(255,255,255,0.3)",
            borderTop: "none",
            backdropFilter: "blur(4px)",
          }} />
        ))}
      </div>

      {/* Month icon */}
      <div style={{
        fontSize: 72,
        lineHeight: 1,
        marginBottom: 8,
        filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.4))",
        animation: flipping ? "none" : "float 3s ease-in-out infinite",
        transition: "all 0.4s ease",
      }}>
        {theme.icon}
      </div>

      {/* Month name */}
      <div style={{
        fontFamily: "'Playfair Display', Georgia, serif",
        fontSize: "clamp(28px, 5vw, 42px)",
        fontWeight: 900,
        color: "#fff",
        textShadow: "0 2px 20px rgba(0,0,0,0.5)",
        letterSpacing: "0.02em",
        lineHeight: 1,
        marginBottom: 6,
      }}>
        {theme.name}
      </div>

      <div style={{
        fontFamily: "'Crimson Text', Georgia, serif",
        fontSize: 16,
        color: theme.accent,
        letterSpacing: "0.15em",
        textTransform: "uppercase",
        fontStyle: "italic",
      }}>
        {theme.mood} · {year}
      </div>

      {/* Decorative line */}
      <div style={{
        position: "absolute",
        bottom: 0,
        left: "10%",
        right: "10%",
        height: 3,
        background: `linear-gradient(90deg, transparent, ${theme.accent}, transparent)`,
        borderRadius: 2,
      }} />
    </div>
  );
}

// ─── Day cell ────────────────────────────────────────────────────────────────
function DayCell({ day, date, theme, isStart, isEnd, inRange, isToday, holiday, onMouseDown, onMouseEnter, onMouseUp, hasNote }) {
  const [hovered, setHovered] = useState(false);
  const isSelected = isStart || isEnd;
  const highlighted = isSelected || inRange;

  return (
    <div
      onMouseDown={() => onMouseDown(date)}
      onMouseEnter={() => onMouseEnter(date)}
      onMouseUp={() => onMouseUp(date)}
      onTouchStart={() => onMouseDown(date)}
      onTouchMove={e => {
        const t = e.touches[0];
        const el = document.elementFromPoint(t.clientX, t.clientY);
        if (el && el.dataset.date) onMouseEnter(new Date(el.dataset.date));
      }}
      onTouchEnd={() => onMouseUp(date)}
      data-date={date ? date.toISOString() : ""}
      onMouseEnter2={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={holiday || ""}
      style={{
        position: "relative",
        height: "clamp(36px, 7vw, 52px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: day ? "pointer" : "default",
        borderRadius: isStart ? "12px 0 0 12px" : isEnd ? "0 12px 12px 0" : inRange ? "0" : "12px",
        background: isStart || isEnd
          ? theme.accent
          : inRange
          ? theme.accent + "33"
          : "transparent",
        transition: "all 0.15s ease",
        transform: hovered && day ? "scale(1.08)" : "scale(1)",
      }}
    >
      {day && (
        <>
          {/* Today ring */}
          {isToday && !isSelected && (
            <div style={{
              position: "absolute",
              inset: "4px",
              borderRadius: 8,
              border: `2px solid ${theme.accent}`,
              opacity: 0.7,
            }} />
          )}

          <span style={{
            fontFamily: "'DM Mono', 'Courier New', monospace",
            fontSize: "clamp(11px, 2vw, 15px)",
            fontWeight: isSelected ? 800 : isToday ? 700 : 400,
            color: isSelected
              ? "#111"
              : isToday
              ? theme.accent
              : inRange
              ? "#fff"
              : "rgba(255,255,255,0.85)",
            lineHeight: 1,
            zIndex: 1,
          }}>
            {day}
          </span>

          {/* Holiday dot */}
          {holiday && (
            <div style={{
              position: "absolute",
              bottom: 4,
              left: "50%",
              transform: "translateX(-50%)",
              width: 4,
              height: 4,
              borderRadius: "50%",
              background: isSelected ? "#111" : "#ffd700",
            }} />
          )}

          {/* Note indicator */}
          {hasNote && !holiday && (
            <div style={{
              position: "absolute",
              bottom: 4,
              left: "50%",
              transform: "translateX(-50%)",
              width: 4,
              height: 4,
              borderRadius: "50%",
              background: isSelected ? "#111" : theme.accent,
              opacity: 0.8,
            }} />
          )}
        </>
      )}
    </div>
  );
}

// ─── Notes panel ─────────────────────────────────────────────────────────────
function NotesPanel({ theme, startDate, endDate, notes, setNotes, dayNotes, setDayNotes }) {
  const [activeTab, setActiveTab] = useState("month");
  const rangeKey = startDate && endDate
    ? `${formatDate(startDate < endDate ? startDate : endDate)} → ${formatDate(startDate < endDate ? endDate : startDate)}`
    : null;

  const monthNote = notes || "";
  const rangeNote = rangeKey ? (dayNotes[rangeKey] || "") : "";

  return (
    <div style={{
      background: "rgba(255,255,255,0.04)",
      borderRadius: 16,
      border: "1px solid rgba(255,255,255,0.1)",
      overflow: "hidden",
      height: "100%",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Tab bar */}
      <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        {["month", "range"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: "12px 8px",
              background: activeTab === tab ? theme.accent + "22" : "transparent",
              border: "none",
              borderBottom: activeTab === tab ? `2px solid ${theme.accent}` : "2px solid transparent",
              color: activeTab === tab ? theme.accent : "rgba(255,255,255,0.5)",
              fontFamily: "'DM Mono', monospace",
              fontSize: 11,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {tab === "month" ? "📝 Month" : "📌 Range"}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
        {activeTab === "month" ? (
          <>
            <div style={{ fontFamily: "'Crimson Text', Georgia, serif", color: "rgba(255,255,255,0.4)", fontSize: 12, fontStyle: "italic" }}>
              General notes for this month
            </div>
            <textarea
              value={monthNote}
              onChange={e => setNotes(e.target.value)}
              placeholder={`Jot down plans, goals, or thoughts for ${MONTH_THEMES[new Date().getMonth()].name}…`}
              style={{
                flex: 1,
                minHeight: 120,
                background: "rgba(255,255,255,0.05)",
                border: `1px solid ${theme.accent}33`,
                borderRadius: 10,
                padding: "12px 14px",
                color: "#fff",
                fontFamily: "'Crimson Text', Georgia, serif",
                fontSize: 15,
                lineHeight: 1.7,
                resize: "none",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={e => e.target.style.borderColor = theme.accent + "88"}
              onBlur={e => e.target.style.borderColor = theme.accent + "33"}
            />
          </>
        ) : (
          <>
            {rangeKey ? (
              <>
                <div style={{
                  background: theme.accent + "22",
                  borderRadius: 8,
                  padding: "8px 12px",
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 11,
                  color: theme.accent,
                  letterSpacing: "0.05em",
                }}>
                  📅 {rangeKey}
                </div>
                <textarea
                  value={rangeNote}
                  onChange={e => setDayNotes(prev => ({ ...prev, [rangeKey]: e.target.value }))}
                  placeholder="Add notes for this date range…"
                  style={{
                    flex: 1,
                    minHeight: 100,
                    background: "rgba(255,255,255,0.05)",
                    border: `1px solid ${theme.accent}33`,
                    borderRadius: 10,
                    padding: "12px 14px",
                    color: "#fff",
                    fontFamily: "'Crimson Text', Georgia, serif",
                    fontSize: 15,
                    lineHeight: 1.7,
                    resize: "none",
                    outline: "none",
                  }}
                  onFocus={e => e.target.style.borderColor = theme.accent + "88"}
                  onBlur={e => e.target.style.borderColor = theme.accent + "33"}
                />
              </>
            ) : (
              <div style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: 8,
                color: "rgba(255,255,255,0.25)",
                textAlign: "center",
              }}>
                <div style={{ fontSize: 32 }}>🖱️</div>
                <div style={{ fontFamily: "'Crimson Text', serif", fontSize: 14, fontStyle: "italic" }}>
                  Select a date range on the calendar to add notes
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Saved notes list */}
      {Object.keys(dayNotes).length > 0 && (
        <div style={{
          borderTop: "1px solid rgba(255,255,255,0.08)",
          padding: "10px 16px",
          maxHeight: 120,
          overflowY: "auto",
        }}>
          <div style={{ fontSize: 10, letterSpacing: "0.12em", color: "rgba(255,255,255,0.3)", fontFamily: "'DM Mono', monospace", marginBottom: 6 }}>
            SAVED RANGE NOTES
          </div>
          {Object.entries(dayNotes).filter(([,v]) => v).map(([k, v]) => (
            <div key={k} style={{ marginBottom: 6 }}>
              <div style={{ fontSize: 10, color: theme.accent, fontFamily: "'DM Mono', monospace", marginBottom: 2 }}>{k}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", fontFamily: "'Crimson Text', serif", fontStyle: "italic" }}>
                {v.slice(0, 60)}{v.length > 60 ? "…" : ""}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Calendar ────────────────────────────────────────────────────────────
export default function WallCalendar() {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [hoverDate, setHoverDate] = useState(null);
  const [selecting, setSelecting] = useState(false);
  const [notes, setNotes] = useState("");
  const [dayNotes, setDayNotes] = useState({});
  const [flipping, setFlipping] = useState(false);
  const [flipDir, setFlipDir] = useState(1);
  const [showInfo, setShowInfo] = useState(false);

  const theme = MONTH_THEMES[viewMonth];
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  // Build calendar grid
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  // Navigate months with flip animation
  const navigate = useCallback((dir) => {
    setFlipping(true);
    setFlipDir(dir);
    setTimeout(() => {
      setViewMonth(m => {
        const nm = m + dir;
        if (nm < 0) { setViewYear(y => y - 1); return 11; }
        if (nm > 11) { setViewYear(y => y + 1); return 0; }
        return nm;
      });
      // Ensure flipping state resets after month updates
      setFlipping(false);
    }, 300);
  }, []);

  const handleMouseDown = useCallback((date) => {
    if (!date) return;
    setSelecting(true);
    setStartDate(date);
    setEndDate(null);
  }, []);

  const handleMouseEnter = useCallback((date) => {
    if (!date) return;
    setHoverDate(date);
    if (selecting) setEndDate(date);
  }, [selecting]);

  const handleMouseUp = useCallback((date) => {
    if (!date) return;
    setSelecting(false);
    if (date) setEndDate(date);
  }, []);

  useEffect(() => {
    const up = () => setSelecting(false);
    window.addEventListener("mouseup", up);
    return () => window.removeEventListener("mouseup", up);
  }, []);

  const effectiveEnd = selecting ? hoverDate : endDate;

  return (
    <>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Crimson+Text:ital,wght@0,400;0,600;1,400&family=DM+Mono:wght@400;500&display=swap');

        * { box-sizing: border-box; }

        body {
          margin: 0;
          min-height: 100vh;
          background: #0d0d14;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'DM Mono', monospace;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }

        @keyframes flipInAnimation {
          0% { 
            transform: rotateX(-90deg) translateY(-20px); 
            opacity: 0; 
          }
          100% { 
            transform: rotateX(0deg) translateY(0); 
            opacity: 1; 
          }
        }

        @keyframes flipOutAnimation {
          0% { 
            transform: rotateX(0deg); 
            opacity: 1; 
          }
          100% { 
            transform: rotateX(90deg) translateY(20px); 
            opacity: 0; 
          }
        }

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }

        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 2px;
          animation: fadeSlideUp 0.4s ease both;
        }

        .calendar-wrapper {
          perspective: 800px;
        }

        .calendar-wrapper.flipping {
          animation: flipOutAnimation 0.3s ease forwards;
        }

        .calendar-wrapper.entering {
          animation: flipInAnimation 0.4s ease both;
        }

        .nav-btn {
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.12);
          color: #fff;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          transition: all 0.2s;
          user-select: none;
        }

        .nav-btn:hover {
          background: rgba(255,255,255,0.18);
          transform: scale(1.1);
        }

        .day-cell:hover > span {
          color: #fff !important;
        }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 2px; }

        @media (max-width: 640px) {
          .cal-layout { flex-direction: column !important; }
          .notes-col { width: 100% !important; min-width: unset !important; }
        }
      `}</style>

      <div style={{
        width: "100%",
        maxWidth: 900,
        margin: "0 auto",
        padding: "clamp(12px, 3vw, 32px)",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        {/* Main card */}
        <div style={{
          width: "100%",
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(20px)",
          borderRadius: 24,
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: `0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.08)`,
          overflow: "hidden",
          transition: "box-shadow 0.5s ease",
        }}>

          {/* Hero */}
          <HeroPanel
            theme={theme}
            month={viewMonth}
            year={viewYear}
            flipping={flipping}
            onFlip={() => setShowInfo(x => !x)}
          />

          {/* Info overlay */}
          {showInfo && (
            <div style={{
              background: `linear-gradient(135deg, ${theme.gradient[0]}ee, ${theme.gradient[2]}ee)`,
              padding: "20px 28px",
              borderTop: `1px solid ${theme.accent}33`,
              animation: "fadeSlideUp 0.3s ease",
              display: "flex",
              flexWrap: "wrap",
              gap: 16,
              alignItems: "center",
            }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: "#fff", marginBottom: 4 }}>
                  {theme.emoji} {theme.name} {viewYear}
                </div>
                <div style={{ fontSize: 12, color: theme.accent, fontFamily: "'DM Mono', monospace" }}>
                  {daysInMonth} days · Starts {DAYS[firstDay]}
                </div>
              </div>
              {startDate && (
                <div style={{
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: 10,
                  padding: "8px 14px",
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 11,
                  color: theme.accent,
                }}>
                  {effectiveEnd && !isSameDay(startDate, effectiveEnd)
                    ? `${formatDate(startDate < effectiveEnd ? startDate : effectiveEnd)} → ${formatDate(startDate < effectiveEnd ? effectiveEnd : startDate)}`
                    : formatDate(startDate)
                  }
                </div>
              )}
            </div>
          )}

          {/* Body */}
          <div className="cal-layout" style={{
            display: "flex",
            gap: 0,
          }}>
            {/* Calendar section */}
            <div style={{ flex: 1, padding: "clamp(16px, 3vw, 28px)" }}>
              {/* Navigation */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <button className="nav-btn" onClick={() => navigate(-1)}>‹</button>

                <div style={{ textAlign: "center" }}>
                  <div style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "clamp(16px, 3vw, 22px)",
                    fontWeight: 700,
                    color: "#fff",
                    letterSpacing: "0.02em",
                  }}>
                    {theme.name} {viewYear}
                  </div>
                  {startDate && (
                    <div style={{
                      fontSize: 10,
                      color: theme.accent,
                      fontFamily: "'DM Mono', monospace",
                      marginTop: 2,
                      animation: "pulse 2s infinite",
                    }}>
                      {effectiveEnd && !isSameDay(startDate, effectiveEnd)
                        ? (() => {
                            const s = startDate < effectiveEnd ? startDate : effectiveEnd;
                            const e = startDate < effectiveEnd ? effectiveEnd : startDate;
                            const diff = Math.round((e - s) / 86400000) + 1;
                            return `${diff} days selected`;
                          })()
                        : "1 day selected"
                      }
                    </div>
                  )}
                </div>

                <button className="nav-btn" onClick={() => navigate(1)}>›</button>
              </div>

              {/* Day headers */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                gap: 2,
                marginBottom: 4,
              }}>
                {DAYS.map(d => (
                  <div key={d} style={{
                    textAlign: "center",
                    fontFamily: "'DM Mono', monospace",
                    fontSize: "clamp(9px, 1.5vw, 11px)",
                    color: d === "Sun" ? "#ff8080" : d === "Sat" ? "#80aaff" : "rgba(255,255,255,0.35)",
                    letterSpacing: "0.08em",
                    padding: "4px 0",
                    fontWeight: 500,
                  }}>
                    {d}
                  </div>
                ))}
              </div>

              {/* Grid */}
              <div className={`calendar-wrapper ${flipping ? 'flipping' : 'entering'}`} key={`${viewYear}-${viewMonth}`}>
                <div className="calendar-grid">
                  {cells.map((day, idx) => {
                    const date = day ? new Date(viewYear, viewMonth, day) : null;
                    const holidayKey = date ? `${date.getMonth() + 1}-${date.getDate()}` : "";
                    const holiday = HOLIDAYS[holidayKey] || null;
                    const rangeKey2 = startDate && effectiveEnd
                      ? `${formatDate(startDate < effectiveEnd ? startDate : effectiveEnd)} → ${formatDate(startDate < effectiveEnd ? effectiveEnd : startDate)}`
                      : null;
                    const hasNote = rangeKey2 && dayNotes[rangeKey2];

                    return (
                      <DayCell
                        key={idx}
                        day={day}
                        date={date}
                        theme={theme}
                        isStart={isSameDay(date, startDate) || isSameDay(date, effectiveEnd && startDate > effectiveEnd ? startDate : null)}
                        isEnd={effectiveEnd ? isSameDay(date, effectiveEnd) || (startDate && effectiveEnd && startDate > effectiveEnd && isSameDay(date, startDate)) : false}
                        inRange={isInRange(date, startDate, effectiveEnd)}
                        isToday={isSameDay(date, today)}
                        holiday={holiday}
                        hasNote={false}
                        onMouseDown={handleMouseDown}
                        onMouseEnter={handleMouseEnter}
                        onMouseUp={handleMouseUp}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Legend */}
              <div style={{
                marginTop: 16,
                display: "flex",
                gap: 16,
                flexWrap: "wrap",
              }}>
                {[
                  { color: theme.accent, label: "Selected" },
                  { color: theme.accent + "44", label: "Range" },
                  { color: "transparent", border: `2px solid ${theme.accent}`, label: "Today" },
                  { color: "#ffd700", label: "Holiday" },
                ].map(({ color, border, label }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{
                      width: 10, height: 10,
                      borderRadius: 3,
                      background: color,
                      border: border || "none",
                      flexShrink: 0,
                    }} />
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontFamily: "'DM Mono', monospace" }}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Holiday hint */}
              {cells.some((day) => {
                if (!day) return false;
                const key = `${viewMonth + 1}-${day}`;
                return HOLIDAYS[key];
              }) && (
                <div style={{
                  marginTop: 12,
                  padding: "8px 12px",
                  background: "rgba(255,215,0,0.08)",
                  borderRadius: 8,
                  border: "1px solid rgba(255,215,0,0.15)",
                }}>
                  {Object.entries(HOLIDAYS)
                    .filter(([k]) => parseInt(k.split("-")[0]) === viewMonth + 1)
                    .map(([k, v]) => (
                      <div key={k} style={{ fontSize: 11, color: "rgba(255,215,0,0.7)", fontFamily: "'DM Mono', monospace" }}>
                        🎉 {k.split("-")[1]} — {v}
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Notes panel */}
            <div className="notes-col" style={{
              width: "clamp(220px, 30%, 280px)",
              minWidth: 220,
              padding: "clamp(16px, 3vw, 28px)",
              paddingLeft: 0,
              display: "flex",
              flexDirection: "column",
            }}>
              <div style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 10,
                letterSpacing: "0.15em",
                color: "rgba(255,255,255,0.25)",
                textTransform: "uppercase",
                marginBottom: 10,
              }}>
                ✏️ Notes
              </div>
              <NotesPanel
                theme={theme}
                startDate={startDate}
                endDate={effectiveEnd}
                notes={notes}
                setNotes={setNotes}
                dayNotes={dayNotes}
                setDayNotes={setDayNotes}
              />
            </div>
          </div>

          {/* Footer */}
          <div style={{
            borderTop: "1px solid rgba(255,255,255,0.06)",
            padding: "12px 28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 8,
          }}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", fontFamily: "'DM Mono', monospace" }}>
              Drag to select · Click hero to toggle info
            </div>
            <button
              onClick={() => { setStartDate(null); setEndDate(null); }}
              style={{
                background: "transparent",
                border: `1px solid rgba(255,255,255,0.1)`,
                color: "rgba(255,255,255,0.4)",
                fontFamily: "'DM Mono', monospace",
                fontSize: 10,
                padding: "5px 12px",
                borderRadius: 6,
                cursor: "pointer",
                letterSpacing: "0.08em",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => { e.target.style.borderColor = theme.accent + "88"; e.target.style.color = theme.accent; }}
              onMouseLeave={e => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.color = "rgba(255,255,255,0.4)"; }}
            >
              Clear Selection
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
