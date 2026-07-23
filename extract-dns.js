const fs = require('fs');

const srvContent = fs.readFileSync('/Users/harshkoli/.gemini/antigravity-ide/brain/aea51fa7-495d-4d73-93d7-28da0da7981c/.system_generated/steps/2522/content.md', 'utf8');
const srvLine = srvContent.split('\n').find(l => l.startsWith('{"Status":0'));

const txtContent = fs.readFileSync('/Users/harshkoli/.gemini/antigravity-ide/brain/aea51fa7-495d-4d73-93d7-28da0da7981c/.system_generated/steps/2550/content.md', 'utf8');
const txtLine = txtContent.split('\n').find(l => l.startsWith('{"Status":0'));

console.log("SRV JSON:", srvLine);
console.log("TXT JSON:", txtLine);
