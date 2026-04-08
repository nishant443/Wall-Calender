import { useState, useEffect, useRef, useCallback, useReducer, memo } from "react";

// ─── Month themes ────────────────────────────────────────────────────────────
const MONTH_THEMES = [
  { name: "January",   emoji: "❄️",  gradient: ["#0f2027","#203a43","#2c5364"], accent: "#7ee8fa", mood: "Winter Silence",   icon: "🏔️" },
  { name: "February",  emoji: "💝",  gradient: ["#4b1248","#f10711","#c81d77"], accent: "#ff8cc8", mood: "Valentines Bloom", icon: "🌹" },
  { name: "March",     emoji: "🌿",  gradient: ["#134e5e","#71b280","#2b7a0b"], accent: "#b5ead7", mood: "Spring Awakening", icon: "🌱" },
  { name: "April",     emoji: "🌸",  gradient: ["#614385","#516395","#e96c7c"], accent: "#ffd6e7", mood: "Cherry Blossoms",  icon: "🌸" },
  { name: "May",       emoji: "☀️",  gradient: ["#f7971e","#ffd200","#f6a623"], accent: "#fff9c4", mood: "Golden Mornings", icon: "🌻" },
  { name: "June",      emoji: "🌊",  gradient: ["#1a6b8a","#00b4d8","#48cae4"], accent: "#90e0ef", mood: "Ocean Breeze",    icon: "🏖️" },
  { name: "July",      emoji: "🔥",  gradient: ["#c94b4b","#4b134f","#ff6b35"], accent: "#ffd166", mood: "Summer Blaze",   icon: "🎆" },
  { name: "August",    emoji: "🌅",  gradient: ["#f77062","#fe5196","#f9a825"], accent: "#ffe082", mood: "Amber Dusk",     icon: "🌄" },
  { name: "September", emoji: "🍂",  gradient: ["#8b4513","#d2691e","#cd853f"], accent: "#ffcc80", mood: "Harvest Gold",   icon: "🍁" },
  { name: "October",   emoji: "🎃",  gradient: ["#1a1a2e","#16213e","#e94560"], accent: "#ff6b6b", mood: "Haunted Nights", icon: "🕸️" },
  { name: "November",  emoji: "🦃",  gradient: ["#2c3e50","#4a5568","#8b7355"], accent: "#d4a76a", mood: "Misty Evenings", icon: "🍂" },
  { name: "December",  emoji: "🎄",  gradient: ["#0a3d62","#1e3c72","#c0392b"], accent: "#ffd700", mood: "Festive Magic",  icon: "⭐" },
];

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const HOLIDAYS = {
  "1-1":   "New Year's Day",    "2-14":  "Valentine's Day",
  "3-17":  "St. Patrick's Day", "7-4":   "Independence Day",
  "10-31": "Halloween",         "11-11": "Veterans Day",
  "12-25": "Christmas",         "12-31": "New Year's Eve",
  "1-15":  "MLK Jr. Day",
};

