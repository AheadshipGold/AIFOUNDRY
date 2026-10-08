const fs = require('fs');
const lines = fs.readFileSync('C:/Users/HP/.gemini/antigravity/brain/b21d8b82-32aa-4a75-9a2c-35427c897dd9/.system_generated/logs/transcript_full.jsonl', 'utf8').split('\n');
const urls = new Set();
lines.forEach(l => {
  if (l.includes('github.com/')) {
    const match = l.match(/github\.com\/[^\s"'\\]+/);
    if (match) urls.add(match[0]);
  }
});
console.log([...urls]);
