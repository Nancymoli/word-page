/* ============================================================
   小张刷英语 · ADHD友好版 - 全部逻辑
   ============================================================ */

// ================= 主题 =================
const THEME_KEY = 'appTheme_v1';

function setTheme(name) {
  document.body.dataset.theme = name;
  try { localStorage.setItem(THEME_KEY, name); } catch (e) {}
  const sel = document.getElementById('themeSelect');
  if (sel) sel.value = name;
}
function loadTheme() {
  let name = 'cream';
  try { name = localStorage.getItem(THEME_KEY) || 'cream'; } catch (e) {}
  setTheme(name);
}

// ================= 全局 =================
let wordList = [];
let currentIndex = 0;
let running = false;
let isSpeaking = false;
let speechToken = 0;
let displaySession = 0;
let switching = false;

let viewCountMap = {};
let currentSortMode = 'default';
let onlyUnseen = false;
let catalogMode = 'en';

let isLoading = false;
let lastClickTime = 0;
const CLICK_DELAY = 500;

const VIEW_COUNT_KEY = 'wordViewCounts_v1';
const SETTINGS_KEY = 'appSettings_v1';

const dictConfig = [
  { name: "小学词汇", files: ["primarylist1.json","primarylist2.json","primarylist3.json","primarylist4.json","primarylist5.json","primarylist6.json","primarylist7.json","primarylist8.json","primarylist9.json","primarylist10.json","primarylist11.json","primarylist12.json","primarylist13.json","primarylist14.json","primarylist15.json","primarylist16.json","primarylist17.json","primarylist18.json","primarylist19.json","primarylist20.json"] },
  { name: "初中词汇", files: ["juniorlist1.json","juniorlist2.json","juniorlist3.json","juniorlist4.json","juniorlist5.json","juniorlist6.json","juniorlist7.json","juniorlist8.json","juniorlist9.json","juniorlist10.json","juniorlist11.json","juniorlist12.json","juniorlist13.json","juniorlist14.json","juniorlist15.json","juniorlist16.json","juniorlist17.json","juniorlist18.json","juniorlist19.json","juniorlist20.json"] },
  { name: "高中词汇", files: ["seniorlist1.json","seniorlist2.json","seniorlist3.json","seniorlist4.json","seniorlist5.json","seniorlist6.json","seniorlist7.json","seniorlist8.json","seniorlist9.json","seniorlist10.json","seniorlist11.json","seniorlist12.json","seniorlist13.json","seniorlist14.json","seniorlist15.json","seniorlist16.json","seniorlist17.json","seniorlist18.json","seniorlist19.json","seniorlist20.json"] },
  { name: "四级词汇 4000词", files: ["cet4list1.json","cet4list2.json","cet4list3.json","cet4list4.json","cet4list5.json","cet4list6.json","cet4list7.json","cet4list8.json","cet4list9.json","cet4list10.json","cet4list11.json","cet4list12.json","cet4list13.json","cet4list14.json","cet4list15.json","cet4list16.json","cet4list17.json","cet4list18.json","cet4list19.json","cet4list20.json"] },
  { name: "六级词汇", files: ["cet6list1.json","cet6list2.json","cet6list3.json","cet6list4.json","cet6list5.json","cet6list6.json","cet6list7.json","cet6list8.json","cet6list9.json","cet6list10.json","cet6list11.json","cet6list12.json","cet6list13.json","cet6list14.json","cet6list15.json","cet6list16.json","cet6list17.json","cet6list18.json","cet6list19.json","cet6list20.json"] },
  { name: "考研词汇", files: ["kaoyanlist1.json","kaoyanlist2.json","kaoyanlist3.json","kaoyanlist4.json","kaoyanlist5.json","kaoyanlist6.json","kaoyanlist7.json","kaoyanlist8.json","kaoyanlist9.json","kaoyanlist10.json","kaoyanlist11.json","kaoyanlist12.json","kaoyanlist13.json","kaoyanlist14.json","kaoyanlist15.json","kaoyanlist16.json","kaoyanlist17.json","kaoyanlist18.json","kaoyanlist19.json","kaoyanlist20.json"] },
  { name: "雅思词汇", files: ["ieltslist1.json","ieltslist2.json","ieltslist3.json","ieltslist4.json","ieltslist5.json","ieltslist6.json","ieltslist7.json","ieltslist8.json","ieltslist9.json","ieltslist10.json","ieltslist11.json","ieltslist12.json","ieltslist13.json","ieltslist14.json","ieltslist15.json","ieltslist16.json","ieltslist17.json","ieltslist18.json","ieltslist19.json","ieltslist20.json"] }
];

