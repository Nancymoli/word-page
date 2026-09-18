/* ============================================================
   小张刷英语 · App版 - 全部逻辑
   ============================================================ */

const THEME_KEY = 'appTheme_v2';
const MASTERY_KEY = 'masteryMap_v2';
const STAR_KEY = 'starMap_v2';
const SETTINGS_KEY = 'settings_v2';
const DAILY_KEY = 'dailyStats_v2';
const TODAY_LOG_KEY = 'todayLog_v2';

const dictConfig = [
  { name: "小学词汇", files: ["primarylist1.json","primarylist2.json","primarylist3.json","primarylist4.json","primarylist5.json","primarylist6.json","primarylist7.json","primarylist8.json","primarylist9.json","primarylist10.json","primarylist11.json","primarylist12.json","primarylist13.json","primarylist14.json","primarylist15.json","primarylist16.json","primarylist17.json","primarylist18.json","primarylist19.json","primarylist20.json"] },
  { name: "初中词汇", files: ["juniorlist1.json","juniorlist2.json","juniorlist3.json","juniorlist4.json","juniorlist5.json","juniorlist6.json","juniorlist7.json","juniorlist8.json","juniorlist9.json","juniorlist10.json","juniorlist11.json","juniorlist12.json","juniorlist13.json","juniorlist14.json","juniorlist15.json","juniorlist16.json","juniorlist17.json","juniorlist18.json","juniorlist19.json","juniorlist20.json"] },
  { name: "高中词汇", files: ["seniorlist1.json","seniorlist2.json","seniorlist3.json","seniorlist4.json","seniorlist5.json","seniorlist6.json","seniorlist7.json","seniorlist8.json","seniorlist9.json","seniorlist10.json","seniorlist11.json","seniorlist12.json","seniorlist13.json","seniorlist14.json","seniorlist15.json","seniorlist16.json","seniorlist17.json","seniorlist18.json","seniorlist19.json","seniorlist20.json"] },
  { name: "四级词汇 4000词", files: ["cet4list1.json","cet4list2.json","cet4list3.json","cet4list4.json","cet4list5.json","cet4list6.json","cet4list7.json","cet4list8.json","cet4list9.json","cet4list10.json","cet4list11.json","cet4list12.json","cet4list13.json","cet4list14.json","cet4list15.json","cet4list16.json","cet4list17.json","cet4list18.json","cet4list19.json","cet4list20.json"] },
  { name: "六级词汇", files: ["cet6list1.json","cet6list2.json","cet6list3.json","cet6list4.json","cet6list5.json","cet6list6.json","cet6list7.json","cet6list8.json","cet6list9.json","cet6list10.json","cet6list11.json","cet6list12.json","cet6list13.json","cet6list14.json","cet6list15.json","cet6list16.json","cet6list17.json","cet6list18.json","cet6list19.json","cet6list20.json"] },
  { name: "考研词汇", files: ["kaoyanlist1.json","kaoyanlist2.json","kaoyanlist3.json","kaoyanlist4.json","kaoyanlist5.json","kaoyanlist6.json","kaoyanlist7.json","kaoyanlist8.json","kaoyanlist9.json","kaoyanlist10.json","kaoyanlist11.json","kaoyanlist12.json","kaoyanlist13.json","kaoyanlist14.json","kaoyanlist15.json","kaoyanlist16.json","kaoyanlist17.json","kaoyanlist18.json","kaoyanlist19.json","kaoyanlist20.json"] },
  { name: "雅思词汇", files: ["ieltslist1.json","ieltslist2.json","ieltslist3.json","ieltslist4.json","ieltslist5.json","ieltslist6.json","ieltslist7.json","ieltslist8.json","ieltslist9.json","ieltslist10.json","ieltslist11.json","ieltslist12.json","ieltslist13.json","ieltslist14.json","ieltslist15.json","ieltslist16.json","ieltslist17.json","ieltslist18.json","ieltslist19.json","ieltslist20.json"] }
];

