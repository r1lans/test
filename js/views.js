// Global Education Karshi — sahifalar: bosh sahifa, jurnal, o‘quvchilar, mocklar, to‘lovlar…
/* ================= views ================= */
const V = {};

V.home = () => {
  const due = dues(MONTH), need = due.reduce((a, x) => a + x.need, 0), got = due.reduce((a, x) => a + Math.min(x.got, x.need), 0);
  const pct = need ? Math.round(got / need * 100) : 0, debtN = new Set(due.filter((x) => x.left > 0).map((x) => x.s.id)).size;
  const todays = D.groups.filter((g) => lessonDay(g, TODAY)).sort((a, b) => a.time.localeCompare(b.time));
  const top = due.filter((x) => x.left > 0).sort((a, b) => b.left - a.left).slice(0, 5);
  const fresh = D.leads.filter((l) => l.stage === 'new').slice(0, 5);
  const lm = [...D.mocks].sort((a, b) => b.date.localeCompare(a.date))[0];
  return `${setupCard()}<section><p class="lead">${t('homeTitle', { m: monthName(MONTH), p: pct })}</p>
  <p class="sub">${fmt(got)} ${t('sum')} ${t('collected')} · ${t('left')} ${fmt(need - got)} ${t('sum')} · ${debtN} ${t('unpaid').toLowerCase()}</p></section>
  <div class="money" role="img" aria-label="${pct}%"><i style="width:${pct}%;background:var(--ok)"></i><i style="width:${100 - pct}%;background:var(--brick)"></i></div>
  <div class="kpis">
    <div class="kpi"><b>${live().length}</b><span>${t('active')}</span></div>
    <div class="kpi"><b>${todays.length}</b><span>${t('todayL')}</span></div>
    <div class="kpi"><b>${rate(D.att, (v) => v !== 'a', () => true, 7) ?? '—'}${rate(D.att, (v) => v !== 'a', () => true, 7) === null ? '' : '%'}</b><span>${t('att7')}</span></div>
    <div class="kpi alert"><b>${mln(need - got)}</b><span>${t('debt')}, ${t('sum')}</span></div></div>
  <div class="grid2">
    <div class="panel"><h2>${t('income')}<small>${t('mln')} ${t('sum')}</small></h2><div class="fig" id="incFig"><svg></svg></div></div>
    <div class="panel"><h2>${t('todayL')}</h2><div class="list">${todays.length ? todays.map((g) => { const done = !!D.att[g.id + '|' + TODAY_ISO];
      return `<a class="row" href="#journal" data-g="${g.id}" style="color:inherit;text-decoration:none"><span class="time">${g.time}</span><span class="grow"><b>${esc(g.name)}</b><small>${esc(tName(g.teacher))}${roomTxt(g)}</small></span><span class="tag ${done ? 't-ok' : 't-n'}">${done ? '✓' : g.ids.length}</span></a>`; }).join('') : `<p class="empty">${t('noLessons')}</p>`}</div></div></div>
  <div class="grid2">
    <div class="panel"><h2>${t('debtors')}</h2><div class="list">${top.length ? '' : `<p class="empty">${t('emptyAll')}</p>`}${top.map((x) => `<div class="row">${avatar(x.s.name)}<span class="grow"><b>${esc(x.s.name)}</b><small>${esc(x.g.name)}</small></span><b class="num">${fmt(x.left)}</b><button class="btn sm" data-remind="${x.s.id}|${x.g.id}">${t('remind')}</button></div>`).join('')}</div></div>
    <div class="panel"><h2>${t('lastMock')}${lm ? `<small>${lm.type} · ${dayName(lm.date)}</small>` : ''}</h2>${lm ? mockSummary(lm) : `<p class="empty">${t('emptyAll')}</p>`}<a class="btn" href="#mocks" style="margin-top:12px;text-decoration:none;color:inherit">${t('mocks')} →</a></div></div>
  <div class="panel"><h2>${t('newLeads')}</h2><div class="list">${fresh.length ? '' : `<p class="empty">${t('emptyAll')}</p>`}${fresh.map((l) => `<div class="row">${avatar(l.name)}<span class="grow"><b>${esc(l.name)}</b><small>${esc(cName(l.course))} · ${esc(l.source)}</small></span><span class="tag t-n">${l.ago ? l.ago + ' ' + t('daysAgo') : t('todayW')}</span></div>`).join('')}</div></div>
  ${demoNote()}`;
};
const demoNote = () => D.mode === 'demo' ? `<p class="demo">${t('demoNote')}</p>` : '';
function setupCard() {
  if (!canEdit() || (D.groups.length && D.students.length)) return '';
  const done = [D.courses.length, D.teachers.length, D.groups.length, D.students.length];
  return `<div class="panel"><h2>${t('setupTitle')}</h2><div class="list">${['step1', 'step2', 'step3', 'step4'].map((k, i) => `<div class="row"><span class="tag ${done[i] ? 't-ok' : 't-n'}">${done[i] ? '✓' : i + 1}</span><b class="grow">${t(k).replace(/^\d\. /, '')}</b><button class="btn sm ${!done[i] && done.slice(0, i).every(Boolean) ? 'p' : ''}" data-setup="${i}">${done[i] ? done[i] : '+'}</button></div>`).join('')}</div></div>`;
}
function mockSummary(m) {
  const rows = m.rows.filter((r) => mySid(r.sid));
  if (m.type === 'IELTS') {
    const avg = rows.reduce((a, r) => a + r.ov, 0) / (rows.length || 1), hi = rows.filter((r) => r.ov >= 6.5).length;
    const best = [...rows].sort((a, b) => b.ov - a.ov).slice(0, 3);
    return `<div class="bar" style="gap:18px"><div><b style="font-size:34px;font-weight:800">${avg.toFixed(1)}</b><span class="muted">${t('avg')} · ${rows.length} ${t('participants')}</span></div><div><b style="font-size:34px;font-weight:800">${hi}</b><span class="muted">6.5+</span></div></div>
    <div class="list" style="margin-top:8px">${best.map((r) => `<div class="row">${avatar(S(r.sid).name)}<span class="grow"><b>${esc(S(r.sid).name)}</b></span><span class="${bandCls(r.ov)}">${r.ov.toFixed(1)}</span></div>`).join('')}</div>`;
  }
  const by = {}; rows.forEach((r) => { by[r.lv] = (by[r.lv] || 0) + 1; });
  return `<div class="bar" style="gap:8px">${['C1', 'B2', 'B1', 'A2'].map((lv) => `<span class="tag ${lv === 'C1' || lv === 'B2' ? 't-ok' : lv === 'B1' ? 't-blue' : 't-n'}" style="font-size:15px;padding:6px 12px">${lv}: ${by[lv] || 0}</span>`).join('')}</div><p class="muted" style="margin:8px 0 0">${rows.length} ${t('participants')}</p>`;
}
function drawIncome() {
  const box = $('#incFig'); if (!box) return;
  const s = box.querySelector('svg');
  const draw = () => {
    const W2 = s.clientWidth, H = s.clientHeight; if (!W2) return;
    const months = []; for (let m = 5; m >= 0; m--) months.push(mkey(new Date(TODAY.getFullYear(), TODAY.getMonth() - m, 3)));
    const vals = months.map((mk) => D.payments.filter((p) => p.month === mk).reduce((a, p) => a + p.amount, 0));
    const need = dues(MONTH).reduce((a, x) => a + x.need, 0), max = Math.max(need, ...vals, 1e6) * 1.1, top = 26, bot = 30, h = H - top - bot, bw = (W2 - 20) / 6;
    const y = (v) => top + h - v / max * h;
    s.innerHTML = vals.map((v, i) => {
      const x = 10 + i * bw + bw * .18, w = bw * .64, last = i === 5;
      return (last ? `<rect x="${x}" y="${y(need)}" width="${w}" height="${top + h - y(need)}" rx="6" fill="none" stroke="var(--brick)" stroke-dasharray="5 4"/>` : '') +
        `<rect x="${x}" y="${y(v)}" width="${w}" height="${top + h - y(v)}" rx="6" fill="${last ? 'var(--brick)' : 'var(--ink)'}" opacity="${last ? 1 : .82}"/>` +
        `<text x="${x + w / 2}" y="${y(last ? Math.max(v, need) : v) - 8}" text-anchor="middle" style="fill:var(--ink);font-weight:700">${(v / 1e6).toFixed(1)}</text>` +
        `<text x="${x + w / 2}" y="${H - 8}" text-anchor="middle">${monthName(months[i]).slice(0, W2 < 560 ? 3 : 20)}</text>`;
    }).join('');
  };
  new ResizeObserver(draw).observe(s); draw();
}

