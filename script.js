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
    let classes = '';
    let extra = '';

    if (l.state === 'done') classes += ' done';
    if (l.state === 'cancelled') classes += ' cancelled';
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

    // приглушение или перечеркнутый текст через inline style
    if (l.state === 'done') {
      row.style.opacity = 0.5;
      row.style.textDecoration = 'none';
    } else if (l.state === 'cancelled') {
      row.style.opacity = 0.4;
      row.style.textDecoration = 'line-through';
    } else {
      row.style.opacity = 1;
      row.style.textDecoration = 'none';
    }
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

    const currentTranslate =
      parseInt(row.style.transform.replace(/[^\-0-9]/g, '')) || 0;

    if (currentTranslate < -45) {
      openRow(row);
    } else {
      closeOpenedRow();
    }
  });

  wrap.append(del, row);
  todayScreen.appendChild(wrap);

  /* iOS-style gesture menu for status & payment (tap row) */
  row.addEventListener('click', () => {
    if (openedRow === row) {
      // показываем action sheet — тут можно расширять позже
      const next = prompt(
        'Статус: planned / done / cancelled\nОплата: yes / no / skip',
        `${l.state}, ${l.paid === true ? 'yes' : l.paid === false ? 'no' : 'skip'}`
      );
      if (!next) return;
      const parts = next.split(',').map(s => s.trim());
      if (parts[0] && ['planned','done','cancelled'].includes(parts[0])) l.state = parts[0];
      if (parts[1]) {
        if (parts[1] === 'yes') l.paid = true;
        else if (parts[1] === 'no') l.paid = false;
      }
      renderRowVisual();
      save();
    }
  });
}

/* tap outside closes opened row (BUT NOT delete button) */
document.addEventListener('touchstart', e => {
  if (
    openedRow &&
    !e.target.closest('.lesson-wrapper') &&
    !e.target.closest('.lesson-delete')
  ) {
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

function check() {
  saveBtn.disabled = !(student.value && date.value && time.value);
}

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

function save() {
  localStorage.setItem('lessons', JSON.stringify(lessons));
  render();
}

render();
