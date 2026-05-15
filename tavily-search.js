// tavily-search.js — Node.js wrapper for Tavily Search API
// Usage: node tavily-search.js --query "..." [--max-results 5] [--format json|md]
const https = require('https');
const fs = require('fs');
const path = require('path');

const TAVILY_URL = 'https://api.tavily.com/search';

function loadKey() {
  if (process.env.TAVILY_API_KEY) return process.env.TAVILY_API_KEY.trim();
  const envPath = path.join(require('os').homedir(), '.openclaw', '.env');
  if (fs.existsSync(envPath)) {
    const txt = fs.readFileSync(envPath, 'utf-8');
    const m = txt.match(/^TAVILY_API_KEY\s*=\s*(.+?)\s*$/m);
    if (m) return m[1].trim().replace(/^["']|["']$/g, '');
  }
  return null;
}

function tavilySearch(query, maxResults = 5, searchDepth = 'basic', includeAnswer = false) {
  const key = loadKey();
  if (!key) throw new Error('TAVILY_API_KEY not found. Set in ~/.openclaw/.env');

  const payload = JSON.stringify({
    api_key: key,
    query,
    max_results: Math.max(1, Math.min(maxResults, 10)),
    search_depth: searchDepth,
    include_answer: includeAnswer,
    include_images: false,
    include_raw_content: false,
  });

  return new Promise((resolve, reject) => {
    const url = new URL(TAVILY_URL);
    const req = https.request({
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Content-Length': Buffer.byteLength(payload) },
      timeout: 30000,
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const obj = JSON.parse(data);
          const out = { query, results: [] };
          if (includeAnswer && obj.answer) out.answer = obj.answer;
          for (const r of (obj.results || []).slice(0, maxResults)) {
            out.results.push({ title: r.title, url: r.url, snippet: r.content });
          }
          resolve(out);
        } catch (e) { reject(new Error(`Tavily non-JSON: ${data.slice(0, 200)}`)); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
    req.write(payload);
    req.end();
  });
}

// CLI
const args = {};
process.argv.slice(2).forEach((a, i, arr) => {
  if (a.startsWith('--')) { const k = a.slice(2); args[k] = arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : 'true'; }
});

if (!args.query) { console.error('Usage: node tavily-search.js --query "..." [--max-results 5] [--format md|json] [--include-answer]'); process.exit(1); }

tavilySearch(args.query, parseInt(args['max-results']) || 5, args['search-depth'] || 'basic', !!args['include-answer'])
  .then(res => {
    if (args.format === 'md') {
      if (res.answer) console.log(res.answer + '\n');
      res.results.forEach((r, i) => console.log(`${i + 1}. ${r.title}\n   ${r.url}\n   ${r.snippet}\n`));
    } else {
      console.log(JSON.stringify(res, null, 2));
    }
  })
  .catch(e => { console.error('Error:', e.message); process.exit(1); });