let wordList = [];
let viewList = [];
let currentIndex = 0;
let running = false;
let isSpeaking = false;
let speechToken = 0;
let displaySession = 0;
let switching = false;
let playing = false;
let masteryMap = {};
let starMap = {};
let dailyStats = {};
let dailyGoal = 20;
let filterMode = 'all';
let elapsedSeconds = 0;
let timerInterval = null;

const $ = (id) => document.getElementById(id);

const domWord = $('word');
const domMean = $('meaning');
const domSenEn = $('senEn');
const domSenCn = $('senCn');
const cardContent = $('cardContent');
const card = $('card');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

let toastTimer = null;
function showToast(msg, duration = 1800) {
  const el = $('toast');
  el.innerText = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), duration);
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function loadAll() {
  try { masteryMap = JSON.parse(localStorage.getItem(MASTERY_KEY) || '{}'); } catch(e) { masteryMap = {}; }
  try { starMap = JSON.parse(localStorage.getItem(STAR_KEY) || '{}'); } catch(e) { starMap = {}; }
  try { dailyStats = JSON.parse(localStorage.getItem(DAILY_KEY) || '{}'); } catch(e) { dailyStats = {}; }
  const s = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
  if (s.interval) $('interval').value = s.interval;
  if (s.enReadCount) $('enReadCount').value = s.enReadCount;
  if (s.speechRate) $('speechRate').value = s.speechRate;
  if (s.readEn !== undefined) $('readEnSwitch').classList.toggle('active', s.readEn);
  if (s.readMean !== undefined) $('readMeanSwitch').classList.toggle('active', s.readMean);
  if (s.readSen !== undefined) $('readSenSwitch').classList.toggle('active', s.readSen);
  if (s.dailyGoal) { dailyGoal = s.dailyGoal; $('dailyGoal').value = s.dailyGoal; }
}

function saveMastery() { try { localStorage.setItem(MASTERY_KEY, JSON.stringify(masteryMap)); } catch(e) {} }
function saveStar() { try { localStorage.setItem(STAR_KEY, JSON.stringify(starMap)); } catch(e) {} }
function saveDaily() { try { localStorage.setItem(DAILY_KEY, JSON.stringify(dailyStats)); } catch(e) {} }
function saveSettings() {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({
      interval: $('interval').value,
      enReadCount: $('enReadCount').value,
      speechRate: $('speechRate').value,
      readEn: $('readEnSwitch').classList.contains('active'),
      readMean: $('readMeanSwitch').classList.contains('active'),
      readSen: $('readSenSwitch').classList.contains('active'),
      dailyGoal: dailyGoal
    }));
  } catch(e) {}
}

function setTheme(name) {
  document.body.dataset.theme = name;
  try { localStorage.setItem(THEME_KEY, name); } catch(e) {}
  document.querySelectorAll('.theme-swatch').forEach(s => {
    s.classList.toggle('active', s.dataset.theme === name);
  });
}
function loadTheme() {
  let name = 'cream';
  try { name = localStorage.getItem(THEME_KEY) || 'cream'; } catch(e) {}
  setTheme(name);
}

function switchTab(name) {
  document.querySelectorAll('.tab-page').forEach(p => {
    p.classList.toggle('active', p.dataset.tab === name);
  });
  document.querySelectorAll('.tab-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === name);
  });
  if (name === 'data') updateStatsUI();
  if (name === 'star') refreshStarTab();
}

function resetSpeech() {
  try { window.speechSynthesis.cancel(); } catch(e) {}
  isSpeaking = false;
  displaySession++;
}

async function speakText(text, lang = "en-US") {
  if (!text || !('speechSynthesis' in window)) return;
  const myToken = ++speechToken;
  let waitCount = 0;
  while (isSpeaking && waitCount < 20) {
    await sleep(100); waitCount++;
  }
  if (myToken !== speechToken) return;

  try {
    const voices = window.speechSynthesis.getVoices();
    const isZh = lang.toLowerCase().startsWith('zh');
    if (voices.length > 0) {
      const hasVoice = voices.some(v => v.lang && v.lang.toLowerCase().startsWith(isZh ? 'zh' : 'en'));
      if (!hasVoice) return;
    }
  } catch(e) {}

  isSpeaking = true;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = lang.toLowerCase().startsWith('zh') ? 'zh-CN' : 'en-US';
  utter.pitch = 1.0;
  utter.rate = Number($('speechRate').value) || 1;
  utter.volume = 1;

  return new Promise((resolve) => {
    utter.onend = () => { if (myToken === speechToken) isSpeaking = false; resolve(); };
    utter.onerror = () => { if (myToken === speechToken) isSpeaking = false; resolve(); };
    try { window.speechSynthesis.speak(utter); }
    catch(e) { isSpeaking = false; resolve(); }
  });
}