// ================= DOM =================
const $ = (id) => document.getElementById(id);

const domWord = $('word');
const domMean = $('meaning');
const domSenEn = $('senEn');
const domSenCn = $('senCn');
const intervalInput = $('interval');
const enReadCountInput = $('enReadCount');
const speechRateInput = $('speechRate');
const dictSelect = $('dictSelect');
const progressText = $('progressText');
const jumpIndex = $('jumpIndex');
const loadStatus = $('loadStatus');
const progressBar = $('progressBar');
const progressFill = $('progressFill');
const progressPercent = $('progressPercent');
const toastEl = $('toast');

const readEnSwitch = $('readEnSwitch');
const readMeanSwitch = $('readMeanSwitch');
const readSenSwitch = $('readSenSwitch');

const catalogGrid = $('catalogGrid');
const catalogGridWrap = $('catalogGridWrap');
const catalogCount = $('catalogCount');
const catalogPanel = $('catalogPanel');
const catalogHeader = $('catalogHeader');
const prevBtn = $('prevBtn');
const nextBtn = $('nextBtn');

const viewCountEl = $('viewCount');
const viewBadge = $('viewBadge');
const reviewHint = $('reviewHint');
const cardContent = $('cardContent');

const flipOverlay = $('flipOverlay');
const flipCard = $('flipCard');
const flipWordFront = $('flipWordFront');
const flipWordBack = $('flipWordBack');
const flipMean = $('flipMean');
const flipSenEn = $('flipSenEn');
const flipSenCn = $('flipSenCn');
const flipIndexCur = $('flipIndexCur');
const flipIndexTotal = $('flipIndexTotal');
const flipFaceIndexFront = $('flipFaceIndexFront');
const flipFaceIndexBack = $('flipFaceIndexBack');
const flipBackBtn = $('flipBackBtn');
const flipPrevBtn = $('flipPrevBtn');
const flipNextBtn = $('flipNextBtn');

const helpOverlay = $('helpOverlay');
const helpBtn = $('helpBtn');
const helpClose = $('helpClose');

// ================= Toast =================
let toastTimer = null;
function showToast(msg, duration = 1800) {
  toastEl.innerText = msg;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.classList.remove('show');
  }, duration);
}

// ================= 进度条 =================
function showProgress(done, total) {
  progressBar.classList.add('active');
  const pct = Math.min(100, Math.round((done / total) * 100));
  progressFill.style.width = pct + '%';
  progressPercent.querySelector('.num').innerText = pct;
}
function hideProgress() {
  progressFill.style.width = '100%';
  progressPercent.querySelector('.num').innerText = '100';
  setTimeout(() => {
    progressBar.classList.remove('active');
    setTimeout(() => {
      progressFill.style.width = '0%';
      progressPercent.querySelector('.num').innerText = '0';
    }, 300);
  }, 800);
}

// ================= 初始化下拉框 =================
dictConfig.forEach((item, idx) => {
  const opt = document.createElement('option');
  opt.value = idx;
  opt.innerText = item.name;
  dictSelect.appendChild(opt);
});

// ================= 开关 =================
readEnSwitch.onclick = () => { readEnSwitch.classList.toggle("active"); saveSettings(); };
readMeanSwitch.onclick = () => { readMeanSwitch.classList.toggle("active"); saveSettings(); };
readSenSwitch.onclick = () => { readSenSwitch.classList.toggle("active"); saveSettings(); };

// ================= 主题选择 =================
const themeSelect = $('themeSelect');
if (themeSelect) {
  themeSelect.onchange = () => setTheme(themeSelect.value);
}

