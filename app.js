/* CrossBorder Campus — static demo (no build step, no server)
   All data is fictional demo data for student Lin Xiaoman (林小满).
   Private mode stores the user's own entries in localStorage only.
   Nothing in this file is sent to any server except the public FX rate fetch. */
(function () {
  'use strict';

  var FALLBACK_RATE = 5.17;
  var state = { rate: FALLBACK_RATE, rateLive: false, demo: true };

  /* ---------- fictional demo data (clearly labelled demo) ---------- */
  var DEMO = {
    budget: 1500, spent: 900,
    income: 1800, fixed: 1100,
    expenses: [
      { amount: 28, currency: 'SGD', category: '餐饮', note: '学校食堂午饭', date: '演示' },
      { amount: 12, currency: 'SGD', category: '交通', note: '地铁周卡分摊', date: '演示' },
      { amount: 86, currency: 'CNY', category: '餐饮', note: '回家前和朋友聚餐', date: '演示' },
      { amount: 45, currency: 'SGD', category: '学习', note: '打印与文具', date: '演示' },
      { amount: 30, currency: 'SGD', category: '娱乐', note: '电影票（演示）', date: '演示' }
    ],
    reminders: [
      { text: '储蓄债券申请截止（演示日期）', date: '2026-11-25', done: false },
      { text: 'SLAY HACKS 提交截止', date: '2026-12-07', done: false },
      { text: '比赛领奖确认（演示）', date: '2026-12-17', done: false },
      { text: '整理回国行李清单', date: '', done: false }
    ],
    checkReturn: [
      { text: '确认机票与行李额度', done: true },
      { text: '把要用的钱换成人民币', done: false },
      { text: '备份学习资料', done: false }
    ],
    checkBack: [
      { text: '确认返新日期与住宿', done: false },
      { text: '留好返校后第一个月开销', done: false },
      { text: '检查签证与证件有效期', done: false }
    ]
  };

  /* ---------- helpers ---------- */
  function $(id) { return document.getElementById(id); }
  function fmtSGD(n) { return 'S$' + Number(n).toLocaleString('en-SG', { maximumFractionDigits: 2 }); }
  function fmtCNY(n) { return '¥' + Number(n).toLocaleString('en-US', { maximumFractionDigits: 2 }); }
  function todayPlus(days) {
    var d = new Date(); d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  }
  function loadJSON(key, fallback) {
    try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
    catch (e) { return fallback; }
  }
  function saveJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* storage full/blocked: keep in memory only */ }
  }
  function toSGD(exp) {
    return exp.currency === 'CNY' ? exp.amount / state.rate : exp.amount;
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ---------- tabs ---------- */
  var tabs = document.querySelectorAll('.tab');
  tabs.forEach(function (btn) {
    btn.addEventListener('click', function () {
      tabs.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      document.querySelectorAll('.panel').forEach(function (p) { p.classList.remove('active'); });
      $('tab-' + btn.dataset.tab).classList.add('active');
    });
  });

  /* ---------- countdowns (demo: today + 68 / + 250 days) ---------- */
  function renderCountdowns() {
    var cards = document.querySelectorAll('.count-card');
    $('cdReturn').textContent = '68';
    $('cdBack').textContent = '250';
    if (cards[0]) cards[0].querySelector('small').textContent = '演示日期 · ' + todayPlus(68);
    if (cards[1]) cards[1].querySelector('small').textContent = '演示日期 · ' + todayPlus(250);
  }

  /* ---------- budget ring ---------- */
  function renderBudget() {
    var spent = state.demo ? DEMO.spent : currentExpenses().reduce(function (s, e) { return s + toSGD(e); }, 0);
    var total = state.demo ? DEMO.budget : (Number($('coachIncome').value) || DEMO.budget);
    var pct = total > 0 ? Math.min(100, Math.round(spent / total * 100)) : 0;
    var circ = 2 * Math.PI * 52;
    $('ringArc').style.strokeDashoffset = String(circ * (1 - pct / 100));
    $('ringPct').textContent = pct + '%';
    $('budgetTotal').textContent = fmtSGD(total);
    $('budgetSpent').textContent = fmtSGD(Math.round(spent * 100) / 100);
    $('budgetLeft').textContent = fmtSGD(Math.max(0, Math.round((total - spent) * 100) / 100));
  }

  /* ---------- FX ---------- */
  function renderFX() {
    var amt = Number($('fxAmount').value) || 0;
    $('fxOut').value = fmtCNY(amt * state.rate);
    renderRemit();
  }
  function renderRemit() {
    var amt = Number($('remitAmount').value) || 0;
    var back = amt >= 1500 ? 60 : (amt >= 300 ? 12 : 0);
    $('remitOut').value = back ? 'S$' + back : 'S$0（未达门槛）';
    $('remitNote').textContent = back === 60
      ? '达到 S$1,500 门槛，可拿满 S$60 一次性返现。换汇前请先确认银行实时汇率与到账时间。'
      : back === 12
      ? '达到 S$300 门槛，可拿 S$12 一次性返现；单笔满 S$1,500 可拿满 S$60。'
      : '未达到 S$300 门槛，没有返现。单笔 ≥ S$300 返 S$12，≥ S$1,500 返 S$60，每人限一次。';
  }
  function fetchRate() {
    fetch('https://open.er-api.com/v6/latest/SGD')
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (d && d.rates && d.rates.CNY) {
          state.rate = d.rates.CNY;
          state.rateLive = true;
          $('fxRate').textContent = state.rate.toFixed(3);
          $('fxMeta').textContent = '实时汇率 · ExchangeRate-API · 更新于 ' + (d.time_last_update_utc || '刚才') + '（UTC）';
          renderFX(); renderBudget(); renderExpenses();
        } else { throw new Error('no rate'); }
      })
      .catch(function () {
        state.rate = FALLBACK_RATE; state.rateLive = false;
        $('fxRate').textContent = FALLBACK_RATE.toFixed(2);
        $('fxMeta').textContent = '离线兜底值 5.17（演示）· 未能拉取实时汇率，请检查网络后刷新。';
        renderFX();
      });
  }
  $('fxAmount').addEventListener('input', renderFX);
  $('remitAmount').addEventListener('input', renderRemit);

  /* ---------- expenses ---------- */
  function currentExpenses() {
    if (state.demo) return DEMO.expenses.slice();
    return loadJSON('cbc_expenses_v1', []);
  }
  function renderExpenses() {
    var list = currentExpenses();
    var total = list.reduce(function (s, e) { return s + toSGD(e); }, 0);
    $('expTotalLabel').textContent = '· 折合 ' + fmtSGD(Math.round(total * 100) / 100) + '（人民币按当前汇率 ' + state.rate.toFixed(2) + ' 折算）';
    var byCat = {};
    list.forEach(function (e) { byCat[e.category] = (byCat[e.category] || 0) + toSGD(e); });
    $('expSummary').innerHTML = Object.keys(byCat).length
      ? Object.keys(byCat).map(function (c) {
          return '<span class="exp-chip">' + esc(c) + ' ' + fmtSGD(Math.round(byCat[c] * 100) / 100) + '</span>';
        }).join('')
      : '<span class="muted small">暂无分类汇总</span>';
    $('expList').innerHTML = list.map(function (e, i) {
      var del = state.demo ? '' : '<button class="exp-del" data-i="' + i + '" aria-label="删除这笔">×</button>';
      return '<li><span><strong>' + (e.currency === 'CNY' ? fmtCNY(e.amount) : fmtSGD(e.amount)) + '</strong> · ' + esc(e.category) +
        '<small>' + esc(e.note || '') + ' · ' + esc(e.date || '') + '</small></span>' + del + '</li>';
    }).join('');
    $('expEmpty').style.display = list.length ? 'none' : 'block';
    document.querySelectorAll('.exp-del').forEach(function (b) {
      b.addEventListener('click', function () {
        var arr = loadJSON('cbc_expenses_v1', []);
        arr.splice(Number(b.dataset.i), 1);
        saveJSON('cbc_expenses_v1', arr);
        renderExpenses(); renderBudget();
      });
    });
  }
  $('expAddBtn').addEventListener('click', function () {
    if (state.demo) return;
    var amt = Number($('expAmount').value);
    if (!amt || amt <= 0) { alert('请先输入大于 0 的金额'); return; }
    var arr = loadJSON('cbc_expenses_v1', []);
    arr.unshift({
      amount: amt,
      currency: $('expCurrency').value,
      category: $('expCategory').value,
      note: $('expNote').value.trim(),
      date: new Date().toISOString().slice(0, 10)
    });
    saveJSON('cbc_expenses_v1', arr);
    $('expAmount').value = ''; $('expNote').value = '';
    renderExpenses(); renderBudget();
  });

  /* ---------- checklist / reminders ---------- */
  function currentTodos() {
    if (state.demo) return {
      reminders: DEMO.reminders.map(function (r) { return { text: r.text, date: r.date, done: r.done }; }),
      ret: DEMO.checkReturn.map(function (r) { return { text: r.text, done: r.done }; }),
      back: DEMO.checkBack.map(function (r) { return { text: r.text, done: r.done }; })
    };
    return {
      reminders: loadJSON('cbc_reminders_v1', []),
      ret: loadJSON('cbc_check_return_v1', []),
      back: loadJSON('cbc_check_back_v1', [])
    };
  }
  function saveTodos(t) {
    if (state.demo) return;
    saveJSON('cbc_reminders_v1', t.reminders);
    saveJSON('cbc_check_return_v1', t.ret);
    saveJSON('cbc_check_back_v1', t.back);
  }
  function todoItemHTML(item, i, kind) {
    var toggle = state.demo
      ? '<input type="checkbox" disabled' + (item.done ? ' checked' : '') + '>'
      : '<input type="checkbox" data-kind="' + kind + '" data-i="' + i + '"' + (item.done ? ' checked' : '') + '>';
    var del = state.demo ? '' : ' <button class="exp-del" data-del-kind="' + kind + '" data-i="' + i + '" aria-label="删除">×</button>';
    var date = item.date ? '<small>' + esc(item.date) + '</small>' : '';
    return '<li class="' + (item.done ? 'done' : '') + '">' + toggle + '<span>' + esc(item.text) + '</span>' + date + del + '</li>';
  }
  function renderTodos() {
    var t = currentTodos();
    $('reminderList').innerHTML = t.reminders.length
      ? t.reminders.map(function (r, i) { return todoItemHTML(r, i, 'reminders'); }).join('')
      : '<li class="muted">暂无提醒</li>';
    $('listReturn').innerHTML = t.ret.length
      ? t.ret.map(function (r, i) { return todoItemHTML(r, i, 'ret'); }).join('')
      : '<li class="muted">暂无清单项</li>';
    $('listBack').innerHTML = t.back.length
      ? t.back.map(function (r, i) { return todoItemHTML(r, i, 'back'); }).join('')
      : '<li class="muted">暂无清单项</li>';
    document.querySelectorAll('#tab-checklist input[type="checkbox"][data-kind]').forEach(function (cb) {
      cb.addEventListener('change', function () {
        var todos = currentTodos();
        todos[cb.dataset.kind][Number(cb.dataset.i)].done = cb.checked;
        saveTodos(todos); renderTodos();
      });
    });
    document.querySelectorAll('#tab-checklist [data-del-kind]').forEach(function (b) {
      b.addEventListener('click', function () {
        var todos = currentTodos();
        todos[b.dataset.delKind].splice(Number(b.dataset.i), 1);
        saveTodos(todos); renderTodos();
      });
    });
  }
  $('addReminderBtn').addEventListener('click', function () {
    if (state.demo) return;
    var text = $('newReminderText').value.trim();
    if (!text) { alert('请先输入提醒内容'); return; }
    var t = currentTodos();
    t.reminders.push({ text: text, date: $('newReminderDate').value || '', done: false });
    saveTodos(t);
    $('newReminderText').value = ''; $('newReminderDate').value = '';
    renderTodos();
  });
  $('addCheckBtn').addEventListener('click', function () {
    if (state.demo) return;
    var text = $('newCheckText').value.trim();
    if (!text) { alert('请先输入清单内容'); return; }
    var t = currentTodos();
    t[$('newCheckSide').value].push({ text: text, done: false });
    saveTodos(t);
    $('newCheckText').value = '';
    renderTodos();
  });

  /* ---------- AI Budget Coach (local rule-based demo of the same logic) ---------- */
  $('coachBtn').addEventListener('click', function () {
    var income = Number($('coachIncome').value) || 0;
    var spent = Number($('coachSpent').value) || 0;
    var fixed = Number($('coachFixed').value) || 0;
    var q = $('coachQuestion').value.trim();
    var remaining = income - spent;
    var afterFixed = remaining - fixed;
    var daysLeft = 30 - new Date().getDate() + 1;
    var daily = daysLeft > 0 ? Math.max(0, remaining / daysLeft) : remaining;

    var headline, summary, tips, action;
    if (remaining < 0) {
      headline = '这个月已经超支了，先稳住，别再新增大额开销';
      summary = '按你输入的数字，本月已花超过了总收入 ' + fmtSGD(Math.abs(remaining)) + '。先把剩下的日子按最低开销过，下个月再重新规划。';
      tips = [
        '接下来每天最多花 ' + fmtSGD(0) + '，只保留吃饭和交通这类必要开销。',
        '检查有没有可推迟的非必要消费，推迟到下个月。',
        '把下月固定开销 ' + fmtSGD(fixed) + ' 先单独留出来，不要和日常开销混在一起。'
      ];
      action = '今天先列出未来 7 天必须花的钱，其他消费全部暂停一天。';
    } else if (afterFixed < 0) {
      headline = '日常还能花，但下月固定开销还没完全留够';
      summary = '本月还剩 ' + fmtSGD(remaining) + '，但下月固定开销要 ' + fmtSGD(fixed) + '，还差 ' + fmtSGD(Math.abs(afterFixed)) + '。';
      tips = [
        '接下来每天最多花 ' + fmtSGD(Math.round(daily * 100) / 100) + '，剩下的钱优先留给固定开销。',
        '餐饮和娱乐先各砍一档，缺口通常能从这两项补上。',
        '如果有单笔大额消费，先问一句：能不能等到下个月？'
      ];
      action = '今天把 ' + fmtSGD(Math.abs(afterFixed)) + ' 的缺口记下来，写进下月计划的第一行。';
    } else {
      headline = '预算是健康的，剩下的钱可以按三程计划分配';
      summary = '本月还剩 ' + fmtSGD(remaining) + '，扣掉下月固定开销 ' + fmtSGD(fixed) + ' 后还剩 ' + fmtSGD(afterFixed) + '，每天最多可花 ' + fmtSGD(Math.round(daily * 100) / 100) + '。';
      tips = [
        '每天不超过 ' + fmtSGD(Math.round(daily * 100) / 100) + '，月底自然不会超。',
        '把结余按三程分开：活期缓冲、回国要用的钱、返校后第一个月开销。',
        '换汇时先看返现门槛：单笔 ≥ S$300 返 S$12，≥ S$1,500 返 S$60，每人限一次。'
      ];
      action = '今天把结余分成三份，分别写在三程计划里。';
    }
    if (q) summary += '（你问的是「' + q + '」，上面已按你的数字作答。）';

    $('coachHeadline').textContent = headline;
    $('coachSummary').textContent = summary;
    $('coachTips').innerHTML = tips.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('');
    $('coachAction').textContent = action;
    $('coachBasedOn').textContent = '基于' + (state.demo ? '演示' : '你输入的') + '数字：收入 ' + fmtSGD(income) + '，已花 ' + fmtSGD(spent) + '，下月固定开销 ' + fmtSGD(fixed) + '。完整版用服务端大模型在匿名汇总数字上推理；本页是同一逻辑的本地规则演示，不上传任何数据。';
    $('coachResult').hidden = false;
    $('coachResult').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  /* ---------- copy button ---------- */
  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var ta = $(btn.dataset.copy);
      function done() { $('copyMsg').textContent = '已复制，去 Devpost 粘贴即可。'; }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(ta.value).then(done, function () { ta.select(); document.execCommand('copy'); done(); });
      } else { ta.select(); document.execCommand('copy'); done(); }
    });
  });

  /* ---------- demo mode ---------- */
  var EDIT_IDS = ['coachIncome', 'coachSpent', 'coachFixed', 'coachQuestion',
    'expAmount', 'expCurrency', 'expCategory', 'expNote', 'expAddBtn',
    'newReminderText', 'newReminderDate', 'addReminderBtn',
    'newCheckText', 'newCheckSide', 'addCheckBtn'];
  function setDemoMode(on) {
    state.demo = on;
    $('demoToggle').checked = on;
    $('demoState').textContent = on ? '开 · 林小满' : '关 · 我的数据';
    $('demoState').className = 'demo-state ' + (on ? 'on' : 'off');
    $('demoBanner').classList.toggle('hidden', !on);
    EDIT_IDS.forEach(function (id) { var el = $(id); if (el) el.disabled = on; });
    if (on) {
      $('coachIncome').value = DEMO.income;
      $('coachSpent').value = DEMO.spent;
      $('coachFixed').value = DEMO.fixed;
      $('coachQuestion').value = '';
      $('coachResult').hidden = true;
    }
    renderBudget(); renderExpenses(); renderTodos();
  }
  $('demoToggle').addEventListener('change', function () { setDemoMode(this.checked); });

  /* ---------- init ---------- */
  renderCountdowns();
  setDemoMode(true);
  renderFX();
  fetchRate();
})();
