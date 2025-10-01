#!/usr/bin/env node

/**
 * Build script to create a single-file index.html from modular source
 * This combines all JS modules and CSS into one file for GitHub Pages
 */

const fs = require('fs');
const path = require('path');

// Read all source files
const cssContent = fs.readFileSync('src/css/styles.css', 'utf8');
const audioVisualizerJs = fs.readFileSync('src/js/AudioVisualizer.js', 'utf8');
const spaceThemeJs = fs.readFileSync('src/js/themes/SpaceTheme.js', 'utf8');
const dysonSphereThemeJs = fs.readFileSync('src/js/themes/DysonSphereTheme.js', 'utf8');
const gameOfLifeJs = fs.readFileSync('src/js/effects/GameOfLife.js', 'utf8');
const neonBannerJs = fs.readFileSync('src/js/effects/NeonBanner.js', 'utf8');
const mainJs = fs.readFileSync('src/js/main.js', 'utf8');
const indexCdnHtml = fs.readFileSync('index-cdn.html', 'utf8');

// Remove export statements and convert to global classes
function convertModuleToGlobal(code, className) {
    // Remove export statements
    code = code.replace(/export\s+default\s+/g, '');
    code = code.replace(/export\s+{[^}]+}/g, '');
    code = code.replace(/export\s+class/g, 'class');

    // Remove import statements
    code = code.replace(/import\s+.*?from\s+['"].*?['"];?\s*/g, '');
    code = code.replace(/import\s+['"].*?['"];?\s*/g, '');

    // Make class globally accessible
    if (className) {
        code = code.replace(new RegExp(`class\\s+${className}`), `window.${className} = class ${className}`);
    }

    return code;
}

// Convert modules to global scope
const spaceThemeGlobal = convertModuleToGlobal(spaceThemeJs, 'SpaceTheme');
const dysonSphereThemeGlobal = convertModuleToGlobal(dysonSphereThemeJs, 'DysonSphereTheme');
const gameOfLifeGlobal = convertModuleToGlobal(gameOfLifeJs, 'GameOfLife');
const neonBannerGlobal = convertModuleToGlobal(neonBannerJs, 'NeonBanner');
const audioVisualizerGlobal = convertModuleToGlobal(audioVisualizerJs, 'AudioVisualizer');

// Convert main.js
let mainGlobal = mainJs;
mainGlobal = mainGlobal.replace(/import\s+.*?from\s+['"].*?['"];?\s*/g, '');
mainGlobal = mainGlobal.replace(/const audioViz = new AudioVisualizer\(\);/, 'const audioViz = new window.AudioVisualizer();');

// Combine all JavaScript
const combinedJs = `
        // SpaceTheme
        ${spaceThemeGlobal}

        // DysonSphereTheme
        ${dysonSphereThemeGlobal}

        // GameOfLife
        ${gameOfLifeGlobal}

        // NeonBanner
        ${neonBannerGlobal}

        // AudioVisualizer
        ${audioVisualizerGlobal}

        // Main initialization
        ${mainGlobal}
`;

// Build the complete HTML
let html = indexCdnHtml;

// Replace the external CSS link with inline styles
html = html.replace(
    '<link rel="stylesheet" href="src/css/styles.css">',
    `<style>\n${cssContent}\n    </style>`
);

// Replace the module script with inline script
html = html.replace(
    '<script type="module" src="src/js/main.js"></script>',
    `<script>\n${combinedJs}\n    </script>`
);

// Remove import map since we're not using modules
html = html.replace(/<script type="importmap">[\s\S]*?<\/script>\s*/g, '');

// Write the combined file
fs.writeFileSync('index.html', html);

console.log('✅ Built index.html successfully!');
console.log('📦 Combined all modules into a single file for GitHub Pages');