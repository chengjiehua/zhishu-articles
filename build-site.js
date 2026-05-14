// build-site.js — 公众号文章归档网站生成器
// 用法: node build-site.js → 生成 site/index.html
const fs = require('fs');
const path = require('path');

const ARTICLES_DIR = __dirname;
const SITE_DIR = path.join(__dirname, 'docs');

if (!fs.existsSync(SITE_DIR)) fs.mkdirSync(SITE_DIR, { recursive: true });

// Collect all articles
const articles = [];
const files = fs.readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.md') && f !== 'article-template.md');
files.sort().reverse();

for (const file of files) {
  const content = fs.readFileSync(path.join(ARTICLES_DIR, file), 'utf-8');
  const lines = content.split('\n');
  const title = lines[0]?.replace(/^# /, '').trim() || file;
  const subtitle = lines[2]?.replace(/^> /, '').trim() || '';
  const date = file.replace('.md', '').replace('morning', '晨').replace('afternoon', '午');
  const slug = file.replace('.md', '');
  articles.push({ file, title, subtitle, date, slug });
}

// Build HTML
const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>知著证孤 - AI工具测评 & 情感×职场</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#f5f5f5;color:#333;line-height:1.6}
.container{max-width:720px;margin:0 auto;padding:20px}
header{text-align:center;padding:40px 20px;background:linear-gradient(135deg,#2d3a5e,#4a6fa5);color:#fff;margin-bottom:30px}
header h1{font-size:28px;margin-bottom:8px}
header p{font-size:14px;opacity:0.85}
.article-card{background:#fff;border-radius:12px;padding:24px;margin-bottom:16px;box-shadow:0 2px 8px rgba(0,0,0,0.06);transition:transform .15s,box-shadow .15s}
.article-card:hover{transform:translateY(-2px);box-shadow:0 4px 16px rgba(0,0,0,0.1)}
.article-card .date{font-size:12px;color:#999;margin-bottom:6px}
.article-card h2{font-size:20px;margin-bottom:6px;color:#2d3a5e}
.article-card h2 a{color:inherit;text-decoration:none}
.article-card h2 a:hover{color:#4a6fa5}
.article-card .subtitle{font-size:14px;color:#666}
footer{text-align:center;padding:30px;color:#999;font-size:13px}
.empty{text-align:center;padding:60px 20px;color:#999}
</style>
</head>
<body>
<header>
  <h1>📖 知著证孤</h1>
  <p>AI工具测评 × 情感×职场 | 每天 8:30 / 15:30 更新</p>
</header>
<div class="container">
${articles.length === 0 ? '<div class="empty">🚧 文章即将上线，敬请期待…</div>' : ''}
${articles.map(a => `
  <div class="article-card">
    <div class="date">${a.date}</div>
    <h2><a href="${a.slug}.md">${a.title}</a></h2>
    <div class="subtitle">${a.subtitle}</div>
  </div>
`).join('\n')}
</div>
<footer>© ${new Date().getFullYear()} 知著证孤 · 由 AI 辅助创作 · Powered by OpenClaw</footer>
</body>
</html>`;

fs.writeFileSync(path.join(SITE_DIR, 'index.html'), html);
console.log(`✅ Site built: ${articles.length} articles indexed`);
