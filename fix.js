const fs = require('fs');
const path = require('path');
const dir = 'd:/Ahmad/Startup/gpa_helper_by_ahmad_kaleem/src';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));
for (const f of files) {
    let content = fs.readFileSync(path.join(dir, f), 'utf8');
    
    // Fix missing const that were stripped out.
    content = content.replace(/^ (GRADE_MAPPINGS|NEUTRAL_GRADES|FAILURE_GRADES|STORAGE_KEYS|EVENTS|SELECTORS|THEME|Validation|Engine|Optimizer|Parser|Notifications|Overlay|UI|storage|eventBus) =/gm, 'const $1 =');

    fs.writeFileSync(path.join(dir, f), content);
}