// ================= 目录折叠 =================
catalogHeader.addEventListener('click', () => {
  catalogPanel.classList.toggle('open');
});

// ================= 目录模式切换 =================
document.querySelectorAll('.catalog-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.catalog-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    catalogMode = tab.dataset.mode;
    renderCatalog();
  });
});

// ================= 帮助 =================
helpBtn.addEventListener('click', () => helpOverlay.classList.add('active'));
helpClose.addEventListener('click', () => helpOverlay.classList.remove('active'));
helpOverlay.addEventListener('click', (e) => {
  if (e.target === helpOverlay) helpOverlay.classList.remove('active');
});

// ================= 设置持久化 =================
function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return;
    const s = JSON.parse(raw);
    if (s.interval) intervalInput.value = s.interval;
    if (s.enReadCount) enReadCountInput.value = s.enReadCount;
    if (s.speechRate) speechRateInput.value = s.speechRate;
    if (s.readEn !== undefined) readEnSwitch.classList.toggle('active', s.readEn);
    if (s.readMean !== undefined) readMeanSwitch.classList.toggle('active', s.readMean);
    if (s.readSen !== undefined) readSenSwitch.classList.toggle('active', s.readSen);
  } catch (e) {}
}
function saveSettings() {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({
      interval: intervalInput.value,
      enReadCount: enReadCountInput.value,
      speechRate: speechRateInput.value,
      readEn: readEnSwitch.classList.contains('active'),
      readMean: readMeanSwitch.classList.contains('active'),
      readSen: readSenSwitch.classList.contains('active')
    }));
  } catch (e) {}
}
intervalInput.addEventListener('change', saveSettings);
enReadCountInput.addEventListener('change', saveSettings);
speechRateInput.addEventListener('change', saveSettings);

// ================= 查看次数 =================
function loadViewCounts() {
  try {
    const raw = localStorage.getItem(VIEW_COUNT_KEY);
    viewCountMap = raw ? JSON.parse(raw) : {};
  } catch (e) { viewCountMap = {}; }
}
function saveViewCounts() {
  try { localStorage.setItem(VIEW_COUNT_KEY, JSON.stringify(viewCountMap)); } catch (e) {}
}
function incrementViewCount(word) {
  if (!word) return 0;
  viewCountMap[word] = (viewCountMap[word] || 0) + 1;
  saveViewCounts();
  return viewCountMap[word];
}
function getViewCount(word) { return viewCountMap[word] || 0; }

function refreshViewBadge() {
  const item = wordList[currentIndex];
  if (!item) {
    viewCountEl.innerText = '0';
    viewBadge.classList.remove('high');
    return;
  }
  const c = getViewCount(item.word);
  viewCountEl.innerText = c;
  if (c >= 6) viewBadge.classList.add('high');
  else viewBadge.classList.remove('high');
}

// ================= 工具 =================
function sleep(ms) { return new Promise(res => setTimeout(res, ms)); }

function updateProgress() {
  if (wordList.length === 0) {
    progressText.innerText = `进度：0 / 0`;
    return;
  }
  progressText.innerText = `进度：${currentIndex+1} / ${wordList.length}`;
  const selectIdx = Number(dictSelect.value);
  localStorage.setItem(`memIndex_${selectIdx}`, currentIndex);
  highlightCatalogItem();
  refreshViewBadge();
}

function highlightCatalogItem(shouldScroll = false) {
  const items = catalogGrid.querySelectorAll('.catalog-item');
  items.forEach((el) => {
    const idx = Number(el.dataset.index);
    if (idx === currentIndex) el.classList.add('active');
    else el.classList.remove('active');
  });
  if (shouldScroll) {
    const activeEl = catalogGrid.querySelector('.catalog-item.active');
    if (activeEl && catalogPanel.classList.contains('open')) {
      activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }
}

function updateCurrentCatalogItem() {
  const item = wordList[currentIndex];
  if (!item) return;
  const el = catalogGrid.querySelector(`.catalog-item[data-index="${currentIndex}"]`);
  if (!el) return;
  const count = getViewCount(item.word);
  let badge = el.querySelector('.badge');
  if (count > 0) {
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'badge';
      el.appendChild(badge);
    }
    badge.innerText = count;
  } else if (badge) {
    badge.remove();
  }
  catalogGrid.querySelectorAll('.catalog-item').forEach(x => x.classList.remove('active'));
  el.classList.add('active');
}

