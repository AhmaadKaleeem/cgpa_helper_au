const fs = require('fs');

let code = fs.readFileSync('extension/src/ui.js', 'utf8');

// 1. Extract _renderActiveSimsMenu out of _tabSimulate
const renderRowStr = `
  function _renderCourseRowSim(c, overrides) {
    const isOn = !!overrides[c.id];
    const selOpts = _getGradeOpts().map(g => {
      const sel = (isOn && overrides[c.id] === g) || (!isOn && c.normalizedGrade === g);
      return '<option value="' + g + '"' + (sel ? ' selected' : '') + '>' + g + '</option>';
    }).join('');

    let statusBadge = '';
    if (c.isRetakeReplaced) {
      statusBadge = '<div style="font-size:10px; color:var(--text-tertiary); margin-top:2px;">Replaced (Excluded from CGPA)</div>';
    } else if (c.isRetake) {
      statusBadge = '<div style="font-size:10px; color:var(--info); margin-top:2px;">Retaken (Counts in CGPA)</div>';
    }

    return '<tr class="' + (isOn ? 'au-row--sim' : '') + '">' +
      '<td><div style="font-weight:500;">' + _esc(c.name) + '</div>' + statusBadge + '</td>' +
      '<td class="au-tc">' + (c.isRetakeReplaced ? '<span style="text-decoration:line-through;color:var(--text-tertiary);">' + c.credits + '</span>' : c.credits) + '</td>' +
      '<td class="au-tc"><span class="au-grade-pill" style="background:' + _gradeColor(c.normalizedGrade) + '">' + _esc(c.grade) + '</span></td>' +
      '<td class="au-tc"><label class="au-toggle"><input type="checkbox" class="au-retake-chk" data-id="' + c.id + '"' + (isOn ? ' checked' : '') + '><span></span></label></td>' +
      '<td><select class="au-grade-sel au-select--sm" data-id="' + c.id + '"' + (!isOn ? ' disabled' : '') + '>' + selOpts + '</select></td>' +
    '</tr>';
  }

  function _renderActiveSimsMenu(overrides, record, manualExcl) {
    const activeSims = [];
    record.semesters.forEach(sem => {
      sem.courses.forEach(c => {
        if (overrides[c.id] && !AU_ENGINE.isCourseExcluded(c, manualExcl)) {
          activeSims.push(c);
        }
      });
    });

    if (activeSims.length > 0) {
      activeSims.sort((a, b) => a.name.localeCompare(b.name));
      const simRows = activeSims.map(c => _renderCourseRowSim(c, overrides)).join('');
      return _section('Active Simulations',
        '<table class="au-table" style="border: 2px solid var(--accent); border-radius: var(--radius-md);">' +
          '<thead><tr><th>Course</th><th>Cr</th><th>Grade</th><th>Sim</th><th>New</th></tr></thead>' +
          '<tbody>' + simRows + '</tbody>' +
        '</table>'
      );
    }
    return '';
  }
`;

code = code.replace('function _renderScenarios(dec) {', renderRowStr + '\n  function _renderScenarios(dec) {');

