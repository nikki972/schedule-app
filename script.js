const $ = id => document.getElementById(id);

const menuBtn = $('menuBtn');
const sideMenu = $('sideMenu');
const overlay = $('overlay');
const closeMenu = $('closeMenu');

const goToday = $('goToday');
const goAll = $('goAll');
const goAnalytics = $('goAnalytics');
const goStudents = $('goStudents');

const todayScreen = $('todayScreen');
const allScreen = $('allScreen');
const analyticsScreen = $('analyticsScreen');
const studentsScreen = $('studentsScreen');

const title = $('title');
const todayDate = $('todayDate');

const prevDayBtn = $('prevDay');
const nextDayBtn = $('nextDay');

const addBtn = $('addBtn');
const modal = $('modal');
const saveBtn = $('saveBtn');
const cancelBtn = $('cancelBtn');

let lessons = [];
let currentDate = new Date();

/* ===== MENU ===== */
menuBtn.onclick = () => {
  sideMenu.classList.add('open');
  overlay.classList.add('show');
};
overlay.onclick = close;
closeMenu.onclick = close;

function close() {
  sideMenu.classList.remove('open');
  overlay.classList.remove('show');
}

/* ===== DATE ===== */
function formatDate(d) {
  return d.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit'
  });
}

function updateHeader() {
  todayDate.textContent = formatDate(currentDate);
}

/* ===== DAY CHANGE ===== */
function changeDay(delta) {
  currentDate.setDate(currentDate.getDate() + delta);
  updateHeader();
  renderToday();
}

prevDayBtn.onclick = () => changeDay(-1);
nextDayBtn.onclick = () => changeDay(1);

/* ===== SCREENS ===== */
goToday.onclick = () => show('today');
goAll.onclick = () => show('all');
goAnalytics.onclick = () => show('analytics');
goStudents.onclick = () => show('students');

function show(screen) {
  todayScreen.classList.add('hidden');
  allScreen.classList.add('hidden');
  analyticsScreen.classList.add('hidden');
  studentsScreen.classList.add('hidden');

  if (screen === 'today') {
    todayScreen.classList.remove('hidden');
    title.textContent = 'Сегодня';
    updateHeader();
    renderToday();
  }

  if (screen === 'all') {
    allScreen.classList.remove('hidden');
    title.textContent = 'Все занятия';
    todayDate.textContent = '';
  }

  close();
}

/* ===== TODAY ===== */
function renderToday() {
  todayScreen.innerHTML = '';
  const day = currentDate.toISOString().slice(0,10);
  const list = lessons.filter(l => l.date === day);

  if (!list.length) {
    todayScreen.innerHTML = '<p style="padding:16px">Нет занятий</p>';
    return;
  }

  list.forEach(l => {
    const d = document.createElement('div');
    d.className = 'lesson';
    d.textContent = `${l.time} — ${l.subject}`;
    todayScreen.appendChild(d);
  });
}

/* ===== SWIPES ===== */
let startX = null;

todayScreen.addEventListener('touchstart', e => {
  startX = e.touches[0].clientX;
}, { passive: true });

todayScreen.addEventListener('touchend', e => {
  if (startX === null) return;
  const dx = e.changedTouches[0].clientX - startX;

  if (Math.abs(dx) > 60) {
    changeDay(dx < 0 ? 1 : -1);
  }
  startX = null;
}, { passive: true });

/* ===== ADD ===== */
addBtn.onclick = () => modal.classList.add('active');
cancelBtn.onclick = () => modal.classList.remove('active');

saveBtn.onclick = () => {
  lessons.push({
    subject: $('subject').value,
    date: $('date').value,
    time: $('time').value
  });
  modal.classList.remove('active');
  renderToday();
};

show('today');