let catalogRenderTimer = null;
function buildCatalog() {
  if (catalogRenderTimer) clearTimeout(catalogRenderTimer);
  catalogRenderTimer = setTimeout(() => { renderCatalog(); }, 30);
}

function renderCatalog() {
  const savedScroll = catalogGridWrap ? catalogGridWrap.scrollTop : 0;
  catalogGrid.innerHTML = '';
  if (!wordList || wordList.length === 0) {
    catalogGrid.innerHTML = '<div class="catalog-empty">加载词库后显示目录</div>';
    catalogCount.innerText = '0 个单词';
    return;
  }
  let items = wordList.map((item, idx) => ({
    item, originalIndex: idx,
    word: item.word || '',
    mean: item.mean || '',
    count: getViewCount(item.word)
  }));
  if (onlyUnseen) items = items.filter(x => x.count === 0);
  if (currentSortMode === 'viewAsc') {
    items.sort((a, b) => a.count - b.count || a.originalIndex - b.originalIndex);
  } else if (currentSortMode === 'viewDesc') {
    items.sort((a, b) => b.count - a.count || a.originalIndex - b.originalIndex);
  }
  catalogCount.innerText = onlyUnseen
    ? `${items.length}/${wordList.length} 个未看`
    : `${wordList.length} 个单词`;

  const fragment = document.createDocumentFragment();
  items.forEach(({ originalIndex, word, mean, count }) => {
    const div = document.createElement('div');
    div.className = 'catalog-item';
    div.dataset.index = originalIndex;
    let displayHtml = '';
    if (catalogMode === 'en') {
      displayHtml = `<div class="word-en">${word || '—'}</div>`;
    } else if (catalogMode === 'cn') {
      displayHtml = `<div class="word-en" style="font-size:12px;font-weight:600;">${mean || '—'}</div>`;
    } else {
      displayHtml = `<div class="word-en">${word || '—'}</div><div class="word-cn">${mean || ''}</div>`;
    }
    displayHtml += `<div class="tap-hint">👆 点击查看</div>`;
    div.innerHTML = displayHtml + (count > 0 ? `<span class="badge">${count}</span>` : '');
    div.addEventListener('click', () => { openFlipCard(wordList[originalIndex]); });
    fragment.appendChild(div);
  });
  catalogGrid.appendChild(fragment);
  highlightCatalogItem();
  if (catalogGridWrap) catalogGridWrap.scrollTop = savedScroll;
}

// ================= 语音：系统默认，标准语言标记 =================
function resetSpeech() {
  try { window.speechSynthesis.cancel(); } catch (e) {}
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

  isSpeaking = true;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = lang.toLowerCase().startsWith('zh') ? 'zh-CN' : 'en-US';
  utter.pitch = 1.0;
  utter.rate = Number(speechRateInput.value) || 1;
  utter.volume = 1;

  return new Promise((resolve) => {
    utter.onend = () => { if (myToken === speechToken) isSpeaking = false; resolve(); };
    utter.onerror = () => { if (myToken === speechToken) isSpeaking = false; resolve(); };
    try { window.speechSynthesis.speak(utter); }
    catch (e) { isSpeaking = false; resolve(); }
  });
}

async function speakWordAudio(item, session) {
  if (!item || session !== displaySession) return;
  if (readEnSwitch.classList.contains("active") && item.word) {
    const times = Number(enReadCountInput.value) || 2;
    for (let i = 0; i < times; i++) {
      if (session !== displaySession) return;
      await speakText(item.word, "en-US");
    }
  }
  if (session !== displaySession) return;
  if (readMeanSwitch.classList.contains("active") && item.mean) {
    await speakText(item.mean, "zh-CN");
  }
  if (session !== displaySession) return;
  if (readSenSwitch.classList.contains("active") && item.sentenceEn) {
    await speakText(item.sentenceEn, "en-US");
    if (session !== displaySession) return;
    if (item.sentenceCn) await speakText(item.sentenceCn, "zh-CN");
  }
}

