const root = document.documentElement;
const themeButton = document.getElementById('themeButton');

async function parseCSV() {
    let palettes = localStorage.getItem('palettes');
    try {
        if (!palettes) {
            const url = window.location.hostname.includes('github.io')
                ? 'media/color-palettes.csv'
                : '/media/color-palettes.csv';

            const response = await fetch(url);
            const rawData = await response.text();
            const data = rawData.trim().split(/[,\n\r]+/);

            localStorage.setItem('palettes', JSON.stringify(data));
            palettes = JSON.stringify(data);
        }
    } catch (err) {
        console.error("Error:", err);
        localStorage.clear();
        return [];
    }
    return JSON.parse(palettes);
}

// adjustLightness created by Google Gemini
function adjustLightness(hex, amount) {
    // Convert hex to RGB
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);

    // Simple approach: adjust each channel
    // (A more accurate way involves HSL, but this works well for simple shades)
    r = Math.max(0, Math.min(255, r + amount));
    g = Math.max(0, Math.min(255, g + amount));
    b = Math.max(0, Math.min(255, b + amount));

    return [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

async function main() {
    const navEntries = performance.getEntriesByType('navigation');
    if (navEntries.length > 0 && navEntries[0].type === 'reload') {
        sessionStorage.removeItem('theme');
    }

    let theme = sessionStorage.getItem('theme');

    if (theme) {
        setColors(theme);
    }

    if (themeButton) {
        themeButton.addEventListener('click', () => applyPalette());
    }

    parseCSV();
}

async function applyPalette() {
    const colorPalettes = await parseCSV();
    const range = colorPalettes.length;

    let rand = Math.floor(Math.random() * (range));
    let palette = colorPalettes[rand];

    setColors(palette);
    sessionStorage.setItem('theme', palette);
}

function setColors(palette) {
    const bg = palette.substring(12, 18);
    const text = palette.substring(0, 6);
    const accent = palette.substring(6, 12);
    const visited = palette.substring(18, 24);

    const secondary = adjustLightness(palette.substring(12, 18), -40);

    root.style.setProperty('--bg-color', '#' + bg);
    root.style.setProperty('--text-color', '#' + text);
    root.style.setProperty('--accent-color', '#' + accent);
    root.style.setProperty('--visited-color', '#' + visited);
    root.style.setProperty('--secondary-color', '#' + secondary);
    console.log(
        bg,
        text,
        accent,
        visited,
        secondary
    )
}

main();