// Update morning editor cron job prompt
const fs = require('fs');
const http = require('http');

const GATEWAY_URL = 'http://127.0.0.1:18789';
const JOB_ID = 'd5a0a280-0e6b-4db5-ba19-ba1d8b334f26';
const PROMPT_FILE = 'C:\\Users\\cheng\\.openclaw\\workspace\\articles\\cron-morning-prompt-v2.txt';

const message = fs.readFileSync(PROMPT_FILE, 'utf-8');

const payload = JSON.stringify({ message });

const url = new URL(`${GATEWAY_URL}/api/cron/${JOB_ID}`);
const options = {
  hostname: url.hostname,
  port: url.port,
  path: url.pathname,
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    try { console.log(JSON.stringify(JSON.parse(data), null, 2)); }
    catch { console.log(data); }
  });
});

req.on('error', (e) => console.error('Error:', e.message));
req.write(payload);
req.end();