// ================= 显示单词 =================
async function showWord(item) {
  if (!item) return;
  const session = displaySession;
  incrementViewCount(item.word);

  domWord.classList.remove('waiting');
  domWord.innerText = item.word || '';
  domMean.innerText = item.mean || '';
  domSenEn.innerText = item.sentenceEn || '';
  domSenCn.innerText = item.sentenceCn || '';

  cardContent.classList.remove('fade-out');
  cardContent.classList.add('fade-in');

  refreshViewBadge();
  updateCurrentCatalogItem();

  await speakWordAudio(item, session);
  if (session !== displaySession) return;

  if (running) {
    await sleep(Number(intervalInput.value) * 1000);
    if (session !== displaySession) return;
    if (running) next();
  }
}

async function next() {
  if (!running || wordList.length === 0) return;
  if (switching) return;
  switching = true;
  try {
    currentIndex = (currentIndex + 1) % wordList.length;
    updateProgress();
    await Promise.race([
      showWord(wordList[currentIndex]),
      new Promise(resolve => setTimeout(resolve, 30000))
    ]);
  } finally {
    switching = false;
  }
}

async function prev() {
  if (wordList.length === 0) return;
  if (switching) return;
  switching = true;
  try {
    if (running) running = false;
    resetSpeech();
    currentIndex = (currentIndex - 1 + wordList.length) % wordList.length;
    updateProgress();
    await showWord(wordList[currentIndex]);
  } finally { switching = false; }
}

// ================= 翻转浮层 =================
let flipSession = 0;
let flipSpeaking = false;
let flipToken = 0;
let flipCurrentItem = null;
let flipCurrentIndex = -1;

async function openFlipCard(item) {
  if (!item) return;
  flipCurrentIndex = wordList.findIndex(w => w.word === item.word);
  if (flipCurrentIndex < 0) flipCurrentIndex = 0;

  running = false;
  displaySession++;
  try { window.speechSynthesis.cancel(); } catch (e) {}
  isSpeaking = false;

  flipSession++;
  flipToken++;
  flipSpeaking = false;
  flipCurrentItem = item;

  renderFlipCard(item);
  flipCard.classList.remove('flipped');
  flipOverlay.classList.add('active');

  await flipSpeak(item.word, 'en-US');
}

function renderFlipCard(item) {
  if (!item) return;
  flipWordFront.innerText = item.word || '—';
  flipWordBack.innerText = item.word || '—';
  flipMean.innerText = item.mean || '—';
  flipSenEn.innerText = item.sentenceEn || '';
  flipSenCn.innerText = item.sentenceCn || '';
  const curNum = flipCurrentIndex + 1;
  const totalNum = wordList.length;
  flipIndexCur.innerText = curNum;
  flipIndexTotal.innerText = totalNum;
  flipFaceIndexFront.innerText = '#' + curNum;
  flipFaceIndexBack.innerText = '#' + curNum;
  flipPrevBtn.disabled = flipCurrentIndex <= 0;
  flipNextBtn.disabled = flipCurrentIndex >= totalNum - 1;
}

function closeFlipCard() {
  flipSession++;
  flipToken++;
  try { window.speechSynthesis.cancel(); } catch (e) {}
  flipSpeaking = false;
  flipOverlay.classList.remove('active');
  flipCard.classList.remove('flipped');
  flipCurrentItem = null;
}

async function flipGoTo(newIndex) {
  if (newIndex < 0 || newIndex >= wordList.length) return;
  if (flipCurrentIndex === newIndex) return;
  flipCurrentIndex = newIndex;
  flipCurrentItem = wordList[newIndex];
  flipSession++;
  flipToken++;
  try { window.speechSynthesis.cancel(); } catch (e) {}
  flipSpeaking = false;
  flipCard.classList.remove('flipped');
  renderFlipCard(flipCurrentItem);
  await flipSpeak(flipCurrentItem.word, 'en-US');
}

