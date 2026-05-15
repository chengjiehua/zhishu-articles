const fs = require('fs');
const c = JSON.parse(fs.readFileSync('C:/Users/cheng/.openclaw/cron/jobs.json', 'utf-8'));

const ghPrompt = '用 web_search 搜索今天的 GitHub Trending 项目。列出 3-5 个最有价值的项目（名称、star数、一句话描述）。将结果保存为 JSON 到 C:\\Users\\cheng\\.openclaw\\workspace\\articles\\github-candidates.json。格式：{"collectedAt":"ISO时间","candidates":[{"name":"owner/repo","stars":1000,"why":"推荐理由","url":"https://github.com/..."}]}';

const nwPrompt = '用 web_search 搜索今天的 AI/科技新闻，找 3-5 条最值得写的。每条附来源和关键数据。保存 JSON 到 C:\\Users\\cheng\\.openclaw\\workspace\\articles\\news-candidates.json。格式：{"collectedAt":"ISO时间","candidates":[{"title":"标题","source":"信源","score":5,"keyData":"关键数字/数据","angle":"文章角度建议"}]}';

const gh = c.jobs.find(j => j.id === 'collect-github');
gh.payload.message = ghPrompt;

const nw = c.jobs.find(j => j.id === 'collect-news');
nw.payload.message = nwPrompt;

fs.writeFileSync('C:/Users/cheng/.openclaw/cron/jobs.json', JSON.stringify(c, null, 2));
console.log('Simplified collector prompts');