/* ---- journal: 1 attendance, 2 homework, 3 month ---- */
let J = { g: null, d: null, step: 'att', mv: 'att', draft: null };
const noGroups = () => `<div class="panel"><p class="empty" style="padding-top:0">${t('emptyGroups')}</p>${canEdit() ? `<a class="btn p" href="#manage" style="text-decoration:none">${t('goManage')}</a>` : ''}</div>`;
V.journal = () => {
  const gs = myGroups();
  if (!gs.length) return noGroups();
  if (!J.g || !gs.find((g) => g.id === J.g)) J.g = (gs.find((g) => lessonDay(g, TODAY)) || gs[0]).id;
  const g = G(J.g);
  const dates = []; for (let back = 40; back >= -6; back--) { const d = ago(back); if (lessonDay(g, d)) dates.push(iso(d)); }
  if (!J.d || !dates.includes(J.d)) J.d = dates.filter((x) => x <= TODAY_ISO).pop() || dates[0];
  const key = g.id + '|' + J.d;
  if (!J.draft || J.draft.key !== key) J.draft = { key, a: { ...(D.att[key] || {}) }, h: { ...(D.hw[key] || {}) } };
  const dr = J.draft, ids = g.ids.filter((sid) => S(sid) && S(sid).joined <= J.d);
  const cnt = (o, v) => ids.filter((sid) => o[sid] === v).length;
  const head = `<div class="chips">${gs.map((x) => `<button class="chip ${x.id === g.id ? 'on' : ''}" data-jg="${x.id}">${esc(x.name)}</button>`).join('')}</div>
  <p class="sub" style="margin:0">${esc(tName(g.teacher))}${roomTxt(g)} · ${daysTxt(g)} · ${g.time}</p>
  <div class="steps">${[['att', '1. ' + t('stepAtt'), t('stepAttD')], ['hw', '2. ' + t('stepHw'), t('stepHwD')], ['month', t('stepMonth'), t('stepMonthD')]].map(([k, a, b]) => `<button class="${J.step === k ? 'on' : ''}" data-step="${k}">${a}<small>${b}</small></button>`).join('')}</div>`;
  if (J.step === 'month') {
    const past = dates.filter((x) => x <= TODAY_ISO).slice(-13), store = J.mv === 'att' ? D.att : D.hw;
    return head + `<div class="seg" style="justify-self:start"><button class="${J.mv === 'att' ? 'on' : ''}" data-mv="att">${t('stepAtt')}</button><button class="${J.mv === 'hw' ? 'on' : ''}" data-mv="hw">${t('stepHw')}</button></div>
    <div class="panel" style="padding:0;overflow:hidden"><div class="scroll"><table class="reg"><thead><tr><th class="nm">${t('name')}</th>${past.map((ds) => { const d = new Date(ds + 'T12:00'); return `<th class="${ds === TODAY_ISO ? 'today' : ''}">${t('week')[wd(d)]}<br>${d.getDate()}</th>`; }).join('')}<th>%</th></tr></thead><tbody>${
      g.ids.map((sid) => { let ok = 0, n = 0;
        const cells = past.map((ds) => { const v = (store[g.id + '|' + ds] || {})[sid], a = (D.att[g.id + '|' + ds] || {})[sid];
          if (J.mv === 'att') { if (v) { n++; if (v !== 'a') ok++; } return `<td class="${v === 'a' ? 'c-bad' : v === 'l' ? 'c-warn' : v ? 'c-ok' : ''}">${v === 'a' ? '✕' : v === 'l' ? '◷' : v ? '✓' : ''}</td>`; }
          if (v) { n++; if (v === 'y') ok++; } return `<td class="${v === 'n' ? 'c-bad' : v ? 'c-ok' : 'c-off'}">${v === 'n' ? '✕' : v ? '✓' : a === 'a' ? '·' : ''}</td>`; }).join('');
        const pc = n ? Math.round(ok / n * 100) : null;
        return `<tr><td class="nm">${esc(S(sid).name)}</td>${cells}<td class="pc" style="color:${pc !== null && pc < 80 ? 'var(--brick-ink)' : 'inherit'}">${pc === null ? '—' : pc + '%'}</td></tr>`; }).join('')}</tbody></table></div></div>
    <p class="demo">${J.mv === 'att' ? `✓ ${t('present').toLowerCase()} · ◷ ${t('late').toLowerCase()} · ✕ ${t('absent').toLowerCase()}` : `✓ ${t('hwY').toLowerCase()} · ✕ ${t('hwN').toLowerCase()} · · ${t('absentSkip').toLowerCase()}`}</p>`;
  }
  const dateChips = `<div class="chips">${dates.map((ds) => { const d = new Date(ds + 'T12:00'); const has = !!D.att[g.id + '|' + ds]; return `<button class="chip ${ds === J.d ? 'on' : ''}" data-jd="${ds}" ${ds > TODAY_ISO ? 'disabled' : ''}>${t('week')[wd(d)]} ${d.getDate()}${has ? ' ✓' : ''}</button>`; }).join('')}</div>`;
  if (J.step === 'att') {
    return head + dateChips + `<div class="panel"><div class="bar" style="margin-bottom:6px"><h2 style="margin:0;flex:1">${t('lesson')} · ${dayName(J.d)}<small>${ids.length} ${t('studentsN')}</small></h2><button class="btn sm" id="allHere">${t('allHere')}</button></div>
    <div class="sum"><span class="tag t-ok">${t('present')}: ${cnt(dr.a, 'p')}</span><span class="tag t-warn">${t('late')}: ${cnt(dr.a, 'l')}</span><span class="tag t-bad">${t('absent')}: ${cnt(dr.a, 'a')}</span>${ids.length - cnt(dr.a, 'p') - cnt(dr.a, 'l') - cnt(dr.a, 'a') ? `<span class="tag t-n">${t('notMarked')}: ${ids.length - cnt(dr.a, 'p') - cnt(dr.a, 'l') - cnt(dr.a, 'a')}</span>` : ''}</div>
    ${ids.map((sid) => { const s = S(sid), a = dr.a[sid];
      return `<div class="mark"><div class="who">${avatar(s.name)}<div><b>${esc(s.name)}</b><span class="muted">${t('attendance')} ${stAtt(sid)}%${debtOf(sid) ? ' · <span style="color:var(--brick-ink)">' + t('unpaid').toLowerCase() + '</span>' : ''}</span></div></div>
      <div class="pick" data-s="${sid}" data-k="a"><button class="p ${a === 'p' ? 'on' : ''}" data-v="p">${t('present')}</button><button class="l ${a === 'l' ? 'on' : ''}" data-v="l">${t('late')}</button><button class="a ${a === 'a' ? 'on' : ''}" data-v="a">${t('absent')}</button></div></div>`; }).join('')}
    <div class="bar" style="justify-content:flex-end;margin-top:14px"><button class="btn" data-step="hw">${t('next')} →</button><button class="btn p" id="saveJ">${t('save')}</button></div></div>`;
  }
  const came = ids.filter((sid) => dr.a[sid] !== 'a'), away = ids.filter((sid) => dr.a[sid] === 'a');
  return head + dateChips + `<div class="panel"><div class="bar" style="margin-bottom:6px"><h2 style="margin:0;flex:1">${t('stepHw')} · ${dayName(J.d)}<small>${came.length} ${t('studentsN')}</small></h2><button class="btn sm" id="allDone">${t('allDone')}</button></div>
  <div class="sum"><span class="tag t-ok">${t('hwY')}: ${cnt(dr.h, 'y')}</span><span class="tag t-bad">${t('hwN')}: ${came.filter((sid) => dr.h[sid] === 'n').length}</span>${came.filter((sid) => !dr.h[sid]).length ? `<span class="tag t-n">${t('notMarked')}: ${came.filter((sid) => !dr.h[sid]).length}</span>` : ''}</div>
  ${came.map((sid) => { const s = S(sid), h = dr.h[sid];
    return `<div class="mark"><div class="who">${avatar(s.name)}<div><b>${esc(s.name)}</b><span class="muted">${t('homework')} ${stHw(sid)}% ${t('hwDone')}</span></div></div>
    <div class="pick" data-s="${sid}" data-k="h"><button class="y ${h === 'y' ? 'on' : ''}" data-v="y">✓ ${t('hwY')}</button><button class="n ${h === 'n' ? 'on' : ''}" data-v="n">✕ ${t('hwN')}</button></div></div>`; }).join('')}
  ${away.map((sid) => `<div class="mark off"><div class="who">${avatar(S(sid).name)}<div><b>${esc(S(sid).name)}</b><span class="muted">${t('absentSkip')}</span></div></div></div>`).join('')}
  <div class="bar" style="justify-content:flex-end;margin-top:14px"><button class="btn p" id="saveJ">${t('save')}</button></div></div>`;
};

