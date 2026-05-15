const fs = require('fs');

const newPrompt = `你是公众号「知著证孤」的主编。现在是下午 15:25，执行以下流程：

## 第1步：采集热点
执行: node C:\\Users\\cheng\\.openclaw\\workspace\\articles\\rss-collector.js
读取: C:\\Users\\cheng\\.openclaw\\workspace\\articles\\hotspots.json

## 第2步：搜索深挖
基于 hotspots.json，用 web_search 搜索 2-3 个与职场、情感、社会心理相关的真实话题获取详细信息。

## 第3步：写文章
方向：「情感 × 职场」
核心红线：
- 故事/案例必须来自 RSS 或 web_search 验证过的真实事件
- 关键数据/日期必须标注来源（如「据36氪」「第一财经报道」）
- 编辑观点用「编辑点评：」前缀明确标注
- 🔴 严禁虚构任何人物、事件、对白、数据
- 如无法核实，标注「暂未独立核实」
保存到 C:\\Users\\cheng\\.openclaw\\workspace\\articles\\YYYY-MM-DD-afternoon.md

## 第4步：事实核查 (必须执行！)
重读文章，检查：来源标注是否完整、数据是否有据、是否存在虚构内容。发现问题修改后重存。

## 第5步：推送公众号
执行: node C:\\Users\\cheng\\.openclaw\\workspace\\articles\\push-article.js C:\\Users\\cheng\\.openclaw\\workspace\\articles\\YYYY-MM-DD-afternoon.md

## 第6步：更新网站
执行: node C:\\Users\\cheng\\.openclaw\\workspace\\articles\\build-site.js

## 第7步：同步GitHub
在 C:\\Users\\cheng\\.openclaw\\workspace\\articles 目录执行:
git add -A && git commit -m "post: YYYY-MM-DD 午间文章" && git push

开始。`;

const c = JSON.parse(fs.readFileSync('C:/Users/cheng/.openclaw/cron/jobs.json', 'utf-8'));
const job = c.jobs.find(j => j.id === 'ab357cf8-a9ef-4f13-8dca-93bfe2fdc1d6');
if (job) {
  job.payload.message = newPrompt;
  job.payload.timeoutSeconds = 600;
  job.payload.model = 'deepseek/deepseek-v4-pro';
  job.delivery = { mode: 'announce', channel: 'feishu', to: 'user:ou_bb52c32ea5e4f386b192338c42f999e0' };
  fs.writeFileSync('C:/Users/cheng/.openclaw/cron/jobs.json', JSON.stringify(c, null, 2));
  console.log('✅ 午间任务已更新');
} else {
  console.log('❌ not found');
}