async function flipSpeak(text, lang = 'en-US') {
  if (!text || !('speechSynthesis' in window)) return;
  const mySession = flipSession;
  const myToken = ++flipToken;
  let waitCount = 0;
  while (flipSpeaking && waitCount < 20) {
    await sleep(100); waitCount++;
  }
  if (myToken !== flipToken || mySession !== flipSession) return;

  flipSpeaking = true;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = lang.toLowerCase().startsWith('zh') ? 'zh-CN' : 'en-US';
  utter.pitch = 1.0;
  utter.rate = Number(speechRateInput.value) || 1;
  utter.volume = 1;

  return new Promise((resolve) => {
    utter.onend = () => { if (myToken === flipToken) flipSpeaking = false; resolve(); };
    utter.onerror = () => { if (myToken === flipToken) flipSpeaking = false; resolve(); };
    try { window.speechSynthesis.speak(utter); }
    catch (e) { flipSpeaking = false; resolve(); }
  });
}

flipCard.addEventListener('click', async () => {
  const item = flipCurrentItem;
  if (!item) return;
  const isFlipped = flipCard.classList.toggle('flipped');
  flipToken++;
  try { window.speechSynthesis.cancel(); } catch (e) {}
  flipSpeaking = false;
  if (!isFlipped) {
    await flipSpeak(item.word, 'en-US');
  } else {
    await flipSpeak(item.word, 'en-US');
    await flipSpeak(item.mean, 'zh-CN');
    if (item.sentenceEn) await flipSpeak(item.sentenceEn, 'en-US');
    if (item.sentenceCn) await flipSpeak(item.sentenceCn, 'zh-CN');
  }
});

flipBackBtn.addEventListener('click', (e) => { e.stopPropagation(); closeFlipCard(); });
flipPrevBtn.addEventListener('click', async (e) => {
  e.stopPropagation();
  if (flipCurrentIndex <= 0) return;
  await flipGoTo(flipCurrentIndex - 1);
});
flipNextBtn.addEventListener('click', async (e) => {
  e.stopPropagation();
  if (flipCurrentIndex >= wordList.length - 1) return;
  await flipGoTo(flipCurrentIndex + 1);
});
flipOverlay.addEventListener('click', (e) => {
  if (e.target === flipOverlay) closeFlipCard();
});

// ================= 加载词库 =================
document.getElementById('loadOnline').onclick = async () => {
  const now = Date.now();
  if (isLoading || now - lastClickTime < CLICK_DELAY) return;
  lastClickTime = now;
  isLoading = true;

  const selectIdx = Number(dictSelect.value);
  const dictItem = dictConfig[selectIdx];
  const fileList = dictItem.files;
  const failedFiles = [];
  const total = fileList.length;
  let doneCount = 0;

  loadStatus.innerText = `正在加载 0/${total} ...`;
  showProgress(0, total);

  try {
    const allPromises = fileList.map(filename =>
      fetch(`./${filename}`)
        .then(res => {
          if (!res.ok) throw new Error(`文件 ${filename} 加载失败`);
          return res.json();
        })
        .then(data => {
          if (Array.isArray(data)) return data;
          else throw new Error(`文件 ${filename} 不是数组`);
        })
        .catch(err => {
          console.warn(`加载 ${filename} 失败：`, err);
          failedFiles.push(filename);
          return [];
        })
        .finally(() => {
          doneCount++;
          loadStatus.innerText = `正在加载 ${doneCount}/${total} ...`;
          showProgress(doneCount, total);
        })
    );

    const results = await Promise.all(allPromises);
    const mergedWords = results.flat();

    if (mergedWords.length === 0) {
      alert("加载失败：没有任何词库文件读取成功。\n请检查文件名是否和配置一致。");
      loadStatus.innerText = '加载失败，请检查文件';
      hideProgress();
      isLoading = false;
      return;
    }

    wordList = mergedWords;

    const saved = localStorage.getItem(`memIndex_${selectIdx}`);
    if (saved !== null) {
      currentIndex = Math.min(Number(saved), wordList.length - 1);
    } else {
      currentIndex = 0;
    }

    running = false;
    resetSpeech();
    updateProgress();
    domWord.classList.remove('waiting');
    domWord.innerText = wordList[currentIndex].word || '';
    domMean.innerText = wordList[currentIndex].mean || '';
    domSenEn.innerText = wordList[currentIndex].sentenceEn || '';
    domSenCn.innerText = wordList[currentIndex].sentenceCn || '';
    refreshViewBadge();
    buildCatalog();

    const successCount = results.filter(arr => arr.length > 0).length;
    let statusText = `✅ 加载成功：${successCount}/${total} 个文件，共 ${wordList.length} 词`;
    if (failedFiles.length > 0) {
      statusText += `\n⚠️ 失败：${failedFiles.join('、')}`;
    }
    loadStatus.innerText = statusText;
    hideProgress();
    showToast(`词库加载成功 · ${wordList.length} 词`, 2000);
  } catch (e) {
    console.error(e);
    alert("加载出错，请检查控制台。");
    loadStatus.innerText = '加载出错';
    hideProgress();
  } finally {
    isLoading = false;
  }
};