let SF = 'all';
V.students = () => {
  const list = D.students.filter((s) => mySid(s.id) && (SF === 'arch' ? !!s.left : !s.left)).map((s) => ({ s, att: stAtt(s.id), hw: stHw(s.id), debt: debtOf(s.id) }))
    .filter((x) => SF === 'all' || (SF === 'debt' && x.debt > 0) || (SF === 'low' && x.att < 80) || (SF === 'hw' && x.hw < 70) || (SF === 'new' && x.s.joined.slice(0, 7) === MONTH) || SF === 'arch')
    .sort((a, b) => a.s.name.localeCompare(b.s.name));
  return `<div class="bar"><div class="chips" style="flex:1">${[['all', t('all')], ['debt', t('filterDebt')], ['low', t('filterLow')], ['hw', t('filterHw')], ['new', t('filterNew')], ...(D.students.some((s) => s.left) ? [['arch', t('archived')]] : [])].map(([k, l]) => `<button class="chip ${SF === k ? 'on' : ''}" data-sf="${k}">${l}</button>`).join('')}</div>
  ${role === 'teacher' ? '' : `<button class="btn p" id="addSt">+ ${t('addStudent')}</button>`}</div>
  <div class="panel"><h2>${t('students')}<small>${list.length}</small></h2><div class="scroll"><table class="stack"><thead><tr><th>${t('name')}</th><th>${t('groups')}</th><th class="num">${t('attendance')}</th><th class="num">${t('homework')}</th><th>${t('payment')}</th><th>${t('phone')}</th></tr></thead><tbody>
  ${list.map((x) => `<tr class="click" data-st="${x.s.id}"><td data-l="${t('name')}"><span class="who">${avatar(x.s.name)}<b>${esc(x.s.name)}</b></span></td><td data-l="${t('groups')}">${x.s.groups.map((gid) => esc(gName(gid))).join(', ')}</td><td class="num" data-l="${t('attendance')}">${pctTag(x.att)}</td><td class="num" data-l="${t('homework')}">${pctTag(x.hw)}</td><td data-l="${t('payment')}">${x.s.left ? `<span class="tag t-n">${t('archived')}</span>` : x.debt ? `<span class="tag t-bad">−${fmt(x.debt)}</span>` : stTag('paid')}</td><td data-l="${t('phone')}" style="white-space:nowrap">${esc(x.s.phone)}</td></tr>`).join('')}
  </tbody></table></div>${list.length ? '' : `<p class="empty">${t('noRes')}</p>`}</div>`;
};

