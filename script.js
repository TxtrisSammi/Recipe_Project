const root = document.documentElement;
const themeButton = document.getElementById('themeButton');

async function parseCSV() {
    let palettes = localStorage.getItem('palettes');
    if (palettes) return JSON.parse(palettes);

    try {
        // Use a relative path that works for both local and GitHub Pages
        const url = './media/color-palettes.csv'; 
        const response = await fetch(url);
        
        if (!response.ok) throw new Error("File not found");

        const rawData = await response.text();
        // Split and filter out any empty strings/whitespace
        const data = rawData.split(/[,\n\r]+/).map(s => s.trim()).filter(s => s.length > 0);

        localStorage.setItem('palettes', JSON.stringify(data));
        return data;
    } catch (err) {
        console.error("Fetch Error:", err);
        return [];
    }
}

function adjustLightness(hex, amount) {
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);

    r = Math.max(0, Math.min(255, r + amount));
    g = Math.max(0, Math.min(255, g + amount));
    b = Math.max(0, Math.min(255, b + amount));

    return [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

function setColors(palette) {
    if (!palette || palette.length < 24) return; // Safety check

    const text = palette.substring(0, 6);
    const accent = palette.substring(6, 12);
    const bg = palette.substring(12, 18);
    const visited = palette.substring(18, 24);
    const secondary = adjustLightness(bg, -40);

    root.style.setProperty('--bg-color', '#' + bg);
    root.style.setProperty('--text-color', '#' + text);
    root.style.setProperty('--accent-color', '#' + accent);
    root.style.setProperty('--visited-color', '#' + visited);
    root.style.setProperty('--secondary-color', '#' + secondary);
}

async function applyPalette() {
    const colorPalettes = await parseCSV();
    if (colorPalettes.length === 0) return;

    let rand = Math.floor(Math.random() * colorPalettes.length);
    let palette = colorPalettes[rand];

    setColors(palette);
    sessionStorage.setItem('theme', palette);
}

async function main() {
    // 1. Await the initial parse to ensure data exists
    await parseCSV();

    // 2. Clear theme on reload (Mobile browsers often preserve session longer)
    const navEntries = performance.getEntriesByType('navigation');
    if (navEntries.length > 0 && navEntries[0].type === 'reload') {
        sessionStorage.removeItem('theme');
    }

    let theme = sessionStorage.getItem('theme');
    if (theme) setColors(theme);

    if (themeButton) {
        themeButton.onclick = applyPalette; // More reliable than addEventListener in some mobile views
    }
}

main();