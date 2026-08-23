const fs = require('fs');
const path = require('path');

function fixCSS(platform) {
    const cssPath = path.join(__dirname, `../${platform}/css/style.css`);
    let css = fs.readFileSync(cssPath, 'utf8');

    // Remove old header and close-btn CSS block
    css = css.replace(/#emulator-header \{[\s\S]*?border-bottom: 1px solid #334155;\n\}/g, '');
    css = css.replace(/\.close-btn \{[\s\S]*?transition: background 0\.2s;\n\}/g, '');
    css = css.replace(/\.close-btn:hover \{[\s\S]*?\}\n/g, '');
    css = css.replace(/#modal-title \{[\s\S]*?\}\n/g, ''); // just in case

    // Append new responsive CSS
    const newCSS = `

#emulator-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 20px;
    background-color: #1e293b;
    border-bottom: 1px solid #334155;
    z-index: 100;
}

#modal-title {
    font-size: 1rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 65vw;
}

.close-btn {
    background: #ef4444; /* red-500 */
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 0.375rem;
    font-weight: bold;
    cursor: pointer;
    transition: background 0.2s;
    font-size: 0.75rem;
}

.close-btn:hover {
    background: #dc2626; /* red-600 */
}

/* Mobile Portrait optimizations */
@media (max-width: 600px) and (orientation: portrait) {
    #emulator-header {
        padding: 6px 10px;
    }
    #modal-title {
        font-size: 0.85rem;
    }
    .close-btn {
        padding: 4px 8px;
        font-size: 0.7rem;
    }
}

/* Mobile Landscape optimizations for maximum game size */
@media (max-height: 500px) and (orientation: landscape) {
    #emulator-header {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        background: linear-gradient(to bottom, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0) 100%);
        border: none;
        padding: 5px 15px;
        pointer-events: none; /* Let clicks pass through except buttons */
    }
    
    #emulator-header > * {
        pointer-events: auto; /* Re-enable clicks for title and close button */
    }

    #modal-title {
        font-size: 0.8rem;
        text-shadow: 1px 1px 3px black;
    }
    
    .close-btn {
        padding: 4px 10px;
        font-size: 0.65rem;
        box-shadow: 0 0 10px rgba(0,0,0,0.5);
    }
}
`;
    
    fs.writeFileSync(cssPath, css + newCSS);
}

fixCSS('snes');
fixCSS('arcade');