// ─── Pure helpers ─────────────────────────────────────────────────────────────
function getDaysInMonth(year, month) { return new Date(year, month + 1, 0).getDate(); }
function getFirstDayOfMonth(year, month) { return new Date(year, month, 1).getDay(); }
function isSameDay(d1, d2) {
  if (!d1 || !d2) return false;
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth()    === d2.getMonth() &&
         d1.getDate()     === d2.getDate();
}
function isInRange(date, start, end) {
  if (!start || !end || !date) return false;
  const s = start < end ? start : end;
  const e = start < end ? end   : start;
  return date > s && date < e;
}
function formatDate(date) {
  if (!date) return "";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function buildCells(year, month) {
  const firstDay    = getFirstDayOfMonth(year, month);
  const daysInMonth = getDaysInMonth(year, month);
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}
function getRangeKey(start, end) {
  if (!start || !end) return null;
  const s = start < end ? start : end;
  const e = start < end ? end   : start;
  return `${formatDate(s)} → ${formatDate(e)}`;
}
function getDayCount(start, end) {
  if (!start || !end) return 1;
  const s = start < end ? start : end;
  const e = start < end ? end   : start;
  return Math.round((e - s) / 86400000) + 1;
}

// ─── Custom hooks ─────────────────────────────────────────────────────────────

/**
 * useCalendar — manages month/year navigation and flip animation
 */
function calendarReducer(state, action) {
  switch (action.type) {
    case "NAVIGATE": {
      const dir = action.dir;
      let { month, year } = state;
      month += dir;
      if (month < 0)  { month = 11; year -= 1; }
      if (month > 11) { month = 0;  year += 1; }
      return { ...state, month, year, flipping: true };
    }
    case "FLIP_DONE":
      return { ...state, flipping: false };
    case "TOGGLE_INFO":
      return { ...state, showInfo: !state.showInfo };
    default:
      return state;
  }
}

function useCalendar() {
  const today = new Date();
  const [state, dispatch] = useReducer(calendarReducer, {
    month:    today.getMonth(),
    year:     today.getFullYear(),
    flipping: false,
    showInfo: false,
  });

  const navigate = useCallback((dir) => {
    dispatch({ type: "NAVIGATE", dir });
    setTimeout(() => dispatch({ type: "FLIP_DONE" }), 300);
  }, []);

  const toggleInfo = useCallback(() => dispatch({ type: "TOGGLE_INFO" }), []);

  return { ...state, navigate, toggleInfo, today };
}

/**
 * useDateSelection — manages drag-to-select range
 */
function selectionReducer(state, action) {
  switch (action.type) {
    case "START":
      return { ...state, startDate: action.date, endDate: null, selecting: true };
    case "MOVE":
      return state.selecting ? { ...state, endDate: action.date, hoverDate: action.date } : { ...state, hoverDate: action.date };
    case "END":
      return { ...state, selecting: false, endDate: action.date };
    case "CLEAR":
      return { ...state, startDate: null, endDate: null, hoverDate: null, selecting: false };
    default:
      return state;
  }
}

function useDateSelection() {
  const [state, dispatch] = useReducer(selectionReducer, {
    startDate: null,
    endDate:   null,
    hoverDate: null,
    selecting: false,
  });

  const handleMouseDown  = useCallback((date) => { if (date) dispatch({ type: "START", date }); }, []);
  const handleMouseEnter = useCallback((date) => { if (date) dispatch({ type: "MOVE",  date }); }, []);
  const handleMouseUp    = useCallback((date) => { if (date) dispatch({ type: "END",   date }); }, []);
  const clearSelection   = useCallback(()     =>            dispatch({ type: "CLEAR"       }), []);

  // Release selection on global mouseup
  useEffect(() => {
    const up = () => dispatch({ type: "END", date: state.endDate });
    window.addEventListener("mouseup", up);
    return () => window.removeEventListener("mouseup", up);
  }, [state.endDate]);

  const effectiveEnd = state.selecting ? state.hoverDate : state.endDate;

  return { ...state, effectiveEnd, handleMouseDown, handleMouseEnter, handleMouseUp, clearSelection };
}

// ─── ParticleCanvas ───────────────────────────────────────────────────────────
const ParticleCanvas = memo(function ParticleCanvas({ accent }) {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const particles = Array.from({ length: 28 }, () => ({
      x:       Math.random() * canvas.width,
      y:       Math.random() * canvas.height,
      r:       Math.random() * 3 + 1,
      dx:      (Math.random() - 0.5) * 0.4,
      dy:      (Math.random() - 0.5) * 0.4,
      opacity: Math.random() * 0.4 + 0.1,
    }));

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = accent + Math.floor(p.opacity * 255).toString(16).padStart(2, "0");
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width)  p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height)  p.dy *= -1;
      });
      animRef.current = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [accent]);

  return <canvas ref={canvasRef} className="particle-canvas" />;
});

// ─── HeroPanel ────────────────────────────────────────────────────────────────
const HeroPanel = memo(function HeroPanel({ theme, year, onFlip }) {
  return (
    <div
      className="hero-panel"
      style={{ background: `linear-gradient(135deg, ${theme.gradient[0]}, ${theme.gradient[1]}, ${theme.gradient[2]})` }}
      onClick={onFlip}
      title="Click to toggle info"
    >
      <ParticleCanvas accent={theme.accent} />

      <div className="hero-rings">
        {[0,1,2,3,4].map(i => <div key={i} className="hero-ring" />)}
      </div>

      <div className="hero-icon">{theme.icon}</div>

      <div className="hero-month-name">{theme.name}</div>

      <div className="hero-mood" style={{ color: theme.accent }}>
        {theme.mood} · {year}
      </div>

      <div className="hero-line" style={{ background: `linear-gradient(90deg, transparent, ${theme.accent}, transparent)` }} />
    </div>
  );
});

