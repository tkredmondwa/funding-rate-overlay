# funding-rate-overlay
# Funding Rate Overlay for TradingView

This project is a lightweight Chrome extension that displays **live Binance funding rates** directly on TradingView charts.

## 🧩 What It Does
- Detects the current symbol on TradingView via DOM parsing
- Fetches the live funding rate from Binance using a tiny local server
- Displays a floating overlay with:
  - Funding rate
  - Countdown to next update
  - Visual warnings for squeeze risk

## 🔒 Privacy & Safety
- No user data is collected or stored
- No login or API keys required
- No ads or affiliate links
- All logic is client-side + open

## 📂 Folders
- `extension/` – The Chrome extension (manifest + overlay script)
- `funding-server/` – Python Flask server that fetches funding data from Binance

## 🔧 How to Run Locally
1. Clone the repo
2. `cd funding-server && pip install -r requirements.txt`
3. Run: `python funding_server.py`
4. Load `extension/` into Chrome as an unpacked extension

## 🔗 Exchange Support
Currently supports **Binance** only (more to come).

---