async function speakWordAudio(item, session) {
  if (!item || session !== displaySession) return;
  if ($('readEnSwitch').classList.contains('active') && item.word) {
    const times = Number($('enReadCount').value) || 2;
    for (let i = 0; i < times; i++) {
      if (session !== displaySession) return;
      await speakText(item.word, "en-US");
    }
  }
  if (session !== displaySession) return;
  if ($('readMeanSwitch').classList.contains('active') && item.mean) {
    await speakText(item.mean, 'zh-CN');
  }
  if (session !== displaySession) return;
  if ($('readSenSwitch').classList.contains('active') && item.sentenceEn) {
    await speakText(item.sentenceEn, 'en-US');
    if (session !== displaySession) return;
    if (item.sentenceCn) await speakText(item.sentenceCn, 'zh-CN');
  }
}

async function showWord(item) {
  if (!item) return;
  const session = displaySession;

  cardContent.classList.remove('fade-in');
  cardContent.classList.add('fade-out');
  await sleep(200);
  if (session !== displaySession) {
    cardContent.classList.remove('fade-out');
    return;
  }

  domWord.classList.remove('waiting');
  domWord.innerText = item.word || '';
  domMean.innerText = item.mean || '';
  domSenEn.innerText = item.sentenceEn || '';
  domSenCn.innerText = item.sentenceCn || '';

  cardContent.classList.remove('fade-out');
  cardContent.classList.add('fade-in');

  updateProgress();
  updateMasteryButtons();

  await speakWordAudio(item, session);
  if (session !== displaySession) return;

  if (running) {
    await sleep(Number($('interval').value) * 1000);
    if (session !== displaySession) return;
    if (running) nextWord();
  }
}

function updateMasteryButtons() {
  const item = viewList[currentIndex];
  const weak = $('markWeak');
  const mastered = $('markMastered');
  weak.classList.remove('active');
  mastered.classList.remove('active');
  if (!item) return;
  const st = masteryMap[item.word];
  if (st === 'weak') weak.classList.add('active');
  if (st === 'mastered') mastered.classList.add('active');
}

function updateProgress() {
  $('progressNum').innerText = viewList.length ? currentIndex + 1 : 0;
  $('progressTotal').innerText = viewList.length;
  const pct = viewList.length ? ((currentIndex + 1) / viewList.length) * 100 : 0;
  $('progressFill').style.width = pct + '%';
}

async function nextWord() {
  if (viewList.length === 0) return;
  if (switching) return;
  switching = true;
  try {
    currentIndex = (currentIndex + 1) % viewList.length;
    await showWord(viewList[currentIndex]);
  } finally { switching = false; }
}

async function prevWord() {
  if (viewList.length === 0) return;
  if (switching) return;
  switching = true;
  try {
    if (running) running = false;
    resetSpeech();
    currentIndex = (currentIndex - 1 + viewList.length) % viewList.length;
    await showWord(viewList[currentIndex]);
  } finally { switching = false; }
}

function markMastery(word, status) {
  if (!word) return;
  if (masteryMap[word] === status) {
    delete masteryMap[word];
  } else {
    masteryMap[word] = status;
  }
  saveMastery();

  if (masteryMap[word]) {
    const today = todayStr();
    let todayLog = {};
    try { todayLog = JSON.parse(localStorage.getItem(TODAY_LOG_KEY) || '{}'); } catch(e) {}
    if (!todayLog[today] || !todayLog[today].includes(word)) {
      todayLog[today] = todayLog[today] || [];
      todayLog[today].push(word);
      dailyStats[today] = (dailyStats[today] || 0) + 1;
      saveDaily();
      localStorage.setItem(TODAY_LOG_KEY, JSON.stringify(todayLog));
      if (dailyStats[today] === dailyGoal) {
        showToast('🎉 今日目标达成！');
      }
    }
  }
  updateStatsUI();
  updateMasteryButtons();
}