// ─── DayCell ─────────────────────────────────────────────────────────────────
const DayCell = memo(function DayCell({
  day, date, theme,
  isStart, isEnd, inRange, isToday,
  holiday, onMouseDown, onMouseEnter, onMouseUp,
}) {
  const isSelected   = isStart || isEnd;
  const highlighted  = isSelected || inRange;

  const cellClass = [
    "day-cell",
    !day      ? "empty"          : "",
    isStart   ? "selected-start" : "",
    isEnd     ? "selected-end"   : "",
    inRange   ? "in-range"       : "",
    isToday && !isSelected ? "today-cell" : "",
  ].filter(Boolean).join(" ");

  const bgColor = isSelected
    ? theme.accent
    : inRange
    ? theme.accent + "33"
    : "transparent";

  const textColor = isSelected
    ? "#111"
    : isToday
    ? theme.accent
    : inRange
    ? "#fff"
    : "rgba(255,255,255,0.85)";

  const fontWeight = isSelected ? 800 : isToday ? 700 : 400;

  return (
    <div
      className={cellClass}
      style={{ background: bgColor }}
      onMouseDown={() => onMouseDown(date)}
      onMouseEnter={() => onMouseEnter(date)}
      onMouseUp={()    => onMouseUp(date)}
      onTouchStart={() => onMouseDown(date)}
      onTouchEnd={()   => onMouseUp(date)}
      data-date={date ? date.toISOString() : ""}
      title={holiday || ""}
    >
      {day && (
        <>
          {isToday && !isSelected && (
            <div className="today-ring" style={{ borderColor: theme.accent }} />
          )}

          <span
            className="day-number"
            style={{ color: textColor, fontWeight }}
          >
            {day}
          </span>

          {holiday && (
            <div
              className="day-dot"
              style={{ background: isSelected ? "#111" : "#ffd700" }}
            />
          )}
        </>
      )}
    </div>
  );
});

