function getSymbol() {
    try {
        const fullTitle = document.querySelector('div[data-symbol]');
        if (fullTitle) {
            const rawSymbol = fullTitle.getAttribute('data-symbol');
            if (rawSymbol) return rawSymbol.replace('.P', '').split(':').pop();
        }

        const titleElements = document.querySelectorAll('div[class*="js-button-text"]');
        for (const elem of titleElements) {
            const text = elem.innerText;
            if (text && text.includes('USDT')) {
                const symbol = text.replace('.P', '').trim();
                return symbol;
            }
        }

        return null;
    } catch (error) {
        console.error("❌ Symbol detection failed:", error);
        return null;
    }
}

async function fetchFunding(symbol) {
    try {
        const res = await fetch(`https://web-production-6f9bc.up.railway.app/funding/${symbol}`);
        const data = await res.json();
        return data;
    } catch (e) {
        console.error("❌ Funding fetch error:", e);
        return null;
    }
}

function formatCountdown(ms) {
    const totalSec = Math.max(0, Math.floor(ms / 1000));
    const hrs = String(Math.floor(totalSec / 3600)).padStart(2, '0');
    const min = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
    const sec = String(totalSec % 60).padStart(2, '0');
    return `${hrs}h ${min}m ${sec}s`;
}

function removeOld() {
    const old = document.getElementById('funding-widget');
    if (old) old.remove();
}

function createPulseStyle() {
    if (document.getElementById('pulse-style')) return;

    const style = document.createElement('style');
    style.id = 'pulse-style';
    style.innerHTML = `
    @keyframes pulse {
        0% { box-shadow: 0 0 8px rgba(255, 255, 255, 0.4); }
        50% { box-shadow: 0 0 16px rgba(255, 255, 255, 0.8); }
        100% { box-shadow: 0 0 8px rgba(255, 255, 255, 0.4); }
    }`;
    document.head.appendChild(style);
}

function getWarningMessage(rate) {
    const abs = Math.abs(rate);
    if (abs < 0.0002) return '🟢 Neutral';
    if (rate > 0.0005) return '⚠️ High Longs (Squeeze Risk)';
    if (rate < -0.0005) return '⚠️ High Shorts (Squeeze Risk)';
    return '🟡 Mild Imbalance';
}

function createWidget(symbol, fundingRate, nextFundingTime) {
    createPulseStyle();

    removeOld();

    const container = document.createElement('div');
    container.id = 'funding-widget';
    container.style.position = 'fixed';
    container.style.top = '20px';
    container.style.left = '50%';
    container.style.transform = 'translateX(-50%)';
    container.style.background = '#111';
    container.style.border = '2px solid #444';
    container.style.color = 'white';
    container.style.padding = '10px 20px';
    container.style.borderRadius = '10px';
    container.style.fontSize = '13px';
    container.style.fontFamily = 'Arial, sans-serif';
    container.style.zIndex = '9999';
    container.style.textAlign = 'center';
    container.style.lineHeight = '1.6';

    const percent = fundingRate * 100;
    const formattedRate = percent < 0.1 ? percent.toFixed(4) : percent.toFixed(2);
    const warning = getWarningMessage(fundingRate);

    if (Math.abs(fundingRate) >= 0.0005) {
        container.style.animation = 'pulse 2s infinite';
        container.style.borderColor = '#ff4d4d';
    }

    container.innerHTML = `
        <div><b>${symbol}</b></div>
        <div>Funding Rate: <span style="color:${fundingRate > 0 ? '#00e676' : '#ff5252'}">${formattedRate}%</span></div>
        <div id="countdown">Next Rate In: ...</div>
        <div style="margin-top: 5px">${warning}</div>
    `;

    document.body.appendChild(container);

    // Countdown updater
    const countdownEl = container.querySelector('#countdown');
    const updateCountdown = () => {
        const msLeft = nextFundingTime - Date.now();
        countdownEl.innerText = `Next Rate In: ${formatCountdown(msLeft)}`;
    };
    updateCountdown();
    const interval = setInterval(() => {
        if (!document.body.contains(container)) clearInterval(interval);
        else updateCountdown();
    }, 1000);
}

async function run() {
    const symbol = getSymbol();
    if (!symbol) return;

    const data = await fetchFunding(symbol);
    if (!data || !data.fundingRate) return;

    createWidget(symbol, data.fundingRate, data.nextFundingTime);
}

// --- First run and periodic update ---
setTimeout(run, 3000);
setInterval(run, 15000);