let MS = null;
V.mocks = () => {
  const ms = [...D.mocks].sort((a, b) => b.date.localeCompare(a.date)).filter((m) => m.rows.some((r) => mySid(r.sid)));
  const head = `<div class="bar mhead"><div class="grow"><b style="font-size:20px;display:block;line-height:1.25">${t('mockLead')}</b><p class="sub">${t('mockSrc')}</p></div>${role === 'teacher' ? '' : `<button class="btn p" id="importM">${t('importM')}</button>`}</div>`;
  if (!ms.length) return head + `<div class="panel"><p class="empty" style="padding:0">${t('emptyAll')}</p></div>`;
  if (!MS || !ms.find((m) => m.id === MS)) MS = ms[0].id;
  const m = D.mocks.find((x) => x.id === MS), rows = m.rows.filter((r) => mySid(r.sid));
  const prevOf = (sid) => D.mocks.filter((x) => x.type === m.type && x.date < m.date).sort((a, b) => b.date.localeCompare(a.date)).map((x) => x.rows.find((r) => r.sid === sid)).find(Boolean);
  const isI = m.type === 'IELTS';
  const sorted = [...rows].sort((a, b) => isI ? b.ov - a.ov : b.sc - a.sc);
  return `${head}
  <div class="mocks">${ms.map((x) => { const rr = x.rows.filter((r) => mySid(r.sid)), a = x.type === 'IELTS' ? (rr.reduce((s, r) => s + r.ov, 0) / (rr.length || 1)).toFixed(1) : (rr.reduce((s, r) => s + r.sc, 0) / (rr.length || 1)).toFixed(0);
    return `<button class="mcard ${x.id === MS ? 'on' : ''}" data-ms="${x.id}"><span class="bar"><span class="tag ${x.type === 'IELTS' ? 't-bad' : 't-blue'}">${x.type}</span><span class="muted">${dayName(x.date)}</span></span><b class="big">${a}</b><span class="muted">${t('avg')} · ${rr.length} ${t('participants')}</span></button>`; }).join('')}</div>
  <div class="panel"><h2>${m.type} · ${dayName(m.date)}<small>${rows.length} ${t('participants')}</small></h2><div class="scroll"><table class="stack"><thead><tr><th>${t('name')}</th><th>${t('group')}</th>${isI ? '<th class="num">L</th><th class="num">R</th><th class="num">W</th><th class="num">S</th><th class="num">' + t('overall') + '</th>' : '<th class="num">' + t('score') + ' /75</th><th class="num">' + t('level') + '</th>'}<th class="num">${t('change')}</th></tr></thead><tbody>
  ${sorted.map((r) => { const s = S(r.sid), p = prevOf(r.sid), d = p ? (isI ? r.ov - p.ov : r.sc - p.sc) : null;
    return `<tr class="click" data-st="${s.id}"><td data-l="${t('name')}"><span class="who">${avatar(s.name)}<b>${esc(s.name)}</b></span></td><td data-l="${t('group')}">${esc(gName(s.groups[0]))}</td>
    ${isI ? r.sk.map((v, i) => `<td class="num" data-l="${'LRWS'[i]}">${v.toFixed(1)}</td>`).join('') + `<td class="num" data-l="${t('overall')}"><span class="${bandCls(r.ov)}">${r.ov.toFixed(1)}</span></td>` : `<td class="num" data-l="${t('score')}">${r.sc}</td><td class="num" data-l="${t('level')}"><span class="tag ${r.lv === 'C1' || r.lv === 'B2' ? 't-ok' : r.lv === 'B1' ? 't-blue' : 't-n'}">${r.lv}</span></td>`}
    <td class="num" data-l="${t('change')}">${d === null ? '—' : d > 0 ? `<span class="up">↑ ${isI ? d.toFixed(1) : d}</span>` : d < 0 ? `<span class="down">↓ ${isI ? (-d).toFixed(1) : -d}</span>` : '0'}</td></tr>`; }).join('')}
  </tbody></table></div></div>${demoNote()}`;
};

