// Global Education Karshi — profil, to‘lov, kvitansiya, eslatma, boshqaruv, import, eksport, sozlamalar oynalari
/* ================= drawer & modals ================= */
const dmy = (ds) => ds.split('-').reverse().join('.');
const ph = (v) => { v = String(v || '').trim(); return v.replace(/\D/g, '').length > 4 ? v : ''; };
function openStudent(sid) {
  const s = S(sid); if (!s) return;
  const hist = D.payments.filter((p) => p.sid === sid).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8), mk = mockRows(sid), debt = debtOf(sid);
  const owe = s.groups.find((gid) => G(gid) && paidFor(sid, gid, MONTH) < fee(sid, gid));
  const dr = $('#drawer');
  dr.innerHTML = `<div class="bar" style="flex-wrap:nowrap"><h3 class="grow">${t('profile')}</h3>${canEdit() ? `<button class="btn sm" data-edst="${sid}">${t('edit')}</button>` : ''}<button class="x" data-close aria-label="×">×</button></div>
  <div class="who">${avatar(s.name, 56)}<div><b style="font-size:20px">${esc(s.name)}</b><span class="muted" style="font-size:15px">${t('joined')} ${dmy(s.joined)}${s.left ? ` · <span style="color:var(--brick-ink)">${t('archived')} ${dmy(s.left)}</span>` : ''}</span></div></div>
  <div class="bar" style="gap:16px;flex-wrap:nowrap"><div class="ring" style="--v:${stAtt(sid)}"><b>${stAtt(sid)}%</b></div><div style="display:grid;gap:6px"><span>${t('attendance')}, ${t('days30')}</span><span>${t('homework')}: ${pctTag(stHw(sid))}</span>${s.left ? '' : debt ? `<span class="tag t-bad">${t('unpaid')}: ${fmt(debt)} ${t('sum')}</span>` : stTag('paid')}</div></div>
  <div class="panel" style="padding:14px"><div class="list"><div class="row"><span class="grow">${t('phone')}</span><a href="tel:${digits(s.phone)}" style="color:inherit"><b>${esc(s.phone)}</b></a></div><div class="row"><span class="grow">${parentWord(s.parent)}</span><a href="tel:${digits(s.pphone)}" style="color:inherit"><b>${esc(s.pphone || '—')}</b></a></div>
  <div class="row"><span class="grow">${t('groupsOf')}</span><b style="text-align:right">${s.groups.map((gid) => esc(gName(gid))).join('<br>') || '—'}</b></div>
  ${role === 'teacher' ? '' : `<div class="row"><span class="grow">${t('feeW')}</span><b style="text-align:right">${s.groups.filter(G).map((gid) => fmt(fee(sid, gid))).join('<br>')} ${t('sum')}${+s.discount ? `<br><span class="tag t-blue">−${+s.discount}%</span>` : ''}</b></div>`}
  ${s.note ? `<div class="row"><span class="grow">${t('noteF')}</span><span style="text-align:right">${esc(s.note)}</span></div>` : ''}</div></div>
  ${mk.length ? `<div><b>${t('mockHist')}</b><div class="list" style="margin-top:6px">${mk.map(({ m, r }) => `<div class="row"><span class="grow">${m.type}<small>${dayName(m.date)}${m.type === 'IELTS' ? ' · L ' + r.sk[0] + ' · R ' + r.sk[1] + ' · W ' + r.sk[2] + ' · S ' + r.sk[3] : ' · ' + r.sc + '/75'}</small></span>${m.type === 'IELTS' ? `<span class="${bandCls(r.ov)}">${r.ov.toFixed(1)}</span>` : `<span class="tag t-blue">${r.lv}</span>`}</div>`).join('')}</div></div>` : ''}
  ${role === 'teacher' ? '' : `<div><b>${t('history')}</b><div class="list" style="margin-top:6px">${hist.map((p) => `<div class="row"><span class="grow">${monthName(p.month)}<small>${esc(gName(p.gid))} · ${dmy(p.date)} · ${t(p.method)}</small></span><b class="num">${fmt(p.amount)}</b><button class="btn sm" data-receipt="${p.id}" aria-label="${t('receipt')}">🧾</button></div>`).join('') || '<p class="empty">—</p>'}</div></div>
  ${debt && owe && !s.left ? `<button class="btn p" data-pay="${sid}|${owe}">${t('accept')}</button>` : ''}`}`;
  $('#shade').classList.add('on'); dr.classList.add('on');
}
function payModal(sid, gid) {
  const left = Math.max(0, fee(sid, gid) - paidFor(sid, gid, MONTH));
  modal(t('accept'), `<p class="sub" style="margin:0">${esc(S(sid).name)} · ${esc(gName(gid))} · ${monthName(MONTH)}</p>
  <form id="payF" style="display:grid;gap:12px"><div class="f"><label for="pAmt">${t('amount')}, ${t('sum')}</label><input id="pAmt" type="number" inputmode="numeric" min="1000" step="1000" value="${left}" required></div>
  <div class="f"><label for="pMet">${t('method')}</label><select id="pMet"><option value="cash">${t('cash')}</option><option value="card">${t('card')}</option><option value="click">Click</option><option value="payme">Payme</option></select></div>
  <div class="bar" style="justify-content:flex-end"><button type="button" class="btn" data-close>${t('cancel')}</button><button class="btn p">${t('save')}</button></div></form>`, (m) => {
    m.querySelector('#payF').addEventListener('submit', (e) => { e.preventDefault(); const amt = Math.round(+m.querySelector('#pAmt').value); if (!(amt > 0)) return;
      const p = { id: uid('p'), sid, gid, month: MONTH, amount: amt, method: m.querySelector('#pMet').value, date: TODAY_ISO, by: meName() };
      D.payments.push(p); persist(); render(); receiptModal(p.id); });
  });
}
/* receipt: printable, and can be sent to the parent */
function receiptModal(pid) {
  const p = D.payments.find((x) => x.id === pid); if (!p) return;
  const s = S(p.sid) || { name: '—', pphone: '' }, no = D.payments.filter((x) => x.date.slice(0, 4) === p.date.slice(0, 4) && (x.date < p.date || (x.date === p.date && x.id <= p.id))).length;
  const txt = `${t('receipt')} №${no} · Global Education Karshi\n${s.name} · ${gName(p.gid)}\n${monthName(p.month)}: ${fmt(p.amount)} ${t('sum')} (${t(p.method)}) · ${dmy(p.date)}`;
  modal(t('receipt'), `<div class="receipt panel" style="display:grid;gap:8px">
    <div class="bar"><div class="logo" style="width:36px;height:36px;font-size:14px">GE</div><b class="grow">Global Education Karshi</b><span class="muted">№ ${no}</span></div>
    <div class="list"><div class="row"><span class="grow">${t('name')}</span><b>${esc(s.name)}</b></div><div class="row"><span class="grow">${t('receiptFor')}</span><b style="text-align:right">${esc(gName(p.gid))}<br>${monthName(p.month)}</b></div>
    <div class="row"><span class="grow">${t('amount')}</span><b style="font-size:20px">${fmt(p.amount)} ${t('sum')}</b></div><div class="row"><span class="grow">${t('method')}</span><b>${t(p.method)}</b></div>
    <div class="row"><span class="grow">${t('mDate')}</span><b>${dmy(p.date)}</b></div><div class="row"><span class="grow">${t('cashier')}</span><b>${esc(p.by || '—')}</b></div>
    <div class="row"><span class="grow">${t('signature')}</span><span style="width:45%;border-bottom:1px solid var(--ink);height:24px"></span></div></div></div>
  <div class="noprint">${sendBtns(s.pphone, txt)}</div>
  <div class="bar noprint" style="justify-content:flex-end">${canEdit() ? `<button class="btn" data-delpay="${p.id}" style="color:var(--brick-ink)">${t('delPay')}</button>` : ''}<button class="btn p" data-print>${t('print')}</button></div>`);
}
function remindModal(pairs) {
  const items = pairs.map(([sid, gid]) => ({ s: S(sid), text: t('remindText', { n: S(sid).name, m: monthName(MONTH).toLowerCase(), s: fmt(Math.max(0, fee(sid, gid) - paidFor(sid, gid, MONTH))) }) }));
  modal(pairs.length > 1 ? t('remindSent', { n: pairs.length }) : t('remind'), `<p class="demo">${t('sendHint')}</p><div style="display:grid;gap:8px;max-height:56vh;overflow:auto">${items.slice(0, 60).map((x) => `<div class="msg">${esc(x.text)}<small>${esc(x.s.name)} · ${esc(x.s.pphone || '—')}</small>${sendBtns(x.s.pphone, x.text)}</div>`).join('')}</div>
  ${items.length > 1 ? `<div class="bar" style="justify-content:flex-end"><button class="btn" id="cpy">${t('copy')}: ${items.length}</button></div>` : ''}`, (m) => { const c = m.querySelector('#cpy'); if (c) c.addEventListener('click', () => copyText(items.map((x) => x.s.pphone + '\n' + x.text).join('\n\n'))); });
}
/* add or edit a student: several groups, discount, archive */
function studentModal(sid, pre) {
  const s = sid ? S(sid) : null; pre = pre || {};
  if (!D.groups.length) { toast(t('emptyGroups')); return; }
  const inG = s ? s.groups : pre.gid ? [pre.gid] : [D.groups[0].id];
  modal(s ? t('edit') : t('addStudent'), `<form id="stF" style="display:grid;gap:12px"><div class="f"><label for="sName">${t('name')}</label><input id="sName" required maxlength="60" value="${esc(s ? s.name : pre.name || '')}"></div>
  <div class="bar" style="flex-wrap:nowrap"><div class="f grow"><label for="sPh">${t('phone')}</label><input id="sPh" type="tel" value="${esc(s ? s.phone || '+998 ' : pre.phone || '+998 ')}"></div></div>
  <div class="bar" style="flex-wrap:nowrap"><div class="f" style="width:38%"><label for="sPar">${t('parentR')}</label><select id="sPar"><option value="mother">${parentWord('mother')}</option><option value="father" ${s && s.parent === 'father' ? 'selected' : ''}>${parentWord('father')}</option></select></div><div class="f grow"><label for="sPp">${t('parentPhone')}</label><input id="sPp" type="tel" value="${esc(s ? s.pphone || '+998 ' : '+998 ')}"></div></div>
  <fieldset class="f" style="border:1px solid var(--line);border-radius:12px;padding:8px 12px;margin:0"><legend style="font-size:13px;color:var(--soft);padding:0 4px">${t('groups')}</legend>${D.groups.map((g) => `<label class="row" style="padding:8px 0;font-size:15px;color:var(--ink)"><input type="checkbox" name="sg" value="${g.id}" ${inG.includes(g.id) ? 'checked' : ''} style="width:20px;height:20px;min-height:0"><span class="grow">${esc(g.name)}<small>${esc(tName(g.teacher))} · ${daysTxt(g)} ${g.time}</small></span><span class="muted">${fmt(price(g.id))}</span></label>`).join('')}</fieldset>
  <div class="bar" style="flex-wrap:nowrap"><div class="f" style="width:38%"><label for="sDc">${t('discount')}</label><input id="sDc" type="number" min="0" max="100" step="5" value="${s ? +s.discount || 0 : 0}"></div><div class="f grow"><label for="sNt">${t('noteF')}</label><input id="sNt" maxlength="120" value="${esc(s ? s.note || '' : pre.note || '')}"></div></div>
  <div class="bar" style="justify-content:flex-end">${s ? (s.left ? `<button type="button" class="btn" data-unarch="${s.id}">${t('restore')}</button>` : `<button type="button" class="btn" data-arch="${s.id}" style="color:var(--brick-ink)">${t('archiveSt')}</button>`) : ''}<span class="grow"></span><button type="button" class="btn" data-close>${t('cancel')}</button><button class="btn p">${s ? t('saveChanges') : t('add')}</button></div></form>`, (m) => {
    if (!s) m.querySelector('#sName').focus();
    m.querySelector('#stF').addEventListener('submit', (e) => {
      e.preventDefault(); const name = m.querySelector('#sName').value.trim().replace(/\s+/g, ' '); if (!name) return;
      const gs = [...m.querySelectorAll('[name=sg]:checked')].map((x) => x.value); if (!gs.length) { toast(t('group') + ': ' + t('must')); return; }
      const dc = Math.max(0, Math.min(100, Math.round(+m.querySelector('#sDc').value || 0)));
      const rec = s || { id: uid('s'), joined: TODAY_ISO, groups: [] };
      const was = rec.groups.slice();
      Object.assign(rec, { name, phone: ph(m.querySelector('#sPh').value), parent: m.querySelector('#sPar').value, pphone: ph(m.querySelector('#sPp').value), groups: gs, discount: dc, note: m.querySelector('#sNt').value.trim() });
      if (!s) D.students.push(rec);
      if (!rec.left) { was.filter((g) => !gs.includes(g)).forEach((g) => { const x = G(g); if (x) x.ids = x.ids.filter((i) => i !== rec.id); }); gs.forEach((g) => { const x = G(g); if (x && !x.ids.includes(rec.id)) x.ids.push(rec.id); }); }
      if (pre.lead) { const l = D.leads.find((x) => x.id === pre.lead); if (l) l.sid = rec.id; }
      persist(); closeAll(); if (!s) SF = 'all'; render(); toast(t('saved'));
      if (!s) openStudent(rec.id);
    });
  });
}
function archiveStudent(sid, back) {
  const s = S(sid); if (!s) return;
  if (back) { delete s.left; s.groups.forEach((g) => { const x = G(g); if (x && !x.ids.includes(sid)) x.ids.push(sid); }); }
  else { s.left = TODAY_ISO; D.groups.forEach((g) => { g.ids = g.ids.filter((i) => i !== sid); }); }
  persist(); closeAll(); render(); toast(t('saved'));
}
function leadModal() {
  modal(t('addLead'), `<form id="lF" style="display:grid;gap:12px"><div class="f"><label for="lName">${t('name')}</label><input id="lName" required maxlength="60"></div>
  <div class="f"><label for="lPh">${t('phone')}</label><input id="lPh" type="tel" value="+998 "></div>
  <div class="f"><label for="lCo">${t('course')}</label><select id="lCo">${D.courses.map((c) => `<option value="${c.id}">${esc(c.name)}</option>`).join('') || '<option value="">—</option>'}</select></div>
  <div class="f"><label for="lSrc">${t('source')}</label><select id="lSrc">${['Instagram', 'Telegram', 'Tanish orqali', 'Banner', 'Boshqa'].map((x) => `<option>${x}</option>`).join('')}</select></div>
  <div class="bar" style="justify-content:flex-end"><button type="button" class="btn" data-close>${t('cancel')}</button><button class="btn p">${t('add')}</button></div></form>`, (m) => {
    m.querySelector('#lName').focus();
    m.querySelector('#lF').addEventListener('submit', (e) => { e.preventDefault(); const name = m.querySelector('#lName').value.trim(); if (!name) return;
      D.leads.unshift({ id: uid('l'), name, phone: ph(m.querySelector('#lPh').value), course: m.querySelector('#lCo').value, source: m.querySelector('#lSrc').value, stage: 'new', ago: 0, at: TODAY_ISO }); persist(); closeAll(); render(); toast(t('saved')); });
  });
}
function leadToStudent(lid) {
  const l = D.leads.find((x) => x.id === lid); if (!l) return;
  const g = D.groups.find((x) => x.course === l.course);
  studentModal(null, { name: l.name, phone: l.phone, gid: g && g.id, lead: l.id });
}
/* courses, teachers, groups */
function editModal(kind, id) {
  const arr = { course: D.courses, teacher: D.teachers, group: D.groups }[kind], x = id ? arr.find((r) => r.id === id) : null;
  const inp = (k, label, val, type, extra) => `<div class="f"><label for="e_${k}">${label}</label><input id="e_${k}" ${type ? `type="${type}"` : ''} value="${esc(val ?? '')}" ${extra || ''}></div>`;
  const sel = (k, label, opts, val) => `<div class="f"><label for="e_${k}">${label}</label><select id="e_${k}">${opts.map(([v, n]) => `<option value="${v}" ${v === val ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select></div>`;
  let body = '';
  if (kind === 'course') body = inp('name', t('cName'), x && x.name, '', 'required maxlength="40" placeholder="IELTS"') + inp('price', t('priceM') + ', ' + t('sum'), x ? x.price : '', 'number', 'required min="0" step="1000" inputmode="numeric" placeholder="500000"');
  if (kind === 'teacher') body = inp('name', t('name'), x && x.name, '', 'required maxlength="60"') + inp('subject', t('subject'), x && x.subject, '', 'maxlength="40"') + inp('phone', t('phone'), x ? x.phone : '+998 ', 'tel') + inp('share', t('sharePct'), x ? Math.round((x.share || 0) * 100) : 40, 'number', 'min="0" max="100" step="5"');
  if (kind === 'group') body = inp('name', t('gName'), x && x.name, '', 'required maxlength="40" placeholder="IELTS 6.5+"') + sel('course', t('course'), D.courses.map((c) => [c.id, c.name + ' · ' + fmt(c.price)]), x && x.course) + sel('teacher', t('teacher'), D.teachers.map((r) => [r.id, r.name]), x && x.teacher)
    + `<div class="bar" style="flex-wrap:nowrap">${sel('days', t('days'), [['odd', t('days_odd')], ['even', t('days_even')], ['all', t('days_all')]], x ? x.days : 'odd')}${inp('time', t('time'), x ? x.time : '14:00', 'time', 'required')}</div>` + inp('room', t('room'), x && x.room, '', 'maxlength="12"');
  const title = x ? t('edit') : t({ course: 'addCourse', teacher: 'addTeacher', group: 'addGroup' }[kind]);
  modal(title, `<form id="edF" style="display:grid;gap:12px">${body}<div class="bar">${x ? `<button type="button" class="btn" data-delitem="${kind}|${x.id}" style="color:var(--brick-ink)">${t('del')}</button>` : ''}<span class="grow"></span><button type="button" class="btn" data-close>${t('cancel')}</button><button class="btn p">${t('save2')}</button></div></form>`, (m) => {
    m.querySelector('#e_name').focus();
    m.querySelector('#edF').addEventListener('submit', (e) => {
      e.preventDefault(); const v = (k) => (m.querySelector('#e_' + k) || {}).value; const name = v('name').trim(); if (!name) return;
      const rec = x || { id: uid(kind[0]) };
      if (kind === 'course') Object.assign(rec, { name, price: Math.max(0, Math.round(+v('price') || 0)) });
      if (kind === 'teacher') Object.assign(rec, { name, subject: v('subject').trim(), phone: ph(v('phone')), share: Math.max(0, Math.min(100, +v('share') || 0)) / 100 });
      if (kind === 'group') Object.assign(rec, { name, course: v('course'), teacher: v('teacher'), days: v('days'), time: v('time') || '14:00', room: v('room').trim(), ids: rec.ids || [] });
      if (!x) arr.push(rec);
      persist(); closeAll(); render(); toast(t('saved'));
    });
  });
}
function deleteItem(kind, id) {
  const used = kind === 'course' ? D.groups.some((g) => g.course === id) : kind === 'teacher' ? D.groups.some((g) => g.teacher === id) : (G(id) || { ids: [] }).ids.length > 0 || D.students.some((s) => s.groups.includes(id));
  if (used) { toast(t('inUse')); return; }
  ask(t('delQ'), t('yesDel'), () => {
    const key = { course: 'courses', teacher: 'teachers', group: 'groups' }[kind];
    D[key] = D[key].filter((r) => r.id !== id);
    if (kind === 'group') { for (const k of Object.keys(D.att)) if (k.startsWith(id + '|')) delete D.att[k]; for (const k of Object.keys(D.hw)) if (k.startsWith(id + '|')) delete D.hw[k]; }
    persist(); render(); toast(t('saved'));
  });
}
/* ---- Excel (CSV) export and backups ---- */
function download(name, text, type) {
  try { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500); } catch (e) {}
}
const csv = (rows) => '﻿' + rows.map((r) => r.map((c) => { const v = String(c ?? ''); return /[;"\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }).join(';')).join('\r\n');
function exportCSV(kind) {
  let rows;
  if (kind === 'students') rows = [[t('name'), t('phone'), t('parentPhone'), t('groups'), t('discount'), t('attendance') + ' %', t('homework') + ' %', t('debt') + ', ' + t('sum'), t('joined'), t('noteF')]]
    .concat(D.students.filter((s) => mySid(s.id)).sort((a, b) => a.name.localeCompare(b.name)).map((s) => [s.name, s.phone, s.pphone, s.groups.map(gName).join(', '), +s.discount || 0, stAtt(s.id), stHw(s.id), s.left ? t('archived') : debtOf(s.id), dmy(s.joined), s.note || '']));
  if (kind === 'payments') rows = [[t('name'), t('group'), t('feeW'), t('collected'), t('left'), t('status')]].concat(dues(MONTH).map((x) => [x.s.name, x.g.name, x.need, x.got, x.left, t(x.st)]))
    .concat([[], [t('mDate'), t('name'), t('group'), t('amount'), t('method'), t('cashier')]]).concat(D.payments.filter((p) => p.month === MONTH).sort((a, b) => a.date.localeCompare(b.date)).map((p) => [dmy(p.date), (S(p.sid) || {}).name, gName(p.gid), p.amount, t(p.method), p.by || '']));
  if (kind === 'journal') {
    rows = [];
    myGroups().forEach((g) => {
      const ds = []; for (let k = 1; k <= TODAY.getDate(); k++) { const d = new Date(TODAY.getFullYear(), TODAY.getMonth(), k, 12); if (lessonDay(g, d)) ds.push(iso(d)); }
      rows.push([g.name + ' · ' + tName(g.teacher), ...ds.map((d) => d.slice(8) + '.' + d.slice(5, 7)), t('attendance') + ' %', t('homework') + ' %']);
      g.ids.filter(S).forEach((sid) => rows.push([S(sid).name, ...ds.map((d) => { const a = (D.att[g.id + '|' + d] || {})[sid], h = (D.hw[g.id + '|' + d] || {})[sid]; return a ? (a === 'a' ? 'X' : a === 'l' ? 'K' : '+') + (h === 'n' ? ' DZ-' : h === 'y' ? ' DZ+' : '') : ''; }), attRate((x, s) => x === g.id && s === sid, 31), hwRate((x, s) => x === g.id && s === sid, 31)]));
      rows.push([]);
    });
  }
  download(`GEK-${kind}-${MONTH}.csv`, csv(rows), 'text/csv;charset=utf-8');
}
function backup() { download(`GEK-zaxira-${TODAY_ISO}.json`, JSON.stringify({ app: 'gek', saved: new Date().toISOString(), data: D }), 'application/json'); }
function restoreFrom(file) {
  const r = new FileReader();
  r.onload = () => {
    try {
      const j = JSON.parse(r.result), d = j && j.app === 'gek' ? j.data : null;
      if (!d || d.v !== 2 || !['students', 'groups', 'teachers', 'courses', 'payments', 'leads', 'mocks'].every((k) => Array.isArray(d[k])) || typeof d.att !== 'object') throw 0;
      D = d; persist(); J = { g: null, d: null, step: 'att', mv: 'att', draft: null }; MS = null; PS = null; render(); toast(t('restored'));
    } catch (e) { toast(t('badFile')); }
  };
  r.readAsText(file);
}
function importModal(tab) {
  tab = tab || 'file';
  const pool = D.groups.filter((g) => /ielts/i.test(cName(g.course))).flatMap((g) => g.ids).filter((sid) => S(sid));
  const ex = (pool.length ? pool : live().map((s) => s.id)).slice(0, 4).map((sid, i) => S(sid).name + '; ' + [7, 6.5, 6, 6.5].map((v) => (v - i * .5).toFixed(1)).join('; ')).join('\n');
  modal(t('importM'), `<div class="seg" style="justify-self:start"><button class="${tab === 'file' ? 'on' : ''}" data-imp="file">${t('fromFile')}</button><button class="${tab === 'site' ? 'on' : ''}" data-imp="site">${t('fromSite')}</button></div>
  ${tab === 'file' ? `<form id="impF" style="display:grid;gap:12px"><div class="bar" style="flex-wrap:nowrap"><div class="f grow"><label for="iType">${t('mType')}</label><select id="iType"><option>IELTS</option><option>CEFR</option></select></div><div class="f grow"><label for="iDate">${t('mDate')}</label><input id="iDate" type="date" value="${TODAY_ISO}"></div></div>
  <div class="f"><label for="iData">${t('pasteHint')}</label><textarea id="iData">${esc(ex)}</textarea></div>
  <div class="bar" style="justify-content:flex-end"><button type="button" class="btn" data-close>${t('cancel')}</button><button class="btn p">${t('importBtn')}</button></div></form>`
  : `<div class="f"><label for="iUrl">${t('siteUrl')}</label><input id="iUrl" type="url" placeholder="https://mock.globaleducation.uz"></div><p class="sub" style="margin:0">${t('siteNote')}</p>
  <div class="bar" style="justify-content:flex-end"><button class="btn p" data-sitedemo>${t('connect')}</button></div>`}`, (m) => {
    const f = m.querySelector('#impF'); if (!f) return;
    f.addEventListener('submit', (e) => {
      e.preventDefault();
      const type = m.querySelector('#iType').value, date = m.querySelector('#iDate').value || TODAY_ISO, rows = [], miss = [];
      m.querySelector('#iData').value.split(/\n+/).map((l) => l.trim()).filter(Boolean).forEach((line) => {
        const p = line.split(/\t|;|,(?!\d)/).map((x) => x.trim()).filter((x) => x !== '');
        const nm = p[0], nums = p.slice(1).map((x) => parseFloat(x.replace(',', '.'))).filter((x) => !isNaN(x));
        const st = D.students.find((s) => s.name.toLowerCase() === (nm || '').toLowerCase());
        if (!st) { miss.push(nm); return; }
        if (type === 'IELTS' && nums.length >= 4) { const sk = nums.slice(0, 4).map(half); rows.push({ sid: st.id, sk, ov: overall(sk) }); }
        else if (type === 'CEFR' && nums.length >= 1) { const sc = Math.max(0, Math.min(75, Math.round(nums[0]))); rows.push({ sid: st.id, sc, lv: cefr(sc) }); }
        else miss.push(nm);
      });
      if (rows.length) { const id = 'm' + Date.now(); D.mocks.push({ id, type, date, source: 'file', rows }); MS = id; persist(); closeAll(); render(); }
      toast(t('imported', { n: rows.length }) + (miss.length ? ' · ' + t('unmatched') + ': ' + miss.length : ''));
    });
  });
}
function settingsModal() {
  const cl = window.CLOUD && CLOUD.on;
  modal(t('settings'), `<div class="f"><label>${t('lang')}</label><div class="seg">${[['uz', 'O‘zbekcha'], ['ru', 'Русский'], ['en', 'English']].map(([l, n]) => `<button class="${l === L ? 'on' : ''}" data-lang="${l}">${n}</button>`).join('')}</div></div>
  <div class="f"><label>${t('theme')}</label><div class="seg">${['light', 'dark', 'auto'].map((x) => `<button class="${x === THEME ? 'on' : ''}" data-theme-set="${x}">${t(x)}</button>`).join('')}</div></div>
  ${cl ? `<p class="demo">☁ ${t('cloudOn')}<br>${esc(CLOUD.email || '')}</p>` : `<p class="demo">${t(D.mode === 'demo' ? 'modeDemo' : 'modeReal')}</p>`}
  <div class="list">${!cl && D.mode === 'demo' ? `<button class="row btn" data-reset style="justify-content:flex-start;border:0;padding-left:0">${t('reset')}</button>` : ''}
  ${!cl && role !== 'teacher' && role !== 'parentR' ? `<button class="row btn" data-switchmode style="justify-content:flex-start;border:0;padding-left:0">${t('switchMode')}: ${t(D.mode === 'demo' ? 'modeReal' : 'modeDemo')}</button>` : ''}
  <button class="row btn" data-logout style="justify-content:flex-start;border:0;padding-left:0;color:var(--brick-ink)">${t('logout')}</button></div>`);
}
function moreSheet() {
  modal(t('more'), `<div class="list">${ROLES[role].slice(4).map((k) => `<a class="row" href="#${k}" data-close style="color:inherit;text-decoration:none">${svg(k).replace('<svg', '<svg width="22" height="22"')}<b class="grow">${t(k)}</b></a>`).join('')}</div>`);
}
