const $ = id => document.getElementById(id);

/* ===== MENU ===== */
const menuBtn = $('menuBtn');
const sideMenu = $('sideMenu');
const overlay = $('overlay');
const closeMenu = $('closeMenu');

menuBtn.onclick = () => {
  sideMenu.classList.add('open');
  overlay.classList.add('show');
};

overlay.onclick = closeMenuFn;
closeMenu.onclick = closeMenuFn;

function closeMenuFn() {
  sideMenu.classList.remove('open');
  overlay.classList.remove('show');
}

/* ===== DATE NAV ===== */
let currentDate = new Date();

const title = $('title');
const todayDate = $('todayDate');
const todayMark = $('todayMark');

const days = [
  'Воскресенье','Понедельник','Вторник',
  'Среда','Четверг','Пятница','Суббота'
];

function renderHeader() {
  title.textContent = days[currentDate.getDay()];
  todayDate.textContent = currentDate.toLocaleDateString('ru-RU');

  const today = new Date();
  todayMark.classList.toggle(
    'hidden',
    today.toDateString() !== currentDate.toDateString()
  );
}

$('prevDay').onclick = () => {
  currentDate.setDate(currentDate.getDate() - 1);
  render();
};

$('nextDay').onclick = () => {
  currentDate.setDate(currentDate.getDate() + 1);
  render();
};

$('goToday').onclick = () => {
  currentDate = new Date();
  closeMenuFn();
  render();
};

/* ===== LESSONS ===== */
let lessons = JSON.parse(localStorage.getItem('lessons') || '[]');
const todayScreen = $('todayScreen');

/* iOS swipe state */
let openedRow = null;

function closeOpenedRow() {
  if (openedRow) {
    openedRow.style.transform = 'translateX(0)';
    openedRow = null;
  }
}

function openRow(row) {
  closeOpenedRow();
  row.style.transform = 'translateX(-90px)';
  openedRow = row;
}

function render() {
  renderHeader();
  renderLessons();
}

function renderLessons() {
  todayScreen.innerHTML = '';
  const dateStr = currentDate.toISOString().slice(0, 10);

  lessons
    .filter(l => l.date === dateStr)
    .sort((a, b) => a.time.localeCompare(b.time))
    .forEach((l, index) => createLesson(l, index));
}

function createLesson(l, index) {
  const wrap = document.createElement('div');
  wrap.className = 'lesson-wrapper';

  const del = document.createElement('div');
  del.className = 'lesson-delete';
  del.textContent = 'Удалить';

  del.onclick = () => {
    lessons.splice(index, 1);
    save();
  };

  const row = document.createElement('div');
  row.className = 'lesson';

  function renderRowVisual() {
    let extra = '';
    if (l.paid) extra += ' 💰';
    if (l.paid === false && l.state !== 'cancelled') extra += ' ⏳';
    if (l.state === 'done') extra += ' ✔︎';
    if (l.state === 'cancelled') extra += ' ❌';

    row.innerHTML = `
      <div class="lesson-time">${l.time}</div>
      <div class="lesson-info">
        <div class="lesson-student">${l.student} ${extra}</div>
        <div class="lesson-subject">${l.subject}</div>
      </div>
    `;

    row.style.opacity = l.state === 'done' ? 0.5 : l.state === 'cancelled' ? 0.4 : 1;
    row.style.textDecoration = l.state === 'cancelled' ? 'line-through' : 'none';
  }

  renderRowVisual();

  /* iOS swipe */
  let startX = 0;
  let moved = false;

  row.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
    moved = false;
    if (openedRow && openedRow !== row) closeOpenedRow();
  });

  row.addEventListener('touchmove', e => {
    const dx = e.touches[0].clientX - startX;
    if (dx < -10) {
      moved = true;
      row.style.transform = `translateX(${Math.max(dx, -90)}px)`;
    }
    if (dx > 10 && openedRow === row) {
      moved = true;
      closeOpenedRow();
    }
  });

  row.addEventListener('touchend', () => {
    if (!moved) return;
    const currentTranslate = parseInt(row.style.transform.replace(/[^\-0-9]/g, '')) || 0;
    if (currentTranslate < -45) openRow(row);
    else closeOpenedRow();
  });

  wrap.append(del, row);
  todayScreen.appendChild(wrap);

  /* tap row → open action sheet */
  row.addEventListener('click', () => {
    if (openedRow !== row) return;
    actionSheet.dataset.index = index;
    actionSheet.classList.add('active');
  });
}

/* tap outside closes opened row (not delete button) */
document.addEventListener('touchstart', e => {
  if (openedRow && !e.target.closest('.lesson-wrapper') && !e.target.closest('.lesson-delete')) {
    closeOpenedRow();
  }
});

/* ===== ADD LESSON ===== */
const modal = $('modal');
$('addBtn').onclick = () => modal.classList.add('active');
$('cancelBtn').onclick = () => modal.classList.remove('active');

const saveBtn = $('saveBtn');
const student = $('student');
const subject = $('subject');
const date = $('date');
const time = $('time');

[student, subject, date, time].forEach(i => i.oninput = check);

function check() { saveBtn.disabled = !(student.value && date.value && time.value); }

saveBtn.onclick = () => {
  lessons.push({
    student: student.value,
    subject: subject.value,
    date: date.value,
    time: time.value,
    state: 'planned',
    paid: null
  });
  modal.classList.remove('active');
  save();
};

/* ===== ACTION SHEET ===== */
const actionSheet = $('actionSheet');
const actionCancel = $('actionCancel');

actionCancel.onclick = () => actionSheet.classList.remove('active');

document.querySelectorAll('#actionSheet .action-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const index = actionSheet.dataset.index;
    const lesson = lessons[index];
    if (btn.dataset.state) lesson.state = btn.dataset.state;
    if (btn.dataset.paid) {
      if (btn.dataset.paid === 'true') lesson.paid = true;
      else if (btn.dataset.paid === 'false') lesson.paid = false;
      // skip → ничего не делаем
    }
    actionSheet.classList.remove('active');
    render();
    save();
  });
});

function save() {
  localStorage.setItem('lessons', JSON.stringify(lessons));
  render();
}

render();