V.groups = () => !myGroups().length ? noGroups() : `<div class="grid3">${myGroups().map((g) => {
  const d = dues(MONTH).filter((x) => x.g.id === g.id), need = d.reduce((a, x) => a + x.need, 0), got = d.reduce((a, x) => a + Math.min(x.got, x.need), 0), pp = need ? Math.round(got / need * 100) : 100;
  return `<div class="panel" style="display:grid;gap:10px"><div class="bar"><b style="font-size:20px;flex:1">${esc(g.name)}</b><span class="tag t-n">${esc(cName(g.course))}</span></div>
  <span class="sub" style="margin:0">${esc(tName(g.teacher))}<br>${daysTxt(g)} · ${g.time}${roomTxt(g)}</span>
  <div class="list"><div class="row"><span class="grow">${t('students')}</span><b>${g.ids.length}</b></div><div class="row"><span class="grow">${t('attendance')}</span>${pctTag(attRate((x) => x === g.id, 30))}</div><div class="row"><span class="grow">${t('homework')}</span>${pctTag(hwRate((x) => x === g.id, 30))}</div>${role === 'teacher' ? '' : `<div class="row"><span class="grow">${t('payment')}</span><span class="tag ${pp >= 90 ? 't-ok' : pp >= 70 ? 't-warn' : 't-bad'}">${pp}% ${t('paidPct')}</span></div>`}</div>
  <div class="bar"><button class="btn grow" data-openj="${g.id}">${t('openJ')}</button>${canEdit() ? `<button class="btn" data-edit="group|${g.id}">${t('edit')}</button>` : ''}</div></div>`; }).join('')}</div>`;

let PF = 'all';
V.payments = () => {
  const due = dues(MONTH), need = due.reduce((a, x) => a + x.need, 0), got = due.reduce((a, x) => a + Math.min(x.got, x.need), 0), pct = need ? Math.round(got / need * 100) : 0;
  const list = due.filter((x) => PF === 'all' || x.st === PF).sort((a, b) => b.left - a.left || a.s.name.localeCompare(b.s.name));
  return `<section><p class="lead">${t('payTitle', { m: monthName(MONTH).toLowerCase() })}</p><p class="sub">${fmt(got)} / ${fmt(need)} ${t('sum')} · ${pct}% ${t('paidPct')}</p></section>
  <div class="money"><i style="width:${pct}%;background:var(--ok)"></i><i style="width:${100 - pct}%;background:var(--brick)"></i></div>
  <div class="kpis"><div class="kpi"><b>${mln(need)}</b><span>${t('expected')}</span></div><div class="kpi"><b>${mln(got)}</b><span>${t('collected')}</span></div><div class="kpi alert"><b>${mln(need - got)}</b><span>${t('left')} · ${due.filter((x) => x.left > 0).length}</span></div></div>
  <div class="bar"><div class="chips" style="flex:1">${[['all', t('all')], ['unpaid', t('unpaid')], ['partial', t('partial')], ['paid', t('paid')]].map(([k, l]) => `<button class="chip ${PF === k ? 'on' : ''}" data-pf="${k}">${l}</button>`).join('')}</div><button class="btn" id="remindAll">${t('remindAll')}</button></div>
  <div class="panel"><div class="scroll"><table class="stack"><thead><tr><th>${t('name')}</th><th>${t('group')}</th><th class="num">${t('amount')}</th><th>${t('status')}</th><th></th></tr></thead><tbody>
  ${list.map((x) => `<tr><td data-l="${t('name')}"><b>${esc(x.s.name)}</b></td><td data-l="${t('group')}">${esc(x.g.name)}</td><td class="num" data-l="${t('amount')}">${fmt(x.got)} / ${fmt(x.need)}</td><td data-l="${t('status')}">${stTag(x.st)}</td><td style="text-align:right;white-space:nowrap">${x.left ? `<button class="btn sm" data-remind="${x.s.id}|${x.g.id}">${t('remind')}</button> <button class="btn sm p" data-pay="${x.s.id}|${x.g.id}">${t('accept')}</button>` : ''}</td></tr>`).join('')}
  </tbody></table></div></div>${demoNote()}`;
};

