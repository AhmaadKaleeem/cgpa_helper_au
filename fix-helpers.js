const fs = require('fs');
const path = require('path');
const file = 'd:/Ahmad/Startup/gpa_helper_by_ahmad_kaleem/src/helpers.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/^ (debounce|throttle|deepClone|generateId|cleanString|roundGPA)\(/gm, 'function $1(');

fs.writeFileSync(file, content);