function updateStatsUI() {
  const total = wordList.length;
  let mastered = 0, weak = 0, star = 0;
  for (const w in masteryMap) {
    if (masteryMap[w] === 'mastered') mastered++;
    else if (masteryMap[w] === 'weak') weak++;
  }
  for (const w in starMap) if (starMap[w]) star++;
  const unseen = total - mastered - weak;

  $('statUnseen').innerText = unseen;
  $('statMastered').innerText = mastered;
  $('statWeak').innerText = weak;
  $('statStar').innerText = star;

  const pct = total ? Math.round((mastered / total) * 100) : 0;
  $('ringPct').innerText = pct + '%';
  $('ringSub').innerText = `${mastered} / ${total}`;
  const circumference = 2 * Math.PI * 58;
  $('ringFill').style.strokeDashoffset = circumference * (1 - pct / 100);

  const today = todayStr();
  $('statToday').innerText = dailyStats[today] || 0;
  $('statGoal').innerText = dailyGoal;

  let streak = 0;
  const d = new Date();
  while (true) {
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    if (dailyStats[key] && dailyStats[key] > 0) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else break;
  }
  $('statStreak').innerText = streak;

  updateWeekChart();
}

function updateWeekChart() {
  const bars = document.querySelectorAll('.week-bar');
  if (bars.length === 0) return;
  const today = new Date();
  const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek - 1));
  const values = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    values.push(dailyStats[key] || 0);
  }
  const max = Math.max(...values, 1);
  bars.forEach((bar, i) => {
    const h = Math.max(4, (values[i] / max) * 60);
    bar.style.height = h + 'px';
  });
}