const STAGES = ['new', 'call', 'trial', 'won', 'lost'];
V.leads = () => `<div class="bar"><p class="lead" style="flex:1;font-size:clamp(22px,2.6vw,30px)">${t('leadTitle', { n: D.leads.length, c: D.leads.filter((l) => l.stage === 'won').length })}</p><button class="btn p" id="addLead">+ ${t('addLead')}</button></div>
  <div class="kan">${STAGES.map((st) => { const items = D.leads.filter((l) => l.stage === st);
    return `<div class="col"><h3><span>${t('st_' + st)}</span><span class="tag t-n">${items.length}</span></h3>${items.map((l) => `<div class="card"><b>${esc(l.name)}</b><span class="muted">${esc(cName(l.course))} · ${esc(l.source)} · ${l.ago ? l.ago + ' ' + t('daysAgo') : t('todayW')}</span><span class="muted">${esc(l.phone)}</span>
    <div class="bar">${st !== 'new' ? `<button class="btn sm" data-lm="${l.id}|-1" aria-label="${t('back')}">←</button>` : ''}${st !== 'won' && st !== 'lost' ? `<button class="btn sm" data-lm="${l.id}|1" style="flex:1">${t('move')} →</button>` : ''}${st === 'trial' ? `<button class="btn sm" data-lm="${l.id}|lost">${t('st_lost')}</button>` : ''}${st === 'won' && !l.sid ? `<button class="btn sm p" data-tost="${l.id}" style="flex:1">${t('toStudent')}</button>` : ''}${st === 'won' && l.sid && S(l.sid) ? `<button class="btn sm" data-st="${l.sid}" style="flex:1">${t('profile')} →</button>` : ''}</div></div>`).join('')}</div>`; }).join('')}</div>`;

let SD = null;
V.schedule = () => {
  if (SD === null) SD = Math.min(wd(TODAY), 5);
  const d = ago(wd(TODAY) - SD), gs = myGroups().filter((g) => lessonDay(g, d)).sort((a, b) => a.time.localeCompare(b.time)), times = [...new Set(gs.map((g) => g.time))];
  return `<div class="chips">${t('week').slice(0, 6).map((w, i) => `<button class="chip ${i === SD ? 'on' : ''}" data-sd="${i}">${w} ${ago(wd(TODAY) - i).getDate()}</button>`).join('')}</div>
  <div class="panel">${times.length ? times.map((tm) => `<div class="slot"><span class="time">${tm}</span><div class="lessons">${gs.filter((g) => g.time === tm).map((g) => `<div class="les" style="border-left-color:${COLORS[D.groups.indexOf(g) % COLORS.length]}"><b>${esc(g.name)}</b><span class="muted">${esc(tName(g.teacher))}${roomTxt(g)} · ${g.ids.length} ${t('studentsN')}</span></div>`).join('')}</div></div>`).join('') : `<p class="empty">${t('noLessons')}</p>`}</div>`;
};

V.teachers = () => !D.teachers.length ? noGroups() : `<div class="grid3">${D.teachers.map((x) => {
  const gs = D.groups.filter((g) => g.teacher === x.id), ids = new Set(gs.flatMap((g) => g.ids));
  const got = dues(MONTH).filter((d) => d.g.teacher === x.id).reduce((a, d) => a + Math.min(d.got, d.need), 0);
  let lessons = 0; for (let k = 1; k <= TODAY.getDate(); k++) { const d = new Date(TODAY.getFullYear(), TODAY.getMonth(), k, 12); gs.forEach((g) => { if (lessonDay(g, d)) lessons++; }); }
  return `<div class="panel" style="display:grid;gap:10px"><div class="who">${avatar(x.name)}<div><b>${esc(x.name)}</b><span class="muted">${esc(x.subject || '')}${x.phone ? ' · ' + esc(x.phone) : ''}</span></div></div>
  <div class="list"><div class="row"><span class="grow">${t('groups')}</span><b>${gs.length}</b></div><div class="row"><span class="grow">${t('students')}</span><b>${ids.size}</b></div><div class="row"><span class="grow">${t('lessonsMonth')}</span><b>${lessons}</b></div>
  <div class="row"><span class="grow">${t('attendance')}</span>${pctTag(attRate((g) => (G(g) || {}).teacher === x.id, 30))}</div><div class="row"><span class="grow">${t('homework')}</span>${pctTag(hwRate((g) => (G(g) || {}).teacher === x.id, 30))}</div>
  <div class="row"><span class="grow">${t('salary')}<small>${Math.round(x.share * 100)}% ${t('share')}</small></span><b class="num">${fmt(got * x.share)} ${t('sum')}</b></div></div></div>`; }).join('')}</div>`;

