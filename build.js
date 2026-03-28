// build.js
import fs from 'fs';
import path from 'path';
import babel from '@babel/core';

const srcDir = path.resolve('src');
const componentsDir = path.join(srcDir, 'components');
const pagesDir = path.join(srcDir, 'pages');
const servicesDir = path.join(srcDir, 'services');

const distDir = path.resolve('public');
if (!fs.existsSync(distDir)) fs.mkdirSync(distDir);

// Simple JSX to JS transpilation with babel
function transpile(code, filename) {
  return babel.transformSync(code, {
    filename,
    presets: [],
    plugins: [
      ['@babel/plugin-transform-react-jsx', { runtime: 'classic' }]
    ]
  }).code;
}

// Strip import/export statements to combine into a single file
function stripModules(code) {
  code = code.replace(/import\s+.*?\s+from\s+['"].*?['"];?\n/g, '');
  code = code.replace(/export\s+default\s+function\s+(\w+)/g, 'function $1');
  code = code.replace(/export\s+async\s+function\s+(\w+)/g, 'async function $1');
  return code;
}

const filesToBundle = [
  path.join(servicesDir, 'mockApi.js'),
  path.join(componentsDir, 'GlassHeader.jsx'),
  path.join(componentsDir, 'SearchBar.jsx'),
  path.join(componentsDir, 'AnswerCard.jsx'),
  path.join(componentsDir, 'SourceTag.jsx'),
  path.join(componentsDir, 'LoadingPulse.jsx'),
  path.join(pagesDir, 'SearchPage.jsx'),
  path.join(srcDir, 'App.jsx')
];

let bundledJs = `
const { useState, useEffect, useRef, useCallback } = React;
`;

for (const file of filesToBundle) {
  const isJsx = file.endsWith('.jsx');
  let code = fs.readFileSync(file, 'utf8');
  if (isJsx) {
    code = transpile(code, file);
  }
  code = stripModules(code);
  bundledJs += `\n/* --- ${path.basename(file)} --- */\n` + code;
}

bundledJs += `\n/* --- main.jsx --- */\n`;
bundledJs += `const root = ReactDOM.createRoot(document.getElementById('root'));\n`;
bundledJs += `root.render(React.createElement(React.StrictMode, null, React.createElement(App, null)));\n`;

// Read global CSS
const cssCode = fs.readFileSync(path.join(srcDir, 'index.css'), 'utf8');

// Combine into HTML
const reactUmd = fs.readFileSync('node_modules/react/umd/react.development.js', 'utf8');
const reactDomUmd = fs.readFileSync('node_modules/react-dom/umd/react-dom.development.js', 'utf8');

const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>NBU Document Intelligence</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
          },
          colors: {
            electric: '#007AFF',
            apple: {
              bg: '#F5F5F7',
              text: '#1D1D1F',
              secondary: '#86868B',
              border: '#D2D2D7',
            },
          },
          borderRadius: {
            'pill': '9999px',
            'card': '1.5rem',
          },
          boxShadow: {
            'apple': '0 2px 12px rgba(0, 0, 0, 0.04), 0 1px 4px rgba(0, 0, 0, 0.02)',
            'apple-hover': '0 4px 24px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)',
            'glow': '0 0 0 3px rgba(0, 122, 255, 0.3), 0 0 20px rgba(0, 122, 255, 0.15)',
          },
          animation: {
            'fade-in': 'fadeIn 0.6s ease-out',
            'fade-up': 'fadeUp 0.6s ease-out',
            'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
          },
          keyframes: {
            fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
            fadeUp: { '0%': { opacity: '0', transform: 'translateY(16px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
            pulseSoft: { '0%, 100%': { opacity: '0.4' }, '50%': { opacity: '0.8' } },
          },
        }
      }
    };
  </script>
  <style>
    ${cssCode}
  </style>
</head>
<body class="bg-apple-bg min-h-screen">
  <div id="root"></div>
  <script>${reactUmd}</script>
  <script>${reactDomUmd}</script>
  <script>${bundledJs}</script>
</body>
</html>
`;

fs.writeFileSync(path.join(distDir, 'index.html'), htmlContent);
console.log('Build complete! -> public/index.html');
