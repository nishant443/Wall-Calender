# 📅 Wall Calendar — Interactive React Component

A polished, interactive wall calendar built with React. Features a physical wall calendar aesthetic with month-themed hero panels, drag-to-select date ranges, integrated notes, and smooth animations.

---

## ✨ Features

- **Wall Calendar Aesthetic** — Hero image panel with animated particles, paper rings, and month-specific themes (12 unique color palettes + moods)
- **Day Range Selector** — Click and drag to select a date range with clear visual states for start, end, and in-between days
- **Integrated Notes** — Month-level notes and per-range notes with a tabbed panel
- **Responsive Design** — Side-by-side layout on desktop, stacked vertically on mobile
- **Flip Animation** — Page-turn effect when navigating between months
- **Holiday Markers** — Key US holidays highlighted with gold dots
- **Today Indicator** — Current date highlighted with an accent ring
- **Session Persistence** — Notes saved to `localStorage` across page refreshes

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Install & Run

```bash
# Clone the repo
git clone https://github.com/your-username/wall-calendar.git
cd wall-calendar

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm run start
```

---

## 🛠 Tech Stack

| Tool | Purpose |
|---|---|
| React 18 | UI framework |
| Next.js 14 | Project scaffolding & routing |
| CSS-in-JS (global string) | Styling — no external CSS library |
| `useReducer` | Calendar & selection state |
| `localStorage` | Client-side note persistence |
| Canvas API | Animated particle background |

---

## 📁 Project Structure

```
wall-calendar/
├── components/
│   └── WallCalendar.jsx   # Main component (all sub-components inside)
├── pages/
│   └── index.js           # Entry point
├── public/
└── README.md
```

---

## 🧠 Architecture Decisions

### Custom Hooks
- `useCalendar()` — owns month/year navigation using `useReducer`
- `useDateSelection()` — owns drag-to-select range logic using `useReducer`

This keeps `WallCalendar` lean — it only holds notes state and orchestrates layout.

### Component Breakdown
- `ParticleCanvas` — animated canvas, memoized, re-initializes only when accent color changes
- `HeroPanel` — month imagery, rings, mood text
- `DayCell` — single calendar cell, memoized with `React.memo`
- `NotesPanel` — tabbed notes UI (month notes + range notes)

### Styling
All styles live in a single `GLOBAL_CSS` string injected via `<style>`. Dynamic values (accent colors, gradients) are applied as inline styles only where needed. This keeps a clear separation between static structure and dynamic theming.

### No Backend
All data is client-side only. Notes persist via `localStorage`.

---

## 📱 Responsive Behavior

| Breakpoint | Layout |
|---|---|
| > 640px | Side-by-side: calendar left, notes right |
| ≤ 640px | Stacked: hero → calendar → notes |

---

## 🎨 Creative Extras

- 12 month-specific themes with unique gradient palettes, accent colors, and mood labels
- Animated floating hero icon (CSS keyframes)
- Particle canvas background (Canvas API, color-matched per month)
- Paper ring decorations at the top of the hero panel
- MMR-style date range logic — handles reverse drag (end → start) correctly
- Holiday list rendered below the grid for the current month