V.reports = () => {
  const bars = (arr, suffix, max, colorFn) => !arr.length ? `<p class="empty">${t('emptyAll')}</p>` : arr.map((x) => `<div class="row" style="gap:10px"><span style="width:42%;flex:none">${esc(x.n)}</span><span class="grow" style="height:12px;background:var(--panel2);border-radius:6px;overflow:hidden"><i style="display:block;height:100%;width:${max ? x.v / max * 100 : 0}%;background:${colorFn(x.v)}"></i></span><b class="num" style="width:52px">${x.v}${suffix}</b></div>`).join('');
  const tone = (v) => v >= 90 ? 'var(--ok)' : v >= 80 ? 'var(--warn)' : 'var(--brick)';
  const byG = D.groups.map((g) => ({ n: g.name, v: attRate((x) => x === g.id, 30) })).sort((a, b) => b.v - a.v);
  const byH = D.groups.map((g) => ({ n: g.name, v: hwRate((x) => x === g.id, 30) })).sort((a, b) => b.v - a.v);
  const byC = D.courses.map((c) => ({ n: c.name, v: new Set(D.groups.filter((g) => g.course === c.id).flatMap((g) => g.ids)).size })).sort((a, b) => b.v - a.v);
  const src = {}; D.leads.forEach((l) => { src[l.source] = (src[l.source] || 0) + 1; });
  const bySrc = Object.entries(src).map(([n, v]) => ({ n, v })).sort((a, b) => b.v - a.v);
  const im = D.mocks.filter((m) => m.type === 'IELTS' && m.rows.length).sort((a, b) => a.date.localeCompare(b.date)).map((m) => ({ n: dayName(m.date), v: +(m.rows.reduce((a, r) => a + r.ov, 0) / m.rows.length).toFixed(1) }));
  return `<div class="panel"><h2>${t('income')}<small>${t('mln')} ${t('sum')}</small></h2><div class="fig" id="incFig"><svg></svg></div></div>
  <div class="grid2"><div class="panel"><h2>${t('byGroup')}<small>${t('days30')}</small></h2><div class="list">${bars(byG, '%', 100, tone)}</div></div>
  <div class="panel"><h2>${t('byHw')}<small>${t('days30')}</small></h2><div class="list">${bars(byH, '%', 100, (v) => v >= 85 ? 'var(--ok)' : v >= 75 ? 'var(--warn)' : 'var(--brick)')}</div></div></div>
  <div class="grid2"><div class="panel"><h2>${t('byCourse')}</h2><div class="list">${bars(byC, '', Math.max(1, ...byC.map((x) => x.v)), () => 'var(--ink)')}</div></div>
  <div class="panel" style="display:grid;gap:18px"><div><h2>${t('mockTrend')}</h2><div class="list">${bars(im, '', 9, () => 'var(--blue)')}</div></div><div><h2>${t('bySource')}</h2><div class="list">${bars(bySrc, '', Math.max(1, ...bySrc.map((x) => x.v)), () => 'var(--brick)')}</div></div></div></div>`;
};