// ================= 跳转 =================
document.getElementById('jumpBtn').onclick = async function() {
  const now = Date.now();
  if (now - lastClickTime < CLICK_DELAY) return;
  lastClickTime = now;

  if (wordList.length === 0) { showToast('请先加载词库'); return; }
  if (switching) return;

  const raw = jumpIndex.value.trim();
  if (!/^\d+$/.test(raw)) { showToast('请输入正整数序号'); return; }
  const num = Number(raw);
  if (num < 1 || num > wordList.length) { showToast('超出范围'); return; }

  running = false;
  resetSpeech();
  switching = true;
  try {
    currentIndex = num - 1;
    updateProgress();
    await showWord(wordList[currentIndex]);
    highlightCatalogItem(true);
  } finally { switching = false; }
};

// ================= 本地导入 =================
document.getElementById('fileInput').onchange = function(e) {
  const files = Array.from(e.target.files);
  if (files.length === 0) return;

  const total = files.length;
  let allWords = [];
  let done = 0;
  let failed = 0;

  loadStatus.innerText = `正在解析 0/${total} ...`;
  showProgress(0, total);

  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const data = JSON.parse(evt.target.result);
        if (Array.isArray(data)) allWords = allWords.concat(data);
        else failed++;
      } catch (err) {
        console.warn(`${file.name} 解析失败：`, err);
        failed++;
      }
      done++;
      loadStatus.innerText = `正在解析 ${done}/${total} ...`;
      showProgress(done, total);
      if (done === total) finishLocalImport(allWords, files, failed);
    };
    reader.onerror = () => {
      console.warn(`${file.name} 读取失败`);
      failed++;
      done++;
      loadStatus.innerText = `正在解析 ${done}/${total} ...`;
      showProgress(done, total);
      if (done === total) finishLocalImport(allWords, files, failed);
    };
    reader.readAsText(file);
  });
};

function finishLocalImport(allWords, files, failed) {
  hideProgress();
  if (allWords.length === 0) {
    loadStatus.innerText = '❌ 全部文件解析失败，请检查文件格式';
    showToast('解析失败 · 请检查 JSON 格式');
    return;
  }
  wordList = allWords;
  currentIndex = 0;
  running = false;
  resetSpeech();
  updateProgress();
  if (wordList.length > 0) showWord(wordList[currentIndex]);
  buildCatalog();

  let statusText = `✅ 本地词库加载成功：${wordList.length} 词`;
  if (failed > 0) statusText += `\n⚠️ ${failed} 个文件解析失败`;
  statusText += `\n⚠️ 本地词库是一次性的，刷新后需要重新上传`;
  loadStatus.innerText = statusText;
  showToast(`导入成功 · ${wordList.length} 词`, 2200);
}