// ─── NotesPanel ───────────────────────────────────────────────────────────────
const NotesPanel = memo(function NotesPanel({
  theme, startDate, effectiveEnd,
  notes, setNotes, dayNotes, setDayNotes,
}) {
  const [activeTab, setActiveTab] = useState("month");

  const rangeKey  = getRangeKey(startDate, effectiveEnd);
  const rangeNote = rangeKey ? (dayNotes[rangeKey] || "") : "";
  const isSingleDay = startDate && effectiveEnd && isSameDay(startDate, effectiveEnd);

  const handleRangeNote = useCallback((val) => {
    if (!rangeKey) return;
    setDayNotes(prev => ({ ...prev, [rangeKey]: val }));
  }, [rangeKey, setDayNotes]);

  const tabStyle = (tab) => ({
    color:       activeTab === tab ? theme.accent : "rgba(255,255,255,0.5)",
    background:  activeTab === tab ? theme.accent + "22" : "transparent",
    borderBottom: activeTab === tab ? `2px solid ${theme.accent}` : "2px solid transparent",
  });

  const textareaStyle = { border: `1px solid ${theme.accent}33` };

  return (
    <div className="notes-panel">
      {/* Tabs */}
      <div className="notes-tabs">
        {["month", "date"].map(tab => (
          <button
            key={tab}
            className="notes-tab"
            style={tabStyle(tab)}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "month" ? "📝 Month" : "📅 Date"}
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="notes-body">
        {activeTab === "month" ? (
          <>
            <div className="notes-hint">General notes for this month</div>
            <textarea
              className="notes-textarea"
              style={textareaStyle}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder={`Jot down plans, goals, or thoughts for ${MONTH_THEMES[new Date().getMonth()].name}…`}
              onFocus={e  => { e.target.style.borderColor = theme.accent + "88"; }}
              onBlur={e   => { e.target.style.borderColor = theme.accent + "33"; }}
            />
          </>
        ) : rangeKey ? (
          <>
            <div className="range-pill" style={{ color: theme.accent }}>
              {isSingleDay ? "📌 " : "📅 "}
              {rangeKey}
            </div>
            <textarea
              className="notes-textarea"
              style={{ ...textareaStyle, minHeight: 100 }}
              value={rangeNote}
              onChange={e => handleRangeNote(e.target.value)}
              placeholder={isSingleDay ? "Add notes for this date…" : "Add notes for this date range…"}
              onFocus={e  => { e.target.style.borderColor = theme.accent + "88"; }}
              onBlur={e   => { e.target.style.borderColor = theme.accent + "33"; }}
            />
            {rangeNote && <div className="notes-hint" style={{ color: theme.accent + "aa", marginTop: 8 }}>✓ Notes saved</div>}
          </>
        ) : (
          <div className="empty-range">
            <div className="empty-range-icon">🖱️</div>
            <div className="empty-range-text">Select a date on the calendar to add notes</div>
          </div>
        )}
      </div>

      {/* Saved date notes */}
      {Object.keys(dayNotes).length > 0 && (
        <div className="saved-notes">
          <div className="saved-notes-title">SAVED NOTES</div>
          {Object.entries(dayNotes).filter(([, v]) => v).map(([k, v]) => (
            <div key={k} style={{ marginBottom: 8, paddingBottom: 8, borderBottom: `1px solid ${theme.accent}22` }}>
              <div className="saved-note-key" style={{ color: theme.accent, fontSize: 10 }}>📌 {k}</div>
              <div className="saved-note-val">{v.slice(0, 60)}{v.length > 60 ? "…" : ""}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

// ─── Main WallCalendar ────────────────────────────────────────────────────────
export default function WallCalendar() {
  // Custom hooks — clean state separation
  const { month, year, flipping, showInfo, navigate, toggleInfo, today } = useCalendar();
  const {
    startDate, effectiveEnd,
    handleMouseDown, handleMouseEnter, handleMouseUp, clearSelection,
  } = useDateSelection();

  // Notes state (separate concern)
  const [notes,    setNotes]    = useState("");
  const [dayNotes, setDayNotes] = useState({});

  const theme        = MONTH_THEMES[month];
  const cells        = buildCells(year, month);
  const daysInMonth  = getDaysInMonth(year, month);
  const firstDay     = getFirstDayOfMonth(year, month);
  const rangeKey     = getRangeKey(startDate, effectiveEnd);

  // ─── localStorage persistence ─────────────────────────────────────────────
  // Load notes from localStorage on mount and month change
  useEffect(() => {
    const monthNotesKey = `cal-notes-${year}-${month}`;
    const dayNotesKey = `cal-dayNotes-${year}-${month}`;
    
    const savedMonthNotes = localStorage.getItem(monthNotesKey);
    const savedDayNotes = localStorage.getItem(dayNotesKey);
    
    if (savedMonthNotes) setNotes(savedMonthNotes);
    if (savedDayNotes) setDayNotes(JSON.parse(savedDayNotes));
  }, [year, month]);

  // Save month notes to localStorage
  useEffect(() => {
    const monthNotesKey = `cal-notes-${year}-${month}`;
    if (notes) {
      localStorage.setItem(monthNotesKey, notes);
    } else {
      localStorage.removeItem(monthNotesKey);
    }
  }, [notes, year, month]);

  // Save day notes to localStorage
  useEffect(() => {
    const dayNotesKey = `cal-dayNotes-${year}-${month}`;
    if (Object.keys(dayNotes).length > 0) {
      localStorage.setItem(dayNotesKey, JSON.stringify(dayNotes));
    } else {
      localStorage.removeItem(dayNotesKey);
    }
  }, [dayNotes, year, month]);

  // Sync CSS custom property for accent (used by clear-btn hover)
  useEffect(() => {
    document.documentElement.style.setProperty("--accent-color", theme.accent);
  }, [theme.accent]);

  return (
    <>
      <div style={{ width: "100%", maxWidth: 900, margin: "0 auto", padding: "clamp(12px, 3vw, 32px)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="cal-card">

          {/* ── Hero ── */}
          <HeroPanel theme={theme} year={year} onFlip={toggleInfo} />

          {/* ── Info overlay ── */}
          {showInfo && (
            <div
              className="info-overlay"
              style={{ background: `linear-gradient(135deg, ${theme.gradient[0]}ee, ${theme.gradient[2]}ee)`, borderTop: `1px solid ${theme.accent}33` }}
            >
              <div style={{ flex: 1, minWidth: 200 }}>
                <div className="info-title">{theme.emoji} {theme.name} {year}</div>
                <div className="info-meta" style={{ color: theme.accent }}>
                  {daysInMonth} days · Starts {DAYS[firstDay]}
                </div>
              </div>
              {startDate && (
                <div className="info-range-pill" style={{ color: theme.accent }}>
                  {rangeKey && !isSameDay(startDate, effectiveEnd)
                    ? rangeKey
                    : formatDate(startDate)
                  }
                </div>
              )}
            </div>
          )}

          {/* ── Body ── */}
          <div className="cal-body">

            {/* Calendar section */}
            <div className="cal-main">

              {/* Navigation */}
              <div className="nav-row">
                <button className="nav-btn" onClick={() => navigate(-1)}>‹</button>

                <div className="nav-title">
                  <div className="nav-month-label">{theme.name} {year}</div>
                  {startDate && (
                    <div className="nav-count" style={{ color: theme.accent }}>
                      {effectiveEnd && !isSameDay(startDate, effectiveEnd)
                        ? `${getDayCount(startDate, effectiveEnd)} days selected`
                        : "1 day selected"
                      }
                    </div>
                  )}
                </div>

                <button className="nav-btn" onClick={() => navigate(1)}>›</button>
              </div>

              {/* Day headers */}
              <div className="day-headers">
                {DAYS.map(d => (
                  <div
                    key={d}
                    className="day-header"
                    style={{
                      color: d === "Sun"
                        ? "#ff8080"
                        : d === "Sat"
                        ? "#80aaff"
                        : "rgba(255,255,255,0.35)",
                    }}
                  >
                    {d}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div
                className={`calendar-wrapper ${flipping ? "flipping" : "entering"}`}
                key={`${year}-${month}`}
              >
                <div className="calendar-grid">
                  {cells.map((day, idx) => {
                    const date       = day ? new Date(year, month, day) : null;
                    const holidayKey = date ? `${date.getMonth() + 1}-${date.getDate()}` : "";
                    const holiday    = HOLIDAYS[holidayKey] || null;

                    // Determine start/end correctly regardless of selection direction
                    const selStart = startDate && effectiveEnd && startDate > effectiveEnd ? effectiveEnd : startDate;
                    const selEnd   = startDate && effectiveEnd && startDate > effectiveEnd ? startDate   : effectiveEnd;

                    return (
                      <DayCell
                        key={idx}
                        day={day}
                        date={date}
                        theme={theme}
                        isStart={isSameDay(date, selStart)}
                        isEnd={isSameDay(date, selEnd)}
                        inRange={isInRange(date, startDate, effectiveEnd)}
                        isToday={isSameDay(date, today)}
                        holiday={holiday}
                        onMouseDown={handleMouseDown}
                        onMouseEnter={handleMouseEnter}
                        onMouseUp={handleMouseUp}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Legend */}
              <div className="legend">
                {[
                  { color: theme.accent,        border: null,                         label: "Selected" },
                  { color: theme.accent + "44",  border: null,                         label: "Range"    },
                  { color: "transparent",        border: `2px solid ${theme.accent}`, label: "Today"    },
                  { color: "#ffd700",            border: null,                         label: "Holiday"  },
                ].map(({ color, border, label }) => (
                  <div key={label} className="legend-item">
                    <div className="legend-dot" style={{ background: color, border: border || "none" }} />
                    {label}
                  </div>
                ))}
              </div>

              {/* Holiday list */}
              {cells.some(day => day && HOLIDAYS[`${month + 1}-${day}`]) && (
                <div className="holiday-box">
                  {Object.entries(HOLIDAYS)
                    .filter(([k]) => parseInt(k.split("-")[0]) === month + 1)
                    .map(([k, v]) => (
                      <div key={k} className="holiday-row">
                        🎉 {k.split("-")[1]} — {v}
                      </div>
                    ))
                  }
                </div>
              )}
            </div>

            {/* Notes panel */}
            <div className="cal-notes-col">
              <div className="notes-label">✏️ Notes</div>
              <NotesPanel
                theme={theme}
                startDate={startDate}
                effectiveEnd={effectiveEnd}
                notes={notes}
                setNotes={setNotes}
                dayNotes={dayNotes}
                setDayNotes={setDayNotes}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="cal-footer">
            <div className="cal-footer-hint">Drag to select · Click hero to toggle info</div>
            <button className="clear-btn" onClick={clearSelection}>
              Clear Selection
            </button>
          </div>

        </div>
      </div>
    </>
  );
}