function refreshStarTab() {
  const container = $('starList');
  const list = [];
  for (const w in starMap) if (starMap[w]) list.push(w);
  if (list.length === 0) {
    container.innerHTML = `<div class="star-empty"><span class="emoji">⭐</span>还没有收藏的单词<br>点击卡片上的 ☆ 加入生词本</div>`;
    return;
  }
  const map = {};
  wordList.forEach(item => { map[item.word] = item; });
  container.innerHTML = list.map(w => {
    const item = map[w] || { word: w, mean: '' };
    const st = masteryMap[w];
    const badge = st === 'mastered' ? '✅' : (st === 'weak' ? '❌' : '');
    return `<div class="star-item" data-word="${escapeHtml(w)}">
      <div class="info">
        <div class="en">${escapeHtml(item.word)} ${badge}</div>
        <div class="cn">${escapeHtml(item.mean || '')}</div>
      </div>
      <div class="actions">
        <button class="btn-soft" data-action="remove">✕</button>
      </div>
    </div>`;
  }).join('');

  container.querySelectorAll('.star-item').forEach(el => {
    el.querySelector('[data-action="remove"]').onclick = (e) => {
      e.stopPropagation();
      const w = el.dataset.word;
      delete starMap[w];
      saveStar();
      refreshStarTab();
      updateStatsUI();
    };
    el.onclick = () => {
      const w = el.dataset.word;
      jumpToWord(w);
      switchTab('study');
    };
  });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function jumpToWord(word) {
  let idx = viewList.findIndex(item => item.word === word);
  if (idx < 0) {
    filterMode = 'all';
    applyFilter();
    idx = viewList.findIndex(item => item.word === word);
  }
  if (idx >= 0) {
    currentIndex = idx;
    showWord(viewList[currentIndex]);
  }
}

function applyFilter() {
  if (filterMode === 'weak') {
    viewList = wordList.filter(item => masteryMap[item.word] === 'weak');
  } else if (filterMode === 'star') {
    viewList = wordList.filter(item => starMap[item.word]);
  } else {
    viewList = wordList.slice();
  }
  if (viewList.length === 0 && wordList.length > 0) {
    showToast('当前筛选没有单词');
    viewList = wordList.slice();
    filterMode = 'all';
  }
  currentIndex = 0;
  updateProgress();
  updateMasteryButtons();
}

function showLoadProgress(done, total) {
  const bar = $('loadProgressBar');
  if (!bar) return;
  bar.style.display = 'block';
  const pct = Math.min(100, Math.round((done / total) * 100));
  $('loadProgressFill').style.width = pct + '%';
  $('loadProgressNum').innerText = pct;
}
function hideLoadProgress() {
  const bar = $('loadProgressBar');
  if (!bar) return;
  $('loadProgressFill').style.width = '100%';
  $('loadProgressNum').innerText = '100';
  setTimeout(() => {
    bar.style.display = 'none';
    $('loadProgressFill').style.width = '0%';
    $('loadProgressNum').innerText = '0';
  }, 800);
}

async function loadOnlineDict() {
  const idx = Number($('dictSelect').value);
  const dict = dictConfig[idx];
  if (!dict) return;
  const total = dict.files.length;
  let done = 0;
  const failed = [];
  $('loadStatus').innerText = `正在加载 0/${total} ...`;
  showLoadProgress(0, total);
  showToast(`开始加载 ${dict.name}...`);

  const promises = dict.files.map(filename =>
    fetch(`./${filename}`)
      .then(res => { if (!res.ok) throw new Error('fail'); return res.json(); })
      .then(data => { if (!Array.isArray(data)) throw new Error('not array'); return data; })
      .catch(err => { console.warn(filename, err); failed.push(filename); return []; })
      .finally(() => {
        done++;
        $('loadStatus').innerText = `正在加载 ${done}/${total} ...`;
        showLoadProgress(done, total);
      })
  );

  const results = await Promise.all(promises);
  const merged = results.flat();
  if (merged.length === 0) {
    $('loadStatus').innerText = '❌ 加载失败，请检查文件名';
    hideLoadProgress();
    return;
  }
  wordList = merged;
  filterMode = 'all';
  applyFilter();
  currentIndex = 0;
  updateStatsUI();
  $('loadStatus').innerText = `✅ 共 ${wordList.length} 词`;
  hideLoadProgress();
  showToast(`加载成功 · ${wordList.length} 词`);
  if (wordList.length > 0) showWord(wordList[0]);
}

function handleLocalFiles(e) {
  const files = Array.from(e.target.files);
  if (files.length === 0) return;
  const total = files.length;
  let all = [];
  let done = 0;
  $('loadStatus').innerText = `正在解析 0/${total} ...`;
  showLoadProgress(0, total);

  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const data = JSON.parse(evt.target.result);
        if (Array.isArray(data)) all = all.concat(data);
      } catch(err) { console.warn(file.name, err); }
      done++;
      $('loadStatus').innerText = `正在解析 ${done}/${total} ...`;
      showLoadProgress(done, total);
      if (done === total) finishLocal(all);
    };
    reader.onerror = () => {
      done++;
      if (done === total) finishLocal(all);
    };
    reader.readAsText(file);
  });
}

function finishLocal(all) {
  if (all.length === 0) {
    $('loadStatus').innerText = '❌ 全部解析失败';
    hideLoadProgress();
    return;
  }
  wordList = all;
  filterMode = 'all';
  applyFilter();
  currentIndex = 0;
  updateStatsUI();
  $('loadStatus').innerText = `✅ 本地 ${wordList.length} 词`;
  hideLoadProgress();
  showToast(`导入成功 · ${wordList.length} 词`);
  if (wordList.length > 0) showWord(wordList[0]);
}

let testQuestions = [];
let testIndex = 0;
let testCorrect = 0;
let testWrong = 0;

function startTest() {
  if (wordList.length < 4) {
    showToast('词库太小，无法抽测');
    return;
  }
  const pool = wordList.filter(item => masteryMap[item.word] !== 'mastered');
  const source = pool.length >= 10 ? pool : wordList;
  const shuffled = source.slice().sort(() => Math.random() - 0.5);
  testQuestions = shuffled.slice(0, Math.min(10, shuffled.length));
  testIndex = 0;
  testCorrect = 0;
  testWrong = 0;
  $('testOverlay').classList.add('active');
  renderTestQuestion();
}

