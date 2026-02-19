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
  row.innerHTML = `
    <div class="lesson-time">${l.time}</div>
    <div class="lesson-info">
      <div class="lesson-student">${l.student}</div>
      <div class="lesson-subject">${l.subject}</div>
    </div>
  `;

  let startX = 0;
  let currentX = 0;

  row.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;

    if (openedRow && openedRow !== row) {
      openedRow.style.transform = 'translateX(0)';
      openedRow = null;
    }
  });

  row.addEventListener('touchmove', e => {
    const dx = e.touches[0].clientX - startX;

    if (dx < 0) {
      currentX = Math.max(dx, -90);
      row.style.transform = `translateX(${currentX}px)`;
    }

    if (dx > 30 && openedRow === row) {
      row.style.transform = 'translateX(0)';
      openedRow = null;
    }
  });

  row.addEventListener('touchend', () => {
    if (currentX < -45) {
      row.style.transform = 'translateX(-90px)';
      openedRow = row;
    } else {
      row.style.transform = 'translateX(0)';
      openedRow = null;
    }
    currentX = 0;
  });

  wrap.append(del, row);
  todayScreen.appendChild(wrap);
}

/* close swipe on tap outside */
document.addEventListener('touchstart', e => {
  if (!e.target.closest('.lesson') && openedRow) {
    openedRow.style.transform = 'translateX(0)';
    openedRow = null;
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
    time: time.value
  });
  modal.classList.remove('active');
  save();
};

function save() {
  localStorage.setItem('lessons', JSON.stringify(lessons));
  render();
}

render();
