// Extract trending repos from downloaded GitHub trending HTML
const fs = require('fs');
const html = fs.readFileSync('gh-trending.html', 'utf8');

// Find repo entries - they're in h2 headings with links to /owner/repo
const repoPattern = /<a\s+href="\/([a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+)"\s+[^>]*data-view-component="true"[^>]*>/g;
const repos = [];
let match;
const seen = new Set();

while ((match = repoPattern.exec(html)) !== null && repos.length < 20) {
  const repo = match[1];
  if (seen.has(repo)) continue;
  seen.add(repo);
  repos.push({ name: repo, url: `https://github.com/${repo}` });
}

// Try to find descriptions near each repo link
const descPattern = /<p\s+class="[^"]*col-9[^"]*"[^>]*>([^<]+)<\/p>/g;
const descriptions = [];
while ((match = descPattern.exec(html)) !== null && descriptions.length < 20) {
  descriptions.push(match[1].trim());
}

// Try to find language info
const langPattern = /itemprop="programmingLanguage"[^>]*>([^<]+)<\/span>/g;
const languages = [];
while ((match = langPattern.exec(html)) !== null && languages.length < 20) {
  languages.push(match[1].trim());
}

// Try to find star counts
const starsPattern = /(\d[\d,]*)\s*stars?\s*(today|this week|this month)/gi;
const starMatches = [];
while ((match = starsPattern.exec(html)) !== null && starMatches.length < 20) {
  starMatches.push(match[0]);
}

// Alternative: find all h2 with links
const h2Pattern = /<h2[^>]*>\s*<a[^>]*href="\/([^"]+)"[^>]*>([^<]+)<\/a>\s*<\/h2>/g;
const h2Repos = [];
while ((match = h2Pattern.exec(html)) !== null && h2Repos.length < 20) {
  h2Repos.push({ full: match[0], href: match[1], text: match[2] });
}

// Broad match: find /owner/repo patterns in links that look like repo links
const broadPattern = /href="\/([a-zA-Z0-9._-]{2,}\/[a-zA-Z0-9._-]{2,})"/g;
const allRepos = [];
seen.clear();
while ((match = broadPattern.exec(html)) !== null && allRepos.length < 30) {
  const repo = match[1];
  if (seen.has(repo)) continue;
  // Skip non-repo paths
  if (repo.includes('/') && !repo.startsWith('settings/') && !repo.includes('?') && !repo.includes('#')) {
    const parts = repo.split('/');
    if (parts.length === 2 && parts[0].length > 0 && parts[1].length > 0) {
      seen.add(repo);
      allRepos.push(repo);
    }
  }
}

console.log('=== Repo names from data-view-component links ===');
repos.forEach((r, i) => console.log(`${i+1}. ${r.name}`));

console.log('\n=== Descriptions ===');
descriptions.forEach((d, i) => console.log(`${i+1}. ${d}`));

console.log('\n=== Languages ===');
languages.forEach((l, i) => console.log(`${i+1}. ${l}`));

console.log('\n=== Star counts ===');
starMatches.forEach((s, i) => console.log(`${i+1}. ${s}`));

console.log('\n=== H2 links ===');
h2Repos.forEach((r, i) => console.log(`${i+1}. ${r.href} → ${r.text}`));

console.log('\n=== All broad-matched repos (top 30) ===');
allRepos.slice(0, 30).forEach((r, i) => console.log(`${i+1}. ${r}`));