// ================= 开始/暂停 =================
document.getElementById('startBtn').onclick = function() {
  if (wordList.length === 0) { showToast('请先加载词库'); return; }
  if (running) return;
  running = true;
  resetSpeech();
  if (wordList[currentIndex]) showWord(wordList[currentIndex]);
  else next();
};

document.getElementById('stopBtn').onclick = function() {
  running = false;
  switching = false;
  resetSpeech();
  speechToken++;
  isSpeaking = false;
};

// ================= 上一个/下一个 =================
prevBtn.onclick = async function() {
  if (wordList.length === 0) { showToast('请先加载词库'); return; }
  if (switching) return;
  await prev();
  highlightCatalogItem(true);
};

nextBtn.onclick = async function() {
  if (wordList.length === 0) { showToast('请先加载词库'); return; }
  if (switching) return;
  if (running) running = false;
  resetSpeech();
  switching = true;
  nextBtn.classList.add('speaking');
  try {
    currentIndex = (currentIndex + 1) % wordList.length;
    updateProgress();
    await showWord(wordList[currentIndex]);
    highlightCatalogItem(true);
  } finally {
    switching = false;
    nextBtn.classList.remove('speaking');
  }
};

// ================= 复习模式 =================
document.getElementById('reviewLeast').onclick = async () => {
  if (wordList.length === 0) { showToast('请先加载词库'); return; }
  if (switching) return;
  running = false;
  resetSpeech();
  switching = true;
  try {
    let bestIdx = 0;
    let bestCount = getViewCount(wordList[0].word);
    for (let i = 1; i < wordList.length; i++) {
      const c = getViewCount(wordList[i].word);
      if (c < bestCount) { bestCount = c; bestIdx = i; }
    }
    currentIndex = bestIdx;
    updateProgress();
    await showWord(wordList[currentIndex]);
    highlightCatalogItem(true);
    reviewHint.innerText = `已跳到最不熟的单词（已看 ${bestCount} 次）`;
  } finally { switching = false; }
};

document.getElementById('reviewMost').onclick = async () => {
  if (wordList.length === 0) { showToast('请先加载词库'); return; }
  if (switching) return;
  running = false;
  resetSpeech();
  switching = true;
  try {
    let bestIdx = 0;
    let bestCount = getViewCount(wordList[0].word);
    for (let i = 1; i < wordList.length; i++) {
      const c = getViewCount(wordList[i].word);
      if (c > bestCount) { bestCount = c; bestIdx = i; }
    }
    currentIndex = bestIdx;
    updateProgress();
    await showWord(wordList[currentIndex]);
    highlightCatalogItem(true);
    reviewHint.innerText = `已跳到最熟的单词（已看 ${bestCount} 次）`;
  } finally { switching = false; }
};

document.getElementById('reviewUnseen').onclick = async () => {
  if (wordList.length === 0) { showToast('请先加载词库'); return; }
  if (switching) return;
  running = false;
  resetSpeech();
  switching = true;
  try {
    let found = -1;
    for (let offset = 0; offset < wordList.length; offset++) {
      const idx = (currentIndex + offset) % wordList.length;
      if (getViewCount(wordList[idx].word) === 0) { found = idx; break; }
    }
    if (found >= 0) {
      currentIndex = found;
      updateProgress();
      await showWord(wordList[currentIndex]);
      highlightCatalogItem(true);
      reviewHint.innerText = `已跳到第 ${found+1} 个未看单词`;
    } else {
      reviewHint.innerText = '🎉 全部单词都看过了！';
      showToast('🎉 全部单词都看过了', 1800);
    }
  } finally { switching = false; }
};

document.getElementById('resetViewCount').onclick = () => {
  if (!confirm('确定要清零所有单词的查看次数吗？此操作不可恢复。')) return;
  viewCountMap = {};
  saveViewCounts();
  refreshViewBadge();
  buildCatalog();
  reviewHint.innerText = '查看次数已清零';
};

// ================= 卸载 =================
window.addEventListener('beforeunload', () => { resetSpeech(); });

// ================= 初始化 =================
loadTheme();
loadViewCounts();
loadSettings();
updateProgress();