function renderTestQuestion() {
  if (testIndex >= testQuestions.length) {
    $('testFooter').innerText = `🎉 完成！✅ ${testCorrect} · ❌ ${testWrong}`;
    $('testProgress').innerText = `全部完成`;
    setTimeout(() => {
      $('testOverlay').classList.remove('active');
      showToast(`抽测完成：答对 ${testCorrect}/${testQuestions.length}`);
      updateStatsUI();
    }, 1500);
    return;
  }
  const q = testQuestions[testIndex];
  $('testProgress').innerText = `第 ${testIndex + 1} / ${testQuestions.length} 题`;
  $('testWord').innerText = q.word;

  const others = wordList.filter(item => item.word !== q.word && item.mean);
  const shuffled = others.slice().sort(() => Math.random() - 0.5);
  const distractors = [];
  for (const item of shuffled) {
    if (distractors.length >= 3) break;
    if (item.mean && !distractors.includes(item.mean)) distractors.push(item.mean);
  }
  while (distractors.length < 3) distractors.push('（干扰项）');

  const options = [q.mean, ...distractors].sort(() => Math.random() - 0.5);

  const container = $('testOptions');
  container.innerHTML = '';
  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'test-option';
    btn.innerText = opt;
    btn.onclick = () => handleAnswer(btn, opt, q);
    container.appendChild(btn);
  });
  $('testFooter').innerText = `✅ ${testCorrect} · ❌ ${testWrong}`;
}

function handleAnswer(btn, choice, q) {
  const allBtns = $('testOptions').querySelectorAll('.test-option');
  allBtns.forEach(b => b.disabled = true);

  const isCorrect = choice === q.mean;
  if (isCorrect) {
    btn.classList.add('correct');
    testCorrect++;
    if (masteryMap[q.word] !== 'mastered') {
      masteryMap[q.word] = 'mastered';
      saveMastery();
    }
  } else {
    btn.classList.add('wrong');
    testWrong++;
    allBtns.forEach(b => { if (b.innerText === q.mean) b.classList.add('correct'); });
    masteryMap[q.word] = 'weak';
    saveMastery();
  }
  $('testFooter').innerText = `✅ ${testCorrect} · ❌ ${testWrong}`;
  testIndex++;
  setTimeout(() => renderTestQuestion(), 800);
}

function setupSwipe() {
  let startX = 0, startY = 0, isDragging = false, moved = false;
  card.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    isDragging = true;
    moved = false;
    card.classList.add('dragging');
  });
  card.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    const dx = e.touches[0].clientX - startX;
    const dy = e.touches[0].clientY - startY;
    if (Math.abs(dx) > 10) moved = true;
    if (Math.abs(dx) > Math.abs(dy)) {
      card.style.transform = `translateX(${dx}px) rotate(${dx * 0.05}deg)`;
      card.classList.toggle('swiping-left', dx < -30);
      card.classList.toggle('swiping-right', dx > 30);
    }
  });
  card.addEventListener('touchend', (e) => {
    if (!isDragging) return;
    isDragging = false;
    card.classList.remove('dragging');
    const dx = (e.changedTouches[0].clientX - startX);
    card.style.transform = '';
    card.classList.remove('swiping-left', 'swiping-right');
    if (dx < -60 && moved) {
      const item = viewList[currentIndex];
      if (item) markMastery(item.word, 'weak');
      nextWord();
    } else if (dx > 60 && moved) {
      const item = viewList[currentIndex];
      if (item) markMastery(item.word, 'mastered');
      nextWord();
    } else if (!moved) {
      const item = viewList[currentIndex];
      if (item) {
        resetSpeech();
        speakText(item.word, 'en-US');
      }
    }
  });
}

