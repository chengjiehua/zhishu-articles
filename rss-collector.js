// rss-collector.js — 多源热点采集器
// 用法: node rss-collector.js → 输出 hotspots.json
const https = require('https');
const fs = require('fs');
const path = require('path');

const SOURCES = {
  // 科技类
  '36kr': 'https://www.36kr.com/feed',
  'hackernews': 'https://hnrss.org/frontpage?count=10',
  'github-trending': 'https://github.com/trending',
  // AI 类
  'huggingface': 'https://huggingface.co/papers',
  'arxiv-cs-ai': 'https://arxiv.org/rss/cs.AI',
  // 综合新闻
  'zhihu-hot': 'https://www.zhihu.com/rss',
  'cls-hot': 'https://www.cls.cn/api/sw?app=CailianpressWeb&os=web&sv=8.4.6',
};

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 10000 }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data.substring(0, 50000)));
    }).on('error', e => { resolve(null); }).on('timeout', function() { this.destroy(); resolve(null); });
  });
}

async function collect() {
  const hotspots = { collectedAt: new Date().toISOString(), sources: {}, items: [] };
  
  // Collect from each source
  for (const [name, url] of Object.entries(SOURCES)) {
    try {
      const raw = await fetch(url);
      hotspots.sources[name] = { status: raw ? 'ok' : 'failed', length: raw?.length || 0 };
      
      if (raw) {
        // Extract titles from RSS/HTML
        const titles = [];
        const titleRegex = /<title[^>]*>([^<]+)<\/title>/gi;
        let match;
        while ((match = titleRegex.exec(raw)) !== null && titles.length < 15) {
          const t = match[1].trim();
          if (t && !t.includes('RSS') && !t.includes('Feed') && t.length > 3) {
            titles.push(t);
          }
        }
        hotspots.sources[name].titles = titles;
        titles.forEach(t => hotspots.items.push({ source: name, title: t }));
      }
    } catch (e) {
      hotspots.sources[name] = { status: 'error', error: e.message };
    }
  }

  // Deduplicate and limit
  const seen = new Set();
  hotspots.items = hotspots.items.filter(item => {
    const key = item.title.substring(0, 30);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 50);

  fs.writeFileSync('hotspots.json', JSON.stringify(hotspots, null, 2));
  console.log(`✅ Collected ${hotspots.items.length} hotspots from ${Object.keys(SOURCES).length} sources`);
  return hotspots;
}

collect().catch(e => { console.error(e); process.exit(1); });
