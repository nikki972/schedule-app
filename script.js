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

const addBtn = $('addBtn');
const modal = $('modal');
const saveBtn = $('saveBtn');
const cancelBtn = $('cancelBtn');

let lessons = [];

/* ===== МЕНЮ ===== */
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

/* ===== ДАТА ===== */
function formatDate(d) {
  return d.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit'
  });
}

/* ===== ЭКРАНЫ ===== */
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
    todayDate.textContent = formatDate(new Date());
    renderToday();
  }

  if (screen === 'all') {
    allScreen.classList.remove('hidden');
    title.textContent = 'Все занятия';
    todayDate.textContent = '';
  }

  close();
}

/* ===== СЕГОДНЯ ===== */
function renderToday() {
  todayScreen.innerHTML = '';
  if (!lessons.length) {
    todayScreen.innerHTML = '<p style="padding:16px">Нет занятий</p>';
    return;
  }

  lessons.forEach(l => {
    const d = document.createElement('div');
    d.className = 'lesson';
    d.textContent = `${l.time} — ${l.subject}`;
    todayScreen.appendChild(d);
  });
}

/* ===== ДОБАВЛЕНИЕ ===== */
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