const oldSimLogic = `    const renderRow = (c) => {
      const isOn = !!overrides[c.id];
      const selOpts = _getGradeOpts().map(g => {
        const sel = (isOn && overrides[c.id] === g) || (!isOn && c.normalizedGrade === g);
        return '<option value="' + g + '"' + (sel ? ' selected' : '') + '>' + g + '</option>';
      }).join('');

      let statusBadge = '';
      if (c.isRetakeReplaced) {
        statusBadge = '<div style="font-size:10px; color:var(--text-tertiary); margin-top:2px;">Replaced (Excluded from CGPA)</div>';
      } else if (c.isRetake) {
        statusBadge = '<div style="font-size:10px; color:var(--info); margin-top:2px;">Retaken (Counts in CGPA)</div>';
      }

      return '<tr class="' + (isOn ? 'au-row--sim' : '') + '">' +
        '<td><div style="font-weight:500;">' + _esc(c.name) + '</div>' + statusBadge + '</td>' +
        '<td class="au-tc">' + (c.isRetakeReplaced ? '<span style="text-decoration:line-through;color:var(--text-tertiary);">' + c.credits + '</span>' : c.credits) + '</td>' +
        '<td class="au-tc"><span class="au-grade-pill" style="background:' + _gradeColor(c.normalizedGrade) + '">' + _esc(c.grade) + '</span></td>' +
        '<td class="au-tc"><label class="au-toggle"><input type="checkbox" class="au-retake-chk" data-id="' + c.id + '"' + (isOn ? ' checked' : '') + '><span></span></label></td>' +
        '<td><select class="au-grade-sel au-select--sm" data-id="' + c.id + '"' + (!isOn ? ' disabled' : '') + '>' + selOpts + '</select></td>' +
      '</tr>';
    };

    // Active Simulations Section
    const activeSims = [];
    simRecord.semesters.forEach(sem => {
      sem.courses.forEach(c => {
        if (overrides[c.id] && !AU_ENGINE.isCourseExcluded(c, _settings.manualExclusions || [])) {
          activeSims.push(c);
        }
      });
    });

    if (activeSims.length > 0) {
      activeSims.sort((a, b) => a.name.localeCompare(b.name));
      const simRows = activeSims.map(c => renderRow(c)).join('');
      html += _section('Active Simulations',
        '<table class="au-table" style="border: 2px solid var(--accent); border-radius: var(--radius-md);">' +
          '<thead><tr><th>Course</th><th>Cr</th><th>Grade</th><th>Sim</th><th>New</th></tr></thead>' +
          '<tbody>' + simRows + '</tbody>' +
        '</table>'
      );
    }`;

code = code.replace(oldSimLogic, `    html += _renderActiveSimsMenu(overrides, simRecord, _settings.manualExclusions || []);`);
code = code.replace(/return renderRow\(c\);/g, `return _renderCourseRowSim(c, overrides);`);

// 2. Add Search box and active sims to Strategic Opportunities
const oldStratOpp = code.match(/function _renderHighestImpactActions.*?\n  function _renderFutureSems/s)[0].replace('\n  function _renderFutureSems', '');

const newStratOpp = `function _renderHighestImpactActions(advisor, target, dec, r) {
    const overrides = AU_STORAGE.getOverrides() || {};
    const manualExcl = _settings.manualExclusions || [];
    
    let html = _renderActiveSimsMenu(overrides, r, manualExcl);

    let eligibleAdvisor = advisor.filter(item => !manualExcl.includes(item.courseId) && !overrides[item.courseId]);

    if (!eligibleAdvisor.length) {
      return html + _section('Strategic Opportunities',
        '<p class="au-muted">No eligible improvable courses found.</p>'
      );
    }

    if (_searchTerm) {
      eligibleAdvisor = eligibleAdvisor.filter(item => item.courseName.toLowerCase().includes(_searchTerm.toLowerCase()));
    }

    const rows = eligibleAdvisor.map((item, idx) => {
      const optGrades = Object.keys(item.impactMatrix);
      const selOpts = optGrades.map(g => '<option value="' + g + '" data-impact="' + item.impactMatrix[g].toFixed(dec) + '"' + (g==='A' ? ' selected' : '') + '>' + g + '</option>').join('');
      
      return '<div class="au-advisor-row">' +
        '<div class="au-advisor-row__left">' +
          '<div class="au-advisor-row__course">' + _esc(item.courseName) + '</div>' +
          '<div class="au-muted">' + _esc(item.semName) + ' &bull; ' + item.credits + ' cr &bull; Currently: ' +
            '<span class="au-grade-pill" style="background:' + _gradeColor(item.currentGrade) + '">' + item.currentGrade + '</span>' +
            (item.isSummerOnly ? ' <span class="au-badge" style="background:var(--warning);color:black;margin-left:4px;font-size:10px;padding:2px 4px">Summer Only</span>' : '') +
          '</div>' +
        '</div>' +
        '<div class="au-advisor-row__right" style="gap:4px">' +
          '<div class="au-advisor-row__impact">' +
            '<span class="au-muted">Est. Gain:</span>' +
            '<span class="au-badge au-badge--green" id="au-impact-badge-' + idx + '">+' + item.impactToA.toFixed(dec) + '</span>' +
          '</div>' +
          '<select class="au-select au-select--sm au-advisor-sel" data-idx="' + idx + '" style="width:70px">' + selOpts + '</select>' +
          '<button class="au-btn au-btn--sm au-btn--ghost au-advisor-apply" data-id="' + item.courseId + '" data-idx="' + idx + '">Simulate</button>' +
        '</div>' +
      '</div>';
    }).join('');

    return html + _section(
      'Strategic Opportunities',
      '<p class="au-muted" style="margin-bottom:8px">Retaking these courses yields the highest potential increase to your CGPA.</p>' +
      '<div class="au-search" style="margin-bottom: 12px;">' +
        '<span class="au-search__icon">' + _iconSearch() + '</span>' +
        '<input class="au-search__input" type="text" placeholder="Search courses..." id="au-plan-search" value="' + _esc(_searchTerm) + '">' +
      '</div>' +
      rows
    );
  }`;

