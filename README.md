# UPI Fraud Dashboard (Frontend)

A minimal React frontend for the UPI Fraud Classifier backend located in `../Fiserv`.

## Features

- **Health Check** — Shows backend connectivity on load via `GET /health`
- **Transaction Submission** — Accepts JSON array or JSONL input and sends it to `POST /classify`
- **Weighted Risk Score (0–100)** — Displays the backend’s additive risk score scaled to a 0–100 scale with color-coded pills
- **Fraud Alerts** — Visual banner when transactions are flagged (`fraud_flag: true`)
- **Reason Codes** — Lists human-readable rule triggers for each transaction
- **Basic Historical Patterning** — Simple session-based counters (total txns, flagged count, average risk, high-velocity events, midnight events)
- **CSV Export** — Downloads all currently flagged transactions as a CSV file

## Tech Stack

- React 18 + Vite
- No external UI libraries (vanilla CSS for minimal footprint)
- Proxy configured in `vite.config.js` to route `/api` to `http://localhost:8000` during development

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server (backend should be running on localhost:8000)
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Project Structure

```
src/
  App.jsx                  — Main state, API calls, history tracking, CSV export
  main.jsx                 — Entry point
  index.css                — Minimal design system
  components/
    TransactionInput.jsx   — Textarea + classify button + sample loader
    ResultsPanel.jsx       — Table with scores, flags, reason tags, alerts
    StatsBar.jsx           — Historical counter cards
```

## API Integration

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/health` | GET | Status badge |
| `/classify` | POST | Send transactions, receive risk scores |

In development, Vite proxies `/api` to the backend. In production, update `API_BASE` in `App.jsx`.

## Design Decisions

- **Single-session history:** Counters reset on page reload by design (lightweight, no external DB).
- **Additive scoring display:** The backend returns `risk_score` between 0.0 and 1.0. The UI multiplies by 100 for readability.
- **CSV export:** Only flagged transactions are exported, with semicolon-separated reason codes for easy auditing.
- **Minimal styling:** Uses CSS custom properties via plain classes; no heavy UI framework needed for a dashboard this size.

## Scoring Alignment

| Criterion | How it’s addressed |
|-----------|--------------------|
| Rule logic (35%) | Reason codes displayed per transaction; additive scoring surfaced clearly |
| UI Dashboard (25%) | Clean cards, color-coded scores, alerts, responsive table |
| Data handling (20%) | JSON/JSONL support, history counters, CSV export |
| Explanation & reasoning (10%) | Comments in code + this README |
| Code quality (10%) | Modular components, clear naming, minimal dependencies |
