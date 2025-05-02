from flask import Flask, jsonify, make_response
import httpx
import asyncio
import os

app = Flask(__name__)

# --- Binance Futures API URL ---
BINANCE_URL = "https://fapi.binance.com/fapi/v1/premiumIndex"

# --- Fetch Funding Rate for a given symbol ---
async def fetch_funding_rate(symbol):
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(BINANCE_URL, params={"symbol": symbol})
            data = response.json()
            funding_rate = float(data["lastFundingRate"])
            return {
                "fundingRate": funding_rate,
                "indexPrice": float(data["indexPrice"]),
                "markPrice": float(data["markPrice"]),
                "nextFundingTime": int(data["nextFundingTime"])
            }
    except Exception as e:
        print(f"[ERROR] Fetching {symbol}: {e}")
        return None

# --- API Endpoint ---
@app.route("/funding/<symbol>")
def get_funding(symbol):
    funding_data = asyncio.run(fetch_funding_rate(symbol.upper()))
    if funding_data:
        response = make_response(jsonify(funding_data))
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type")
        response.headers.add("Access-Control-Allow-Methods", "GET")
        return response
    else:
        return jsonify({"error": f"Funding data not available for {symbol}"}), 404

# --- Run Flask ---
if __name__ == "__main__":
    print("🚀 Funding Server Running...")
    port = int(os.environ.get("PORT", 5002))  # fallback to 5002 if env var missing
    app.run(host="0.0.0.0", port=port)

