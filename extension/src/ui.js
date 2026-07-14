/**
 * ui.js
 * Renders the extension interface.
 * @author Ahmad Kaleem Bhatti (BSCSev-F-24-A)
 */
(function () {
  'use strict';

  let _root     = null;
  let _content  = null;
  let _tab      = 'overview';
  let _record   = null;
  let _computed  = null;
  let _settings = {};
  let _futureSems = [];
  let _scenarios  = [];
  let _searchTerm = '';
  let _roadmapStrategy = 'balanced';
  let _planningOpen = false;

  const TABS = [
    { id: 'overview',  label: 'Overview',  icon: _iconGrid() },
    { id: 'simulate',  label: 'Simulate',  icon: _iconRefresh() },
    { id: 'plan',      label: 'Plan',      icon: _iconTarget() },
    { id: 'insights',  label: 'Insights',  icon: _iconChart() },
    { id: 'settings',  label: '',           icon: _iconGear() },
  ];

  const GRADE_OPTS = ['A','A-','B+','B','B-','C+','C','C-','D+','D','F','XF','S','U','W'];
  function _getGradeOpts() { return _settings.degreeLevel === 'graduate' ? GRADE_OPTS.filter(g => g !== 'C-' && g !== 'D' && g !== 'D+') : GRADE_OPTS; }

  // =========================================================================
  // SVG Icons (inline, minimal)
  // =========================================================================

  function _iconGrid() {
    return '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>';
  }
  function _iconRefresh() {
    return '<svg viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>';
  }
  function _iconTarget() {
    return '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>';
  }
  function _iconChart() {
    return '<svg viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>';
  }
  function _iconGear() {
    return '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>';
  }
  function _iconSearch() {
    return '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>';
  }

  // =========================================================================
  // Init
  // =========================================================================

  function init(shadowRoot) {
    _root    = shadowRoot;
    _content = shadowRoot.getElementById('au-content');
    AU_BUS.on(AU_C.EVENTS.STORAGE_RESTORED, _onData);
    AU_BUS.on(AU_C.EVENTS.PARSER_COMPLETE,  _onData);
    AU_BUS.on(AU_C.EVENTS.UI_REFRESH,       _onData);
    AU_BUS.on(AU_C.EVENTS.SETTINGS_CHANGED, _onSettingsChanged);
    _renderWaiting();
  }

  
  function _getAcademicStanding(cgpa, level) {
    if (level === 'graduate') {
      if (cgpa >= 3.75) return { label: 'Honor', color: 'var(--success)' };
      if (cgpa >= 3.50) return { label: 'Good', color: 'var(--info)' };
      if (cgpa >= 3.00) return { label: 'Satisfactory', color: 'var(--text-secondary)' };
      return { label: 'Probation', color: 'var(--danger)' };
    } else {
      if (cgpa >= 3.75) return { label: 'High Honors', color: 'var(--success)' };
      if (cgpa >= 3.50) return { label: 'Honors', color: 'var(--success)' };
      if (cgpa >= 3.00) return { label: 'Good', color: 'var(--info)' };
      if (cgpa >= 2.50) return { label: 'Fair', color: 'var(--text-secondary)' };
      if (cgpa >= 2.00) return { label: 'Satisfactory', color: 'var(--text-secondary)' };
      if (cgpa >= 1.80) return { label: 'Warning', color: 'var(--warning)' };
      if (cgpa >= 1.50) return { label: 'Serious Warning', color: 'var(--danger)' };
      return { label: 'Dismissed', color: 'var(--danger)' };
    }
  }

  function _onData(state) {
    if (!state) return;
    _record     = state.record           || null;
    _settings   = state.settings         || AU_C.DEFAULT_SETTINGS;
    _futureSems = state.futureSemesters  || [];
    _scenarios  = state.scenarios        || [];

    if (_record) {
      const overrides = state.simulatedOverrides || {};
      _computed = AU_ENGINE.calculate(_record, overrides, _settings.manualExclusions || [], _dec());
      AU_OVERLAY.updateFAB(_computed.cgpa);
    } else {
      _computed = null;
    }
    _render();
  }

  function _onSettingsChanged(s) {
    _settings = s;
    if (_record) {
      _computed = AU_ENGINE.calculate(_record, AU_STORAGE.getOverrides(), _settings.manualExclusions || [], _dec());
      AU_OVERLAY.updateFAB(_computed.cgpa);
    }
    _render();
  }

  function _dec() { return _settings.gpaDecimals || 2; }
  function _totalCredits() { return _settings.totalDegreeCredits || 136; }

  // =========================================================================
  // Render Shell
  // =========================================================================

  function _renderWaiting() {
    if (!_content) return;
    _content.innerHTML =
      '<div class="au-onboard">' +
        '<div class="au-onboard__icon">GPA</div>' +
        '<div class="au-onboard__title">Welcome to GradePilot</div>' +
        '<div class="au-onboard__steps">' +
          '<div class="au-onboard__step">' +
            '<span class="au-onboard__step-num">1</span>' +
            '<span class="au-onboard__step-text">Open the <strong>Grade Report</strong> page on the AU Student Portal</span>' +
          '</div>' +
          '<div class="au-onboard__step">' +
            '<span class="au-onboard__step-num">2</span>' +
            '<span class="au-onboard__step-text">Your grades will be loaded <strong>automatically</strong></span>' +
          '</div>' +
          '<div class="au-onboard__step">' +
            '<span class="au-onboard__step-num">3</span>' +
            '<span class="au-onboard__step-text">Simulate retakes, plan your target GPA, and track progress</span>' +
          '</div>' +
        '</div>' +
        '<p class="au-muted" style="margin-top:8px">Keyboard shortcut: <span class="au-kbd">Ctrl</span> + <span class="au-kbd">Shift</span> + <span class="au-kbd">G</span></p>' +
      '</div>';
  }

  function _render() {
    if (!_content) return;
    const advPlan = _root.getElementById('au-adv-plan');
    if (advPlan) _planningOpen = advPlan.open;
    // Apply theme
    if (_settings.theme === 'dark') {
      _root.host.classList.remove('au-light');
    } else {
      _root.host.classList.add('au-light');
    }
    _content.innerHTML = _buildNav() + _buildTabContent();
    _bindAll();
  }

  function _buildNav() {
    return '<nav class="au-nav" role="tablist">' +
      TABS.map(t =>
        '<button class="au-nav__btn' + (_tab === t.id ? ' active' : '') +
        '" data-tab="' + t.id + '" role="tab" aria-selected="' + (_tab === t.id) + '"' +
        (t.label ? ' title="' + t.label + '"' : '') + '>' +
        '<span class="au-nav__icon">' + t.icon + '</span>' +
        (t.label ? t.label : '') +
        '</button>'
      ).join('') +
    '</nav>';
  }

  function _buildTabContent() {
    if (!_computed && _tab !== 'settings') {
      return '<div class="au-empty">' +
               '<div class="au-empty__icon">GPA</div>' +
               '<div class="au-empty__title">No data loaded</div>' +
               '<p class="au-empty__sub">Navigate to the Grade Report page on the AU portal to get started.</p>' +
             '</div>';
    }
    const map = {
      overview: _tabOverview,
      simulate: _tabSimulate,
      plan:     _tabPlan,
      insights: _tabInsights,
      settings: _tabSettings,
    };
    return '<div class="au-tab-body" role="tabpanel">' + (map[_tab] || _tabOverview)() + '</div>';
  }

  // =========================================================================
  // OVERVIEW TAB
  // =========================================================================

  function _tabOverview() {
    const r   = _computed;
    const dec = _dec();
    const trend   = AU_ENGINE.gpaTrend(r);
    const trendCls = trend === 'Improving' ? 'green' : trend === 'Declining' ? 'red' : 'muted';
    const latestSem = r.semesters.length ? r.semesters[r.semesters.length - 1] : null;

    return [
      (r.hasNonCreditCourses ? '<div class="au-banner au-banner--info">Some courses were excluded because they do not contribute to GPA calculations, including Pass/Fail (S/U) and designated foundation courses.</div>' : '') +
      // Student info
      _section(null,
        '<div class="au-student-meta">' +
          '<span class="au-student-name">' + _esc(r.name) + '</span>' +
          '<span class="au-muted">' + _esc(r.session) + '</span>' +
          '<span class="au-badge au-badge--' + trendCls + '">' + trend + '</span>' +
        '</div>'
      ),

      // Hero CGPA + quick stats
      _statsGrid([
        { label: 'CGPA', value: '<div style="display:flex; align-items:center; gap:8px;">' + _fmt(r.cgpa, dec) + (function(){const st = _getAcademicStanding(r.cgpa, _settings.degreeLevel || 'undergraduate'); return '<div style="background: var(--bg-surface-hover); color: ' + st.color + '; padding: 2px 8px; border-radius: var(--radius-sm); font-size: 11px; font-weight: 600; text-transform: uppercase; border: 1px solid ' + st.color + '20;">' + st.label + '</div>';})() + '</div>', hero: true },
        { label: 'Latest SGPA',   value: latestSem ? _fmt(latestSem.sgpa, dec) : 'N/A',  sub: latestSem ? _esc(latestSem.name) : '' },
        { label: 'Credits',       value: r.totalEarnedCredits + ' / ' + _totalCredits() },
        { label: 'Quality Pts',   value: _fmt(r.totalQualityPoints, dec) },
        { label: 'Semesters',     value: r.semesters.length },
      ]),

      // Credits progress
      _creditsBar(r),

      // GPA trend chart
      _gpaChart(r, dec),

      // Grade distribution
      _gradeDistChart(r),

      // Semester table
      _semTable(r, dec, _settings.manualExclusions || []),
    ].join('') + (function(){const manualExcl = _settings.manualExclusions || [];
    let excludedListHTML = '';
    if (manualExcl.length > 0) {
      const excludedCourses = [];
      _record.semesters.forEach(s => {
        s.courses.forEach(c => {
          if (manualExcl.includes(c.id)) excludedCourses.push(c);
        });
      });
      if (excludedCourses.length > 0) {
        excludedListHTML = '<ul style="margin: var(--sp-2) 0 0 0; padding-left: 20px; font-size: 13px;">' +
          excludedCourses.map(c => 
            '<li style="margin-bottom: 4px;">' + c.name + ' (' + c.grade + ') - <a href="#" class="au-restore-btn" data-id="' + c.id + '" style="color: var(--info); font-weight: 600; text-decoration: none;">Restore</a></li>'
          ).join('') +
        '</ul>';
      }
    }
    let allGradesHTML = '';
    const availableToExclude = [];
    _record.semesters.forEach(s => {
      s.courses.forEach(c => {
        if (!manualExcl.includes(c.id)) {
          const g = AU_H.normalizeGrade(c.grade);
          if (g !== 'S' && g !== 'U') {
            availableToExclude.push(c);
          }
        }
      });
    });
    if (availableToExclude.length > 0) {
      allGradesHTML = '<div style="margin-top: var(--sp-3);"><select id="au-exclude-select" class="au-select" style="width:100%; margin-bottom: 8px; text-overflow: ellipsis;">' +
        '<option value="" disabled selected>Select a course to exclude...</option>' +
        availableToExclude.sort((a,b) => a.name.localeCompare(b.name)).map(c => 
          '<option value="' + c.id + '">' + c.name + ' (' + c.grade + ')</option>'
        ).join('') +
      '</select><button id="au-exclude-btn" class="au-btn" style="width:100%;">Exclude Course</button></div>';
    }
    const portalErrorsCard = 
      '<div class="au-section" style="margin-top: var(--sp-5); padding-top: var(--sp-4); border-top: 1px solid var(--border-primary);">' +
        '<div class="au-section__title" style="font-size: 16px; margin-bottom: 4px; color: var(--danger);">Portal Error Corrections</div>' +
        '<p style="font-size: 13px; color: var(--text-secondary); margin-bottom: var(--sp-2); line-height: 1.5;">' +
          'Did the AU portal make a mistake? (e.g., counting a dropped course as an \'F\'). ' +
          'Select courses here to force the optimizer to completely ignore them in all calculations.' +
        '</p>' +
        excludedListHTML +
        allGradesHTML +
      '</div>'; return portalErrorsCard; })();
  }

  function _creditsBar(r) {
    const total = _totalCredits();
    const pct = AU_H.clamp(Math.round((r.totalEarnedCredits / total) * 100), 0, 100);
    return _section('Degree Progress',
      '<div class="au-progress"><div class="au-progress__fill" style="width:' + pct + '%"></div></div>' +
      '<div class="au-progress__label"><span>' + r.totalEarnedCredits + ' of ' + total + ' credits</span><span>' + pct + '%</span></div>'
    );
  }

  function _gpaChart(r, dec) {
    const sems = r.semesters.filter(s => s.countedCredits > 0);
    if (sems.length < 2) return '';

    const sgpas = sems.map(s => s.sgpa);
    const cgpas = [];
    let cumQP = 0, cumCr = 0;
    sems.forEach(s => {
      cumQP += s.qualityPoints;
      cumCr += s.countedCredits;
      cgpas.push(cumCr > 0 ? AU_H.roundGPA(cumQP / cumCr, dec) : 0);
    });

    const labels = sems.map(s => s.name.replace(/^(FALL|SPRING|SUMMER)-([\d]{4})$/i, '$1 $2').slice(0, 10));

    return _section('GPA Trend',
      _svgLine([
        { data: cgpas, color: '#6c8cff', label: 'CGPA' },
        { data: sgpas, color: '#a78bfa', label: 'SGPA' },
      ], labels) +
      '<div class="au-legend">' +
        '<span class="au-legend__dot" style="background:#6c8cff"></span> CGPA ' +
        '<span class="au-legend__dot" style="background:#a78bfa"></span> SGPA' +
      '</div>'
    );
  }

  function _gradeDistChart(r) {
    const dist  = AU_ENGINE.gradeDistribution(r);
    const order = ['A','A-','B+','B','B-','C+','C','C-','D+','D','F','XF'];
    const present = order.filter(g => dist[g]);
    if (!present.length) return '';
    const max = Math.max(...present.map(g => dist[g]));

    const bars = present.map(g => {
      const h = Math.round((dist[g] / max) * 56);
      return '<div class="au-dist__bar" title="' + g + ': ' + dist[g] + '">' +
               '<div class="au-dist__cnt">' + dist[g] + '</div>' +
               '<div class="au-dist__fill" style="height:' + h + 'px;background:' + _gradeColor(g) + '"></div>' +
               '<div class="au-dist__lbl">' + g + '</div>' +
             '</div>';
    }).join('');

    return _section('Grade Distribution', '<div class="au-dist">' + bars + '</div>');
  }

  function _semTable(r, dec, manualExcl = []) {
    const rows = r.semesters.map(s =>
      '<tr>' +
        '<td>' + s.number + '</td>' +
        '<td>' + _esc(s.name) + '</td>' +
        '<td>' + _fmt(s.sgpa, dec) + '</td>' +
        '<td>' + s.attemptedCredits + '</td>' +
        '<td>' + s.earnedCredits + '</td>' +
        '<td>' + (s.sgpaExcludedCredits > 0 ? '<span style="color:var(--text-tertiary)">' + s.sgpaExcludedCredits + '</span>' : '-') + '</td>' +
        '<td>' + (s.cgpaExcludedCredits > 0 ? '<span style="color:var(--text-tertiary)">' + s.cgpaExcludedCredits + '</span>' : '-') + '</td>' +
        '<td>' + s.courses.length + '</td>' +
      '</tr>'
    ).join('');

    const exclusionNotes = [];
    r.semesters.forEach(s => {
      s.courses.forEach(c => {
        if (c.id && manualExcl.includes(c.id)) {
          exclusionNotes.push('<strong>' + _esc(c.name) + '</strong> was manually excluded. Its ' + c.credits + ' credit hours are completely removed from all GPA calculations.');
        } else if (c.isRetakeReplaced) {
          const allAttempts = [];
          r.semesters.forEach(sem => sem.courses.forEach(c2 => {
            if ((c2.name || '').toLowerCase() === (c.name || '').toLowerCase()) allAttempts.push({ sem, c: c2 });
          }));
          const best = allAttempts.find(a => !a.c.isRetakeReplaced);
          if (best && best.c.id !== c.id) {
            if (best.sem.number > s.number) {
              exclusionNotes.push('<strong>' + _esc(c.name) + '</strong> was retaken in Semester ' + best.sem.number + '. Your grade improved to ' + best.c.grade + ', so the original ' + c.credits + ' credit hours from Semester ' + s.number + ' are excluded from your CGPA.');
            } else {
              exclusionNotes.push('<strong>' + _esc(c.name) + '</strong> was retaken in Semester ' + s.number + ', but the grade did not beat your previous ' + best.c.grade + '. Therefore, these ' + c.credits + ' credit hours are excluded from your CGPA.');
            }
          }
        } else {
          const g = AU_H.normalizeGrade(c.grade);
          const isFoundation = AU_C.EXCLUDED_COURSE_PATTERNS.some(p => p.test(c.name || ''));
          if (c.credits > 0) {
            if (AU_C.FAILURE_GRADES.includes(g)) {
              exclusionNotes.push('<strong>' + _esc(c.name) + '</strong> is graded as \'' + c.grade + '\'. According to university policy, you do not earn degree credits for failed courses, but its ' + c.credits + ' credit hours are still included in your GPA calculations (0 quality points).');
            } else if (AU_C.EXCLUDED_GRADES.includes(g) || isFoundation) {
              exclusionNotes.push('<strong>' + _esc(c.name) + '</strong> is graded as \'' + c.grade + '\', which grants no quality points. Its ' + c.credits + ' credit hours are excluded from your SGPA and do not count toward your degree progress (Earned Credits).');
            }
          }
        }
      });
    });

    let notesHTML = '';
    if (exclusionNotes.length > 0) {
      notesHTML = '<div style="margin-top:var(--sp-3); padding:var(--sp-3); background:var(--bg-surface-hover); border-radius:var(--radius-md); font-size:12px; color:var(--text-secondary); line-height:1.5;">' +
        '<div style="font-weight:600; color:var(--text-primary); margin-bottom:var(--sp-2);">Exclusion Details:</div>' +
        '<ul style="margin:0; padding-left:20px;">' +
          exclusionNotes.map(n => '<li style="margin-bottom:4px;">' + n + '</li>').join('') +
        '</ul>' +
      '</div>';
    }

    return _section('Semester Summary',
      '<div style="overflow-x:auto;"><table class="au-table">' +
        '<thead><tr><th>#</th><th>Semester</th><th>SGPA</th><th>Att. Cr</th><th>Earn. Cr</th><th>Exc. (SGPA)</th><th>Exc. (CGPA)</th><th>Courses</th></tr></thead>' +
        '<tbody>' + rows + '</tbody>' +
      '</table></div>' + notesHTML
    );
  }

  // =========================================================================
  // SIMULATE TAB (was Retakes + Scenarios)
  // =========================================================================

  function _tabSimulate() {
    const overrides    = AU_STORAGE.getOverrides();
    const dec          = _dec();
    const simRecord    = AU_ENGINE.calculate(_record, overrides, dec);
    const origRecord   = AU_ENGINE.calculate(_record, {}, dec);
    const delta        = AU_H.roundGPA(simRecord.cgpa - origRecord.cgpa, dec);
    const deltaStr     = (delta > 0 ? '+' : '') + delta.toFixed(dec);
    const deltaCls     = delta > 0 ? 'green' : delta < 0 ? 'red' : 'muted';

    let html = '';

    // Impact summary
    html += _statsGrid([
      { label: 'Original CGPA',   value: _fmt(origRecord.cgpa, dec) },
      { label: 'Simulated CGPA',  value: _fmt(simRecord.cgpa, dec), hero: true },
      { label: 'Impact',          value: '<span class="au-badge au-badge--' + deltaCls + '">' + deltaStr + '</span>' },
    ]);

    // Search
    html += '<div class="au-search">' +
      '<span class="au-search__icon">' + _iconSearch() + '</span>' +
      '<input class="au-search__input" type="text" placeholder="Search courses..." id="au-sim-search" value="' + _esc(_searchTerm) + '">' +
    '</div>';

    // Course tables by semester
    simRecord.semesters.forEach(sem => {
      const rows = sem.courses.map(c => {
        if (AU_ENGINE.isCourseExcluded(c)) return '';
        // Apply search filter
        if (_searchTerm && !c.name.toLowerCase().includes(_searchTerm.toLowerCase())) return '';

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
      }).join('');

      if (!rows.trim()) return;
      html += _section(_esc(sem.name),
        '<table class="au-table">' +
          '<thead><tr><th>Course</th><th>Cr</th><th>Grade</th><th>Sim</th><th>New</th></tr></thead>' +
          '<tbody>' + rows + '</tbody>' +
        '</table>'
      );
    });

    // Actions
    html += '<button class="au-btn au-btn--ghost au-btn--full" id="au-clear-retakes">Clear All Simulations</button>';

    // Saved Scenarios
    html += _renderScenarios(dec);

    return html;
  }

  function _renderScenarios(dec) {
    const overrides = AU_STORAGE.getOverrides();
    const simCGPA = AU_ENGINE.calculate(_record, overrides, dec).cgpa;
    const fullProj = AU_OPTIMIZER.projectFull(_record, overrides, _futureSems, dec);

    const cards = _scenarios.map((sc, i) =>
      '<div class="au-card">' +
        '<div class="au-card__header">' +
          '<strong>' + _esc(sc.name) + '</strong>' +
          '<span class="au-badge au-badge--blue">' + _fmt(sc.projectedCGPA, dec) + '</span>' +
        '</div>' +
        '<p class="au-muted">Saved ' + new Date(sc.createdAt).toLocaleDateString() + '</p>' +
        '<div class="au-card__actions">' +
          '<button class="au-btn au-btn--sm" data-load-sc="' + i + '">Load</button>' +
          '<button class="au-btn au-btn--sm au-btn--ghost" data-del-sc="' + i + '">Delete</button>' +
        '</div>' +
      '</div>'
    ).join('');

    return _section('Saved Scenarios',
      '<p class="au-muted" style="margin-bottom:8px">' +
        'Current simulated CGPA: <strong>' + _fmt(simCGPA, dec) + '</strong>' +
        (fullProj !== simCGPA ? ' &bull; With future courses: <strong>' + _fmt(fullProj, dec) + '</strong>' : '') +
      '</p>' +
      '<div class="au-form-row">' +
        '<input class="au-input" type="text" id="au-sc-name" placeholder="Scenario name">' +
        '<button class="au-btn" id="au-sc-save" style="width:auto">Save</button>' +
      '</div>' +
      (_scenarios.length ? cards : '<p class="au-muted">No scenarios saved yet. Simulate grade changes above, then save the scenario here.</p>')
    );
  }

  // =========================================================================
  // PLAN TAB (Target + Roadmap + Advisor + Future Semesters)
  // =========================================================================

  function _tabPlan() {
    const dec    = _dec();
    const r      = _computed;
    const target = parseFloat(_settings.targetCGPA) || 3.0;
    
    // Future credits default logic
    const rmSemesters = parseInt(_settings.roadmapSemesters) || 4;
    const rmCredits   = parseInt(_settings.roadmapCreditsPerSem) || 15;
    const futureCreditsForCalc = rmSemesters * rmCredits;

    const roadmap = AU_OPTIMIZER.buildRoadmap(r.cgpa, r.totalCountedCredits, target, rmSemesters, rmCredits, _roadmapStrategy);
    const advisor = AU_OPTIMIZER.buildRetakeAdvisor(r, target);

    const summary = roadmap.feasible 
      ? '<p class="au-muted" style="margin-bottom:12px;font-size:12px;color:var(--text-primary)">To graduate with a <strong>' + AU_H.formatGPA(target, dec) + ' CGPA</strong>, you need an average <strong>' + AU_H.formatGPA(roadmap.overallRequired, dec) + ' SGPA</strong> across your remaining ' + rmSemesters + ' semesters.</p>' 
      : '<p class="au-muted" style="margin-bottom:12px;color:var(--danger)">This target is not achievable with your current credits plan.</p>';

    return [
      // Goal
      _section('Goal',
        '<div class="au-form-row">' +
          '<div class="au-form-group"><label>Target CGPA</label>' +
            '<input class="au-input" type="number" id="au-target-cgpa" step="0.01" min="0" max="4.0" value="' + target + '"></div>' +
          '<div class="au-form-group"><label>Future Credits</label>' +
            '<input class="au-input" type="number" id="au-future-cr" step="1" min="1" value="' + futureCreditsForCalc + '" disabled title="Adjust in Settings"></div>' +
        '</div>'
      ),

      // Reality Check
      _renderRealityCheck(roadmap, target, dec),

      // GPA Roadmap
      _section('GPA Roadmap',
        summary +
        _renderRoadmap(roadmap, r, target, dec)
      ),

      // Highest Impact Actions
      _renderHighestImpactActions(advisor, target, dec, r),

      // Advanced Planning
      '<details class="au-details" id="au-adv-plan"' + (_planningOpen ? ' open' : '') + '>' +
        '<summary class="au-details__summary">Advanced Planning (Future Semesters)</summary>' +
        '<div class="au-details__content">' +
          _renderFutureSems(dec) +
        '</div>' +
      '</details>'
    ].join('');
  }

  function _renderRealityCheck(roadmap, target, dec) {
    if (roadmap.steps.length === 0) return '';
    
    let difficulty = 'Moderate';
    let status = 'Achievable with consistent performance.';
    
    if (!roadmap.feasible) {
      difficulty = 'Impossible';
      status = 'Mathematically impossible with current credits.';
    } else if (roadmap.overallRequired >= 3.7) {
      difficulty = 'Very Hard';
      status = 'Requires near-perfect grades (A/A-).';
    } else if (roadmap.overallRequired >= 3.3) {
      difficulty = 'Challenging';
      status = 'Requires strong performance (mostly B+ or better).';
    } else if (roadmap.overallRequired <= 2.5) {
      difficulty = 'Easy';
      status = 'Easily achievable with current trajectory.';
    }

    return '<div class="au-rc-card">' +
      '<div class="au-rc-card__header">' +
        '<span class="au-rc-card__title">Reality Check</span>' +
        '<span class="au-rc-card__target">Target: ' + AU_H.formatGPA(target, dec) + '</span>' +
      '</div>' +
      '<div class="au-rc-card__grid">' +
        '<div class="au-rc-card__item">' +
          '<span class="au-rc-card__label">Req. Average SGPA</span>' +
          '<span class="au-rc-card__value">' + (roadmap.feasible ? AU_H.formatGPA(roadmap.overallRequired, dec) : 'N/A') + '</span>' +
        '</div>' +
        '<div class="au-rc-card__item">' +
          '<span class="au-rc-card__label">Difficulty</span>' +
          '<span class="au-rc-card__value" style="color:' + (roadmap.feasible ? (roadmap.overallRequired >= 3.3 ? 'var(--warning)' : 'var(--success)') : 'var(--danger)') + '">' + difficulty + '</span>' +
        '</div>' +
        '<div class="au-rc-card__status">' +
          '<strong>Status:</strong> ' + status +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function _renderRoadmap(roadmap, r, target, dec) {
    const strategies = [
      { id: 'balanced',     label: 'Balanced' },
      { id: 'front-loaded', label: 'Push early' },
      { id: 'gradual',      label: 'Ease in' },
    ];

    const stratBtns = strategies.map(s =>
      '<button class="au-roadmap__sc-btn' + (_roadmapStrategy === s.id ? ' active' : '') + '" data-strategy="' + s.id + '">' + s.label + '</button>'
    ).join('');

    let stepsHtml = '';
    if (roadmap.steps.length === 0) {
      stepsHtml = '<p class="au-muted">Please configure your remaining semesters in Settings to view your academic roadmap.</p>';
    } else {
      stepsHtml = '<div class="au-roadmap__steps">' +
        roadmap.steps.map(step => {
          const diffCls = step.difficulty === 'impossible' ? '--impossible' :
                          step.difficulty === 'hard' ? '--hard' :
                          step.difficulty === 'easy' ? '--easy' : '';
          const diffLabel = step.difficulty.charAt(0).toUpperCase() + step.difficulty.slice(1);
          return '<div class="au-roadmap__step au-roadmap__step' + diffCls + '">' +
            '<span class="au-roadmap__step-num">' + step.semester + '</span>' +
            '<div class="au-roadmap__step-info">' +
              '<div class="au-roadmap__step-title">Semester ' + step.semester + '</div>' +
              '<div class="au-roadmap__step-detail">' + step.credits + ' credits &bull; ' + diffLabel + '</div>' +
            '</div>' +
            '<span class="au-roadmap__step-gpa">' + _fmt(step.requiredGPA, dec) + '</span>' +
          '</div>';
        }).join('') +
      '</div>';
    }

    return '<div class="au-roadmap__scenarios">' + stratBtns + '</div>' + stepsHtml;
  }

  function _renderHighestImpactActions(advisor, target, dec, r) {
    if (!advisor.length) {
      return _section('Strategic Opportunities',
        '<p class="au-muted">No improvable courses found.</p>'
      );
    }

    const overrides = _settings.overrides || {};
    const rows = advisor.map((item, idx) => {
      const optGrades = Object.keys(item.impactMatrix);
      const selOpts = optGrades.map(g => '<option value="' + g + '" data-impact="' + item.impactMatrix[g].toFixed(dec) + '"' + (g==='A' ? ' selected' : '') + '>' + g + '</option>').join('');
      
      const isSimulated = !!overrides[item.courseId];
      const simulateBtn = isSimulated
        ? '<button class="au-btn au-btn--sm au-btn--danger au-advisor-remove" data-id="' + item.courseId + '">Remove</button>'
        : '<button class="au-btn au-btn--sm au-btn--ghost au-advisor-apply" data-id="' + item.courseId + '" data-idx="' + idx + '">Simulate</button>';

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
          '<select class="au-select au-select--sm au-advisor-sel" data-idx="' + idx + '" style="width:70px"' + (isSimulated ? ' disabled' : '') + '>' + selOpts + '</select>' +
          simulateBtn +
        '</div>' +
      '</div>';
    }).join('');

    return _section(
      'Strategic Opportunities',
      '<p class="au-muted" style="margin-bottom:8px">Retaking these courses yields the highest potential increase to your CGPA.</p>' +
      rows
    );
  }

  function _renderFutureSems(dec) {
    const r = _computed;

    const semCards = _futureSems.map((fs, fi) => {
      const { sgpa: projSGPA } = AU_ENGINE.calcSGPA({
        courses: (fs.courses || []).map(c => ({
          grade: c.expectedGrade,
          credits: c.credits,
          normalizedGrade: AU_H.normalizeGrade(c.expectedGrade),
        })),
      }, dec);

      const courseRows = (fs.courses || []).map((c, ci) => {
        const selOpts = GRADE_OPTS.filter(g => !['S','U','W','XF'].includes(g)).map(g =>
          '<option value="' + g + '"' + (c.expectedGrade === g ? ' selected' : '') + '>' + g + '</option>'
        ).join('');
        return '<tr>' +
          '<td><input class="au-input au-input--sm" type="text" placeholder="Course" value="' + _esc(c.name) + '" data-fi="' + fi + '" data-ci="' + ci + '" data-field="name"></td>' +
          '<td><input class="au-input au-input--sm au-input--num" type="number" min="1" max="6" value="' + c.credits + '" data-fi="' + fi + '" data-ci="' + ci + '" data-field="credits"></td>' +
          '<td><select class="au-select au-select--sm" data-fi="' + fi + '" data-ci="' + ci + '" data-field="expectedGrade">' + selOpts + '</select></td>' +
          '<td><button class="au-btn au-btn--icon" data-remove-course="' + fi + '-' + ci + '">&times;</button></td>' +
        '</tr>';
      }).join('');

      return '<div class="au-card" data-fi="' + fi + '">' +
        '<div class="au-card__header">' +
          '<div style="display:flex;align-items:center;gap:8px;flex:1">' +
            '<input class="au-input" style="flex:1" type="text" placeholder="e.g. FALL-2025" value="' + _esc(fs.name) + '" data-fi="' + fi + '" data-field="name">' +
            '<label class="au-inline-toggle"><input type="checkbox" data-fi="' + fi + '" data-field="isSummer"' + (fs.isSummer ? ' checked' : '') + '> <span>Summer</span></label>' +
          '</div>' +
          '<button class="au-btn au-btn--icon" data-remove-sem="' + fi + '">&times;</button>' +
        '</div>' +
        '<table class="au-table">' +
          '<thead><tr><th>Course</th><th>Credits</th><th>Expected</th><th></th></tr></thead>' +
          '<tbody>' + courseRows + '</tbody>' +
        '</table>' +
        '<div class="au-card__footer">' +
          '<button class="au-btn au-btn--sm au-btn--ghost" data-add-course="' + fi + '">+ Add Course</button>' +
          '<span class="au-muted">SGPA: <strong>' + _fmt(projSGPA, dec) + '</strong></span>' +
        '</div>' +
      '</div>';
    }).join('');

    return _section('Future Semesters',
      semCards +
      '<button class="au-btn au-btn--ghost au-btn--full" id="au-add-sem">+ Add Semester</button>'
    );
  }

  // =========================================================================
  // INSIGHTS TAB
  // =========================================================================

  function _tabInsights() {
    const r   = _computed;
    const dec = _dec();
    const { best, worst } = AU_ENGINE.extremeSemesters(r);
    const trend     = AU_ENGINE.gpaTrend(r);
    const trendCls  = trend === 'Improving' ? 'green' : trend === 'Declining' ? 'red' : 'muted';
    const { remainingCredits, percentComplete } = AU_OPTIMIZER.predictGraduation(r, _totalCredits());
    const dist = AU_ENGINE.gradeDistribution(r);
    const totalCourses = Object.values(dist).reduce((a, b) => a + b, 0);

    const order = ['A','A-','B+','B','B-','C+','C','C-','D+','D','F','XF'];
    const distRows = order.filter(g => dist[g]).map(g => {
      const pct = totalCourses ? ((dist[g] / totalCourses) * 100).toFixed(1) : '0.0';
      const barW = totalCourses ? Math.round((dist[g] / totalCourses) * 100) : 0;
      return '<tr>' +
        '<td><span class="au-grade-pill" style="background:' + _gradeColor(g) + '">' + g + '</span></td>' +
        '<td class="au-tc">' + dist[g] + '</td>' +
        '<td class="au-tc">' + pct + '%</td>' +
        '<td><div class="au-bar" style="width:' + barW + '%"></div></td>' +
      '</tr>';
    }).join('');

    return [
      _statsGrid([
        { label: 'GPA Trend',     value: '<span class="au-badge au-badge--' + trendCls + '">' + trend + '</span>' },
        { label: 'Best Semester', value: best ? _fmt(best.sgpa, dec) : 'N/A', sub: best ? _esc(best.name) : '' },
        { label: 'Worst Semester',value: worst ? _fmt(worst.sgpa, dec) : 'N/A', sub: worst ? _esc(worst.name) : '' },
        { label: 'Total Courses', value: totalCourses },
      ]),

      _section('Graduation Progress',
        _statsGrid([
          { label: 'Completion',        value: percentComplete + '%', hero: true },
          { label: 'Remaining Credits', value: remainingCredits },
        ]) +
        '<div class="au-progress" style="margin-top:8px"><div class="au-progress__fill" style="width:' + percentComplete + '%"></div></div>' +
        '<div class="au-progress__label"><span>Total degree credits: ' + _totalCredits() + '</span></div>'
      ),

      _section('Grade Breakdown',
        '<table class="au-table">' +
          '<thead><tr><th>Grade</th><th>Count</th><th>%</th><th>Distribution</th></tr></thead>' +
          '<tbody>' + distRows + '</tbody>' +
        '</table>'
      ),
    ].join('');
  }

  // =========================================================================
  // SETTINGS TAB
  // =========================================================================

  function _tabSettings() {
    const s = _settings;
    return [
      _section('Appearance',
        _formGroup('Theme', '<label class="au-toggle"><input type="checkbox" id="au-dark-mode"' + (s.theme === 'dark' ? ' checked' : '') + '><span></span></label> <span class="au-muted" style="margin-left:8px">' + (s.theme === 'dark' ? 'Dark' : 'Light') + '</span>', true) +
        _formGroup('GPA Decimals',
          '<select class="au-select" id="au-gpa-dec">' +
            '<option value="2"' + (s.gpaDecimals !== 3 ? ' selected' : '') + '>2 places</option>' +
            '<option value="3"' + (s.gpaDecimals === 3 ? ' selected' : '') + '>3 places</option>' +
          '</select>'
        )
      ),

      _section('Academic',
        _formGroup('Program Level',
          '<select class="au-select" id="au-set-level">' +
            '<option value="undergraduate"' + (s.degreeLevel === 'undergraduate' ? ' selected' : '') + '>Undergraduate (BS/BBA)</option>' +
            '<option value="graduate"' + (s.degreeLevel === 'graduate' ? ' selected' : '') + '>Graduate (MS/MPhil/MBA/PhD)</option>' +
          '</select>'
        ) +
        _formGroup('Total Degree Credits',
          '<input class="au-input" type="number" id="au-total-cr" min="30" max="250" value="' + (s.totalDegreeCredits || 136) + '">'
        ) +
        _formGroup('Roadmap Semesters',
          '<input class="au-input" type="number" id="au-rm-sems" min="1" max="12" value="' + (s.roadmapSemesters || 4) + '">'
        ) +
        _formGroup('Credits per Semester',
          '<input class="au-input" type="number" id="au-rm-cr" min="3" max="24" value="' + (s.roadmapCreditsPerSem || 15) + '">'
        ) +
        _formGroup('Summer Credit Limit',
          '<input class="au-input" type="number" id="au-sum-cr" min="1" max="18" value="' + (s.summerCreditLimit || 9) + '">'
        ) +
        _formGroup('Summer Course Limit',
          '<input class="au-input" type="number" id="au-sum-co" min="1" max="6" value="' + (s.summerCourseLimit || 3) + '">'
        )
      ),

      _section('Notifications',
        _formGroup('Show Notifications', '<label class="au-toggle"><input type="checkbox" id="au-notif"' + (s.notifications !== false ? ' checked' : '') + '><span></span></label>', true)
      ),

      _section('Data',
        '<button class="au-btn au-btn--ghost au-btn--full" id="au-export">Export Data (JSON)</button>' +
        '<label class="au-btn au-btn--ghost au-btn--full" style="cursor:pointer;margin-top:8px">' +
          'Import Data (JSON)<input type="file" id="au-import" accept=".json" style="display:none"></label>' +
        '<button class="au-btn au-btn--danger au-btn--full" id="au-reset" style="margin-top:12px">Reset All Data</button>'
      ),

      _section('Keyboard Shortcuts',
        '<div style="display:flex;flex-direction:column;gap:6px">' +
          '<div class="au-form-group--inline"><span>Toggle panel</span><span><span class="au-kbd">Ctrl</span> + <span class="au-kbd">Shift</span> + <span class="au-kbd">G</span></span></div>' +
          '<div class="au-form-group--inline"><span>Close panel</span><span class="au-kbd">Esc</span></div>' +
        '</div>'
      ),

      _section('About',
        '<div class="au-credits">' +
          '<p>GradePilot v2.0</p>' +
          '<p>Developed by <strong>Ahmad Kaleem Bhatti</strong></p>' +
          '<p>Air University, Islamabad</p>' +
          '<a href="https://www.linkedin.com/in/ahmadkaleembhatti/" target="_blank" rel="noopener">LinkedIn</a>' +
        '</div>'
      ),
    ].join('');
  }

  // =========================================================================
  // SVG Line Chart
  // =========================================================================

  function _svgLine(series, labels) {
    const W = 440, H = 130, PX = 28, PY = 18;
    const iW = W - PX * 2, iH = H - PY * 2 - 16;
    const allVals = series.flatMap(s => s.data);
    const minV = Math.max(0, Math.min(...allVals) - 0.15);
    const maxV = Math.min(4.0, Math.max(...allVals) + 0.15);
    const range = maxV - minV || 0.5;
    const n = series[0].data.length;

    function toX(i) { return PX + (n > 1 ? (i / (n - 1)) * iW : iW / 2); }
    function toY(v) { return PY + iH - ((v - minV) / range) * iH; }

    const yLines = [0, 1, 2, 3, 4].filter(v => v >= minV - 0.1 && v <= maxV + 0.1).map(v =>
      '<line x1="' + PX + '" y1="' + toY(v) + '" x2="' + (W - PX) + '" y2="' + toY(v) + '" stroke="' + 'rgba(128,128,128,0.08)' + '" stroke-dasharray="3,3"/>'
    ).join('');

    const paths = series.map(s => {
      const pts = s.data.map((v, i) => toX(i) + ',' + toY(v)).join(' ');
      const dots = s.data.map((v, i) =>
        '<circle cx="' + toX(i) + '" cy="' + toY(v) + '" r="3" fill="' + s.color + '" stroke="' + s.color + '" stroke-width="1" opacity="0.9">' +
          '<title>' + labels[i] + ': ' + v.toFixed(2) + '</title>' +
        '</circle>'
      ).join('');
      return '<polyline points="' + pts + '" fill="none" stroke="' + s.color + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.85"/>' + dots;
    }).join('');

    const xLabels = labels.map((l, i) => {
      if (n > 7 && i % 2 !== 0) return '';
      return '<text x="' + toX(i) + '" y="' + (H - 2) + '" text-anchor="middle" class="au-chart-lbl">' + l + '</text>';
    }).join('');

    return '<svg class="au-chart" viewBox="0 0 ' + W + ' ' + H + '">' +
      yLines + paths + xLabels +
    '</svg>';
  }

  // =========================================================================
  // Event Binding
  // =========================================================================

  function _bindAll() {

    const excludeBtn = _content.querySelector('#au-exclude-btn');
    if (excludeBtn) {
      excludeBtn.addEventListener('click', () => {
        const sel = _content.querySelector('#au-exclude-select');
        if (sel && sel.value) {
          const exclusions = _settings.manualExclusions || [];
          if (!exclusions.includes(sel.value)) {
            if (window.AU_STORAGE) {
               AU_STORAGE.updateSettings({ manualExclusions: [...exclusions, sel.value] });
            }
          }
        }
      });
    }
    
    const restoreBtns = _content.querySelectorAll('.au-restore-btn');
    restoreBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const id = e.target.getAttribute('data-id');
        const exclusions = _settings.manualExclusions || [];
        if (window.AU_STORAGE) {
           AU_STORAGE.updateSettings({ manualExclusions: exclusions.filter(x => x !== id) });
        }
      });
    });

    // Tab navigation
    _root.querySelectorAll('.au-nav__btn').forEach(btn =>
      btn.addEventListener('click', () => { _tab = btn.dataset.tab; _render(); })
    );

    // Keyboard nav for tabs
    _root.querySelectorAll('.au-nav__btn').forEach((btn, i, all) => {
      btn.addEventListener('keydown', (e) => {
        let next = -1;
        if (e.key === 'ArrowRight') next = (i + 1) % all.length;
        if (e.key === 'ArrowLeft') next = (i - 1 + all.length) % all.length;
        if (next >= 0) {
          e.preventDefault();
          all[next].focus();
          all[next].click();
        }
      });
    });

    if (_tab === 'simulate') _bindSimulate();
    if (_tab === 'plan')     _bindPlan();
    if (_tab === 'settings') _bindSettings();
  }

  function _bindSimulate() {
    // Search
    const searchInput = _root.getElementById('au-sim-search');
    if (searchInput) {
      searchInput.addEventListener('input', AU_H.debounce(() => {
        _searchTerm = searchInput.value;
        _render();
      }, 300));
    }

    // Retake checkboxes
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

    // Grade selects
    _root.querySelectorAll('.au-grade-sel').forEach(sel => {
      sel.addEventListener('change', () => {
        if (!sel.disabled) {
          AU_STORAGE.setOverride(sel.dataset.id, sel.value);
          _refreshComputed();
          _render();
        }
      });
    });

    // Clear all
    const clearBtn = _root.getElementById('au-clear-retakes');
    if (clearBtn) clearBtn.addEventListener('click', () => {
      if (Object.keys(AU_STORAGE.getOverrides()).length === 0) return;
      _clearAllOverrides();
      AU_NOTIFICATIONS.show('All simulations cleared.', 'info');
    });

    // Scenarios
    _bindScenarios();
  }

  function _bindScenarios() {
    const saveBtn = _root.getElementById('au-sc-save');
    if (saveBtn) saveBtn.addEventListener('click', () => {
      const nameEl = _root.getElementById('au-sc-name');
      const name   = nameEl ? nameEl.value.trim() : '';
      if (!name) { AU_NOTIFICATIONS.show('Enter a scenario name.', 'warning'); return; }
      const dec      = _dec();
      const overrides = AU_STORAGE.getOverrides();
      const fullProj  = AU_OPTIMIZER.projectFull(_record, overrides, _futureSems, dec);
      _scenarios.push({
        id: 'sc-' + AU_H.generateId(),
        name,
        simulatedOverrides: AU_H.deepClone(overrides),
        futureSemesters: AU_H.deepClone(_futureSems),
        projectedCGPA: fullProj,
        createdAt: new Date().toISOString(),
      });
      AU_STORAGE.setScenarios(_scenarios);
      AU_NOTIFICATIONS.show('Scenario saved: ' + name, 'success');
      _render();
    });

    _root.querySelectorAll('[data-load-sc]').forEach(btn =>
      btn.addEventListener('click', () => {
        const sc = _scenarios[parseInt(btn.dataset.loadSc, 10)];
        if (!sc) return;
        _clearAllOverrides();
        Object.entries(sc.simulatedOverrides || {}).forEach(([k, v]) => AU_STORAGE.setOverride(k, v));
        AU_STORAGE.setFutureSemesters(sc.futureSemesters || []);
        _futureSems = sc.futureSemesters || [];
        _refreshComputed();
        AU_NOTIFICATIONS.show('Loaded: ' + sc.name, 'success');
        _tab = 'plan';
        _render();
      })
    );

    _root.querySelectorAll('[data-del-sc]').forEach(btn =>
      btn.addEventListener('click', () => {
        _scenarios.splice(parseInt(btn.dataset.delSc, 10), 1);
        AU_STORAGE.setScenarios(_scenarios);
        _render();
      })
    );
  }

  function _bindPlan() {
    // Target optimizer - real-time
    const tgtInput = _root.getElementById('au-target-cgpa');
    const crInput  = _root.getElementById('au-future-cr');
    const updateTarget = AU_H.debounce(() => {
      const tgt = parseFloat(tgtInput ? tgtInput.value : 3.0);
      const cr  = parseInt(crInput ? crInput.value : 15, 10);
      if (isNaN(tgt) || isNaN(cr)) return;
      AU_STORAGE.updateSettings({ targetCGPA: tgt });
      const res = AU_OPTIMIZER.calcRequired(_computed.cgpa, _computed.totalCountedCredits, tgt, cr);
      const el  = _root.getElementById('au-opt-result');
      if (el) {
        el.textContent = res.message;
        el.className = 'au-result ' + (res.feasible ? 'au-result--success' : 'au-result--error');
      }
    }, 400);

    if (tgtInput) tgtInput.addEventListener('input', updateTarget);
    if (crInput) crInput.addEventListener('input', updateTarget);

    // Roadmap strategy buttons
    _root.querySelectorAll('[data-strategy]').forEach(btn => {
      btn.addEventListener('click', () => {
        _roadmapStrategy = btn.dataset.strategy;
        _render();
      });
    });

    // Advisor: dynamic apply retake and badge updates
    _root.querySelectorAll('.au-advisor-sel').forEach(sel => {
      sel.addEventListener('change', () => {
        const idx = sel.dataset.idx;
        const impact = sel.options[sel.selectedIndex].dataset.impact;
        const badge = _root.getElementById('au-impact-badge-' + idx);
        if (badge) badge.textContent = '+' + impact;
      });
    });

    _root.querySelectorAll('.au-advisor-apply').forEach(btn => {
      btn.addEventListener('click', () => {
        const id  = btn.dataset.id;
        const idx = btn.dataset.idx;
        const sel = _root.querySelector('.au-advisor-sel[data-idx="' + idx + '"]');
        const grade = sel ? sel.value : 'A';
        AU_STORAGE.setOverride(id, grade);
        _refreshComputed();
        AU_NOTIFICATIONS.show('Retake applied. Check the Simulate tab.', 'success');
        _render();
      });
    });

    _root.querySelectorAll('.au-advisor-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        AU_STORAGE.removeOverride(id);
        _refreshComputed();
        AU_NOTIFICATIONS.show('Retake simulation removed.', 'success');
        _render();
      });
    });

    // Add semester
    const addSemBtn = _root.getElementById('au-add-sem');
    if (addSemBtn) addSemBtn.addEventListener('click', () => {
      const nextNum = (_record ? _record.semesters.length : 0) + _futureSems.length + 1;
      _futureSems.push({
        id: 'fs-' + AU_H.generateId(),
        name: 'Semester ' + nextNum,
        isSummer: false,
        courses: [{ id: 'fc-' + AU_H.generateId(), name: '', credits: 3, expectedGrade: 'B' }],
      });
      AU_STORAGE.setFutureSemesters(_futureSems);
      _render();
    });

    // Remove semester
    _root.querySelectorAll('[data-remove-sem]').forEach(btn =>
      btn.addEventListener('click', () => {
        _futureSems.splice(parseInt(btn.dataset.removeSem, 10), 1);
        AU_STORAGE.setFutureSemesters(_futureSems);
        _render();
      })
    );

    // Add course
    _root.querySelectorAll('[data-add-course]').forEach(btn =>
      btn.addEventListener('click', () => {
        const fi = parseInt(btn.dataset.addCourse, 10);
        _futureSems[fi].courses.push({ id: 'fc-' + AU_H.generateId(), name: '', credits: 3, expectedGrade: 'B' });
        AU_STORAGE.setFutureSemesters(_futureSems);
        _render();
      })
    );

    // Remove course
    _root.querySelectorAll('[data-remove-course]').forEach(btn =>
      btn.addEventListener('click', () => {
        const [fi, ci] = btn.dataset.removeCourse.split('-').map(Number);
        _futureSems[fi].courses.splice(ci, 1);
        AU_STORAGE.setFutureSemesters(_futureSems);
        _render();
      })
    );

    // Field inputs
    _root.querySelectorAll('[data-field]').forEach(inp => {
      const ev = inp.type === 'checkbox' ? 'change' : 'input';
      inp.addEventListener(ev, AU_H.debounce(() => {
        const fi    = parseInt(inp.dataset.fi, 10);
        const field = inp.dataset.field;
        if (isNaN(fi)) return;
        if (inp.dataset.ci !== undefined) {
          const ci = parseInt(inp.dataset.ci, 10);
          _futureSems[fi].courses[ci][field] =
            field === 'credits' ? parseInt(inp.value, 10) || 0 : inp.value;
        } else {
          _futureSems[fi][field] = inp.type === 'checkbox' ? inp.checked : inp.value;
        }
        AU_STORAGE.setFutureSemesters(_futureSems);
        _render();
      }, 600));
    });
  }

  function _bindSettings() {

    const levelSel = _root.getElementById('au-set-level');
    if (levelSel) {
      levelSel.addEventListener('change', (e) => {
        const val = e.target.value;
        const updates = { degreeLevel: val };
        if (val === 'graduate') {
          if (_settings.totalDegreeCredits === 136) updates.totalDegreeCredits = 30;
          if (_settings.targetCGPA === 3.00) updates.targetCGPA = 3.50;
        } else {
          if (_settings.totalDegreeCredits === 30) updates.totalDegreeCredits = 136;
        }
        if (window.AU_STORAGE) AU_STORAGE.updateSettings(updates);
      });
    }
    
    const id  = s => _root.getElementById(s);
    const upd = (key, fn) => { const el = id(key); if (el) el.addEventListener('change', () => AU_STORAGE.updateSettings(fn(el))); };

    upd('au-dark-mode',  el => { _settings.theme = el.checked ? 'dark' : 'light'; return { theme: _settings.theme }; });
    upd('au-gpa-dec',    el => ({ gpaDecimals: parseInt(el.value, 10) }));
    upd('au-total-cr',   el => ({ totalDegreeCredits: parseInt(el.value, 10) }));
    upd('au-rm-sems',    el => ({ roadmapSemesters: parseInt(el.value, 10) }));
    upd('au-rm-cr',      el => ({ roadmapCreditsPerSem: parseInt(el.value, 10) }));
    upd('au-sum-cr',     el => ({ summerCreditLimit: parseInt(el.value, 10) }));
    upd('au-sum-co',     el => ({ summerCourseLimit: parseInt(el.value, 10) }));
    upd('au-notif',      el => ({ notifications: el.checked }));

    const exportBtn = id('au-export');
    if (exportBtn) exportBtn.addEventListener('click', () => {
      const blob = new Blob([JSON.stringify(AU_STORAGE.getState(), null, 2)], { type: 'application/json' });
      const url  = URL.createObjectURL(blob);
      const a    = Object.assign(document.createElement('a'), { href: url, download: 'au-gpa-data.json' });
      a.click(); URL.revokeObjectURL(url);
      AU_NOTIFICATIONS.show('Data exported.', 'success');
    });

    const importInp = id('au-import');
    if (importInp) importInp.addEventListener('change', () => {
      const file = importInp.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = e => {
        try {
          AU_STORAGE.setState(JSON.parse(e.target.result));
          AU_NOTIFICATIONS.show('Data imported successfully.', 'success');
        } catch {
          AU_NOTIFICATIONS.show('Import failed: invalid file format.', 'error');
        }
      };
      reader.readAsText(file);
    });

    const resetBtn = id('au-reset');
    if (resetBtn) resetBtn.addEventListener('click', () => {
      if (confirm('This will permanently delete all your GPA data, simulations, and scenarios. Continue?')) {
        AU_STORAGE.reset();
        AU_NOTIFICATIONS.show('All data has been reset.', 'info');
      }
    });
  }

  // =========================================================================
  // Helpers
  // =========================================================================

  function _refreshComputed() {
    if (!_record) return;
    const overrides = AU_STORAGE.getOverrides();
    _computed = AU_ENGINE.calculate(_record, overrides, _dec());
  }

  function _clearAllOverrides() {
    const overrides = AU_STORAGE.getOverrides();
    Object.keys(overrides).forEach(k => AU_STORAGE.setOverride(k, null));
    _refreshComputed();
    _render();
  }

  function _esc(s)       { return AU_H.escHtml(s || ''); }
  function _fmt(v, dec)  { return AU_H.formatGPA(v, dec); }

  function _section(title, body) {
    return '<div class="au-section">' +
      (title ? '<div class="au-section__title">' + title + '</div>' : '') +
      body +
    '</div>';
  }

  function _statsGrid(stats) {
    const cells = stats.map(s => {
      const cls = s.hero ? 'au-stat au-stat--hero' : 'au-stat';
      return '<div class="' + cls + '">' +
        '<span class="au-stat__label">' + s.label + '</span>' +
        '<span class="au-stat__value">' + s.value + '</span>' +
        (s.sub ? '<span class="au-stat__sub">' + s.sub + '</span>' : '') +
      '</div>';
    }).join('');
    return '<div class="au-stats-grid">' + cells + '</div>';
  }

  function _formGroup(label, control, inline) {
    if (inline) {
      return '<div class="au-form-group au-form-group--inline"><span>' + label + '</span>' + control + '</div>';
    }
    return '<div class="au-form-group"><label>' + label + '</label>' + control + '</div>';
  }

  function _gradeColor(g) {
    const map = {
      'A':  '#34d399', 'A-': '#4ade80',
      'B+': '#6c8cff', 'B':  '#818cf8', 'B-': '#a78bfa',
      'C+': '#fbbf24', 'C':  '#f59e0b', 'C-': '#f97316',
      'D+': '#fb923c', 'D':  '#f87171',
      'F':  '#ef4444', 'XF': '#dc2626',
    };
    return map[g] || '#5c6380';
  }

  window.AU_UI = Object.freeze({ init });
})();