let PS = null;
V.parent = () => {
  const mocked = new Set(D.mocks.flatMap((m) => m.rows.map((r) => r.sid)));
  const kids = live().filter((s) => G(s.groups[0]));
  if (!kids.length) return noGroups();
  if (!PS || !kids.find((s) => s.id === PS)) PS = (D.mode === 'demo' && kids.find((s) => mocked.has(s.id) && debtOf(s.id) > 0 && stAtt(s.id) < 90) || kids[0]).id;
  const s = S(PS), g = G(s.groups[0]);
  const nd = new Date(TODAY); for (let k = 0; k < 8 && !lessonDay(g, nd); k++) nd.setDate(nd.getDate() + 1);
  const first = new Date(TODAY.getFullYear(), TODAY.getMonth(), 1, 12), days = new Date(TODAY.getFullYear(), TODAY.getMonth() + 1, 0).getDate();
  let cal = t('week').map((w) => `<span class="h">${w.slice(0, 2)}</span>`).join('') + '<span class="h"></span>'.repeat(wd(first));
  for (let k = 1; k <= days; k++) { const ds = MONTH + '-' + pad(k); const a = s.groups.map((gid) => (D.att[gid + '|' + ds] || {})[s.id]).find(Boolean); cal += `<span class="${a || ''}">${k}</span>`; }
  const hwList = Object.keys(D.hw).filter((k) => s.groups.includes(k.split('|')[0]) && D.hw[k][s.id]).sort().slice(-8);
  const debt = debtOf(s.id), mk = mockRows(s.id)[0];
  const lastAbs = Object.keys(D.att).filter((k) => D.att[k][s.id] === 'a').sort().pop();
  const lastNo = Object.keys(D.hw).filter((k) => D.hw[k][s.id] === 'n').sort().pop();
  return `<div class="bar" style="justify-content:center"><label class="sub" for="psel" style="margin:0">${t('child')}:</label><select id="psel" class="btn sm">${kids.slice(0, 300).map((x) => `<option value="${x.id}" ${x.id === PS ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select></div>
  <div class="phone">
    <div class="bar"><div class="logo" style="width:32px;height:32px;font-size:13px">GE</div><b class="grow">Global Education</b><span class="tag t-n">${t('parentR')}</span></div>
    <div class="hero"><small>${t('nextLesson')}</small><b>${esc(g.name)}</b><span>${t('week')[wd(nd)]}, ${dayName(iso(nd))} · ${g.time}${roomTxt(g)}</span></div>
    <div class="who"><div class="ring" style="--v:${stAtt(s.id)}"><b>${stAtt(s.id)}%</b></div><div><b style="font-size:20px">${esc(s.name)}</b><span class="muted" style="font-size:15px">${t('attendance')}, ${monthName(MONTH).toLowerCase()}</span></div></div>
    <div class="cal">${cal}</div>
    <div><div class="bar"><b class="grow">${t('stepHw')}</b><span class="tag ${stHw(s.id) >= 80 ? 't-ok' : 't-bad'}">${stHw(s.id)}% ${t('hwDone')}</span></div>
      <div class="bar" style="margin-top:8px;gap:6px">${hwList.map((k) => { const v = D.hw[k][s.id], d = new Date(k.split('|')[1] + 'T12:00'); return `<span class="tag ${v === 'y' ? 't-ok' : 't-bad'}">${v === 'y' ? '✓' : '✕'} ${d.getDate()}.${pad(d.getMonth() + 1)}</span>`; }).join('')}</div></div>
    ${mk ? `<div class="panel" style="padding:14px;display:grid;gap:8px"><div class="bar"><b class="grow">${t('lastMock')} · ${mk.m.type}</b><span class="muted">${dayName(mk.m.date)}</span></div>
      ${mk.m.type === 'IELTS' ? `<div class="bar" style="gap:6px">${['L', 'R', 'W', 'S'].map((x, i) => `<span class="tag t-n" style="font-size:15px">${x} ${mk.r.sk[i].toFixed(1)}</span>`).join('')}<span class="${bandCls(mk.r.ov)}" style="margin-left:auto">${mk.r.ov.toFixed(1)}</span></div>` : `<div class="bar"><span class="grow">${t('score')}: <b>${mk.r.sc}</b> / 75</span><span class="tag t-blue" style="font-size:15px">${mk.r.lv}</span></div>`}</div>` : ''}
    <div class="panel" style="padding:14px;display:grid;gap:8px;background:${debt ? 'var(--brick-bg)' : 'var(--ok-bg)'};border:0"><div class="bar"><b class="grow">${t('payment')} · ${monthName(MONTH).toLowerCase()}</b>${debt ? `<b>${fmt(debt)} ${t('sum')}</b>` : stTag('paid')}</div>${debt ? `<button class="btn p" data-paylater>${t('pay')}</button>` : ''}</div>
    <div style="display:grid;gap:8px"><b>${t('news')}</b>
      ${lastAbs ? `<div class="msg">${esc(t('msgAbs', { n: s.name.split(' ')[0], g: G(lastAbs.split('|')[0]).name }))}<small>${lastAbs.split('|')[1].split('-').reverse().join('.')} · Telegram</small></div>` : ''}
      ${lastNo ? `<div class="msg">${esc(t('msgHw', { n: s.name.split(' ')[0], g: G(lastNo.split('|')[0]).name }))}<small>${lastNo.split('|')[1].split('-').reverse().join('.')} · Telegram</small></div>` : ''}
      <div class="msg"><b>${t('teacherNote')}:</b> ${t('note')}<small>${esc(tName(g.teacher))}</small></div></div>
  </div>${demoNote()}`;
};

/* ---- manage: courses, teachers, groups (the centre fills these in itself) ---- */
let MT = 'course';
V.manage = () => {
  const tabs = [['course', t('courses'), D.courses.length], ['teacher', t('teachers'), D.teachers.length], ['group', t('groups'), D.groups.length]];
  const list = MT === 'course' ? D.courses.map((c) => ({ id: c.id, a: c.name, b: `${fmt(c.price)} ${t('sum')} · ${D.groups.filter((g) => g.course === c.id).length} ${t('groups').toLowerCase()}` }))
    : MT === 'teacher' ? D.teachers.map((x) => ({ id: x.id, a: x.name, b: [x.subject, x.phone, Math.round((x.share || 0) * 100) + '% ' + t('share')].filter(Boolean).join(' · ') }))
    : D.groups.map((g) => ({ id: g.id, a: g.name, b: `${cName(g.course)} · ${tName(g.teacher)} · ${daysTxt(g)} ${g.time}${roomTxt(g)} · ${g.ids.length} ${t('studentsN')}` }));
  const addKey = { course: 'addCourse', teacher: 'addTeacher', group: 'addGroup' }[MT];
  const blocked = MT === 'group' && (!D.courses.length || !D.teachers.length);
  return `${setupCard()}<div class="seg" style="justify-self:start">${tabs.map(([k, l, n]) => `<button class="${MT === k ? 'on' : ''}" data-mt="${k}">${l} · ${n}</button>`).join('')}</div>
  <div class="panel"><div class="bar" style="margin-bottom:6px"><h2 style="margin:0;flex:1">${tabs.find((x) => x[0] === MT)[1]}</h2><button class="btn p" data-edit="${MT}|" ${blocked ? 'disabled' : ''}>+ ${t(addKey)}</button></div>
  ${blocked ? `<p class="demo">${t('step1')} → ${t('step2')} → ${t('step3')}</p>` : ''}
  <div class="list">${list.length ? list.map((x) => `<div class="row"><span class="grow"><b>${esc(x.a)}</b><small>${esc(x.b)}</small></span><button class="btn sm" data-edit="${MT}|${x.id}">${t('edit')}</button></div>`).join('') : `<p class="empty">${t('emptyAll')}</p>`}</div></div>
  <div class="panel"><h2>${t('data')}</h2><div class="bar">
    <button class="btn" data-export="students">⬇ ${t('exportSt')}</button><button class="btn" data-export="payments">⬇ ${t('exportPay')}</button><button class="btn" data-export="journal">⬇ ${t('exportJ')}</button></div>
    <div class="bar" style="margin-top:10px"><button class="btn" data-backup>${t('backup')}</button><label class="btn" style="cursor:pointer">${t('restoreB')}<input type="file" accept=".json,application/json" id="restoreF" hidden></label></div>
    ${window.CLOUD && CLOUD.on && role === 'director' ? `<div class="bar" style="margin-top:10px"><button class="btn" data-upload>☁ ${t('upload')}</button></div>` : ''}</div>`;
};