code = code.replace(oldStratOpp, newStratOpp);

// 3. Share event listeners for Active Sims
const sharedListeners = `
  function _bindActiveSimsShared() {
    _root.querySelectorAll('.au-retake-chk').forEach(chk => {
      chk.addEventListener('change', () => {
        const id  = chk.dataset.id;
        const sel = _root.querySelector('.au-grade-sel[data-id="' + id + '"]');
        if (chk.checked) {
          sel.disabled = false;
          AU_STORAGE.setOverride(id, sel.value);
        } else {
          sel.disabled = true;
          AU_STORAGE.setOverride(id, null);
        }
        _refreshComputed();
        _render();
      });
    });

    _root.querySelectorAll('.au-grade-sel').forEach(sel => {
      sel.addEventListener('change', () => {
        const id = sel.dataset.id;
        AU_STORAGE.setOverride(id, sel.value);
        _refreshComputed();
        _render();
      });
    });
  }
`;

code = code.replace('function _bindSimulate() {', sharedListeners + '\n  function _bindSimulate() {');

const oldSimBind = `    // Retake checkboxes
    _root.querySelectorAll('.au-retake-chk').forEach(chk => {
      chk.addEventListener('change', () => {
        const id  = chk.dataset.id;
        const sel = _root.querySelector('.au-grade-sel[data-id="' + id + '"]');
        if (chk.checked) {
          sel.disabled = false;
          AU_STORAGE.setOverride(id, sel.value);
        } else {
          sel.disabled = true;
          AU_STORAGE.setOverride(id, null);
        }
        _refreshComputed();
        _render();
      });
    });

    // Retake grade selectors
    _root.querySelectorAll('.au-grade-sel').forEach(sel => {
      sel.addEventListener('change', () => {
        const id = sel.dataset.id;
        AU_STORAGE.setOverride(id, sel.value);
        _refreshComputed();
        _render();
      });
    });`;

code = code.replace(oldSimBind, `    _bindActiveSimsShared();`);

// 4. Update _bindPlan
const oldPlanApplyStr = code.match(/_root\.querySelectorAll\('\.au-advisor-apply'\)\.forEach.*?_render\(\);\s*}\);\s*}\);/s)[0];

const newPlanApplyStr = `const searchInput = _root.getElementById('au-plan-search');
    if (searchInput) {
      searchInput.addEventListener('input', AU_H.debounce(() => {
        _searchTerm = searchInput.value;
        _render();
      }, 300));
    }

    _bindActiveSimsShared();

    _root.querySelectorAll('.au-advisor-apply').forEach(btn => {
      btn.addEventListener('click', () => {
        const id  = btn.dataset.id;
        const idx = btn.dataset.idx;
        const sel = _root.querySelector('.au-advisor-sel[data-idx="' + idx + '"]');
        const grade = sel ? sel.value : 'A';
        AU_STORAGE.setOverride(id, grade);
        _refreshComputed();
        _render();
      });
    });`;

code = code.replace(oldPlanApplyStr, newPlanApplyStr);

// Also we need to remove the `.au-advisor-remove` event listener since we removed the "Remove" button from the list entirely
// Actually it might still be present if my regex above didn't catch it.
// Let's just strip it:
code = code.replace(/_root\.querySelectorAll\('\.au-advisor-remove'\)\.forEach.*?_render\(\);\s*}\);\s*}\);/s, '');

fs.writeFileSync('extension/src/ui.js', code);
console.log('Refactor complete.');