function exportData() {
  const data = {
    mastery: masteryMap,
    star: starMap,
    daily: dailyStats,
    exportAt: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `背单词数据_${todayStr()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('已导出');
}

function initDictSelect() {
  dictConfig.forEach((item, idx) => {
    const opt1 = document.createElement('option');
    opt1.value = idx;
    opt1.innerText = item.name;
    $('dictSelect').appendChild(opt1);

    const opt2 = document.createElement('option');
    opt2.value = idx;
    opt2.innerText = item.name;
    $('dictSelectQuick').appendChild(opt2);
  });
}

function bindEvents() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.onclick = () => switchTab(btn.dataset.tab);
  });

  document.querySelectorAll('.theme-swatch').forEach(sw => {
    sw.onclick = () => setTheme(sw.dataset.theme);
  });

  $('markWeak').onclick = () => {
    const item = viewList[currentIndex];
    if (item) markMastery(item.word, 'weak');
  };
  $('markMastered').onclick = () => {
    const item = viewList[currentIndex];
    if (item) markMastery(item.word, 'mastered');
  };

  $('prevBtn').onclick = () => prevWord();
  $('nextBtn').onclick = () => nextWord();
  $('listenBtn').onclick = () => {
    const item = viewList[currentIndex];
    if (item) {
      resetSpeech();
      speakWordAudio(item, displaySession);
    }
  };

  $('dictSelect').onchange = saveSettings;
  $('interval').onchange = saveSettings;
  $('enReadCount').onchange = saveSettings;
  $('speechRate').onchange = saveSettings;
  $('readEnSwitch').onclick = () => { $('readEnSwitch').classList.toggle('active'); saveSettings(); };
  $('readMeanSwitch').onclick = () => { $('readMeanSwitch').classList.toggle('active'); saveSettings(); };
  $('readSenSwitch').onclick = () => { $('readSenSwitch').classList.toggle('active'); saveSettings(); };
  $('dailyGoal').onchange = () => {
    dailyGoal = Number($('dailyGoal').value) || 20;
    $('statGoal').innerText = dailyGoal;
    saveSettings();
    updateStatsUI();
  };

  $('loadOnline').onclick = () => {
    $('dictSelectQuick').value = $('dictSelect').value;
    loadOnlineDict();
  };
  $('loadOnlineQuick').onclick = () => {
    $('dictSelect').value = $('dictSelectQuick').value;
    loadOnlineDict();
  };
  $('importLocal').onclick = () => $('fileInput').click();
  $('fileInput').onchange = handleLocalFiles;

  $('exportData').onclick = exportData;
  $('resetData').onclick = () => {
    if (!confirm('确定清空所有掌握/不熟标记吗？')) return;
    masteryMap = {};
    starMap = {};
    saveMastery();
    saveStar();
    updateStatsUI();
    refreshStarTab();
    showToast('已清空');
  };

  $('testBtn').onclick = startTest;
  $('testClose').onclick = () => {
    $('testOverlay').classList.remove('active');
    updateStatsUI();
  };

  $('reviewWeakBtn').onclick = () => {
    filterMode = 'weak';
    applyFilter();
    if (viewList.length === 0) {
      showToast('还没有标记"不熟"的词');
      return;
    }
    showToast(`只看不熟：${viewList.length} 词`);
    switchTab('study');
    showWord(viewList[0]);
  };
  $('reviewAllBtn').onclick = () => {
    filterMode = 'all';
    applyFilter();
    switchTab('study');
    showToast(`全部 ${viewList.length} 词`);
    showWord(viewList[0]);
  };
  $('reviewStarBtn').onclick = () => {
    filterMode = 'star';
    applyFilter();
    if (viewList.length === 0) {
      showToast('还没有收藏的词');
      return;
    }
    showToast(`只看生词：${viewList.length} 词`);
    switchTab('study');
    showWord(viewList[0]);
  };
}

function init() {
  loadTheme();
  loadAll();
  initDictSelect();
  bindEvents();
  setupSwipe();
  timerInterval = setInterval(() => {
    elapsedSeconds++;
    $('statTime').innerText = Math.floor(elapsedSeconds / 60);
  }, 1000);
  updateStatsUI();
  updateProgress();
}

init();
