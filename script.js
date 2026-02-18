const schedule = document.getElementById('schedule');
const modal = document.getElementById('modal');
const addBtn = document.getElementById('addBtn');
const cancelBtn = document.getElementById('cancelBtn');
const saveBtn = document.getElementById('saveBtn');
const themeToggle = document.getElementById('themeToggle');

const studentSelect = document.getElementById('student');
const subjectSelect = document.getElementById('subject');
const dateInput = document.getElementById('date');
const timeInput = document.getElementById('startTime');
const priceSelect = document.getElementById('price');

const analyticsDate = document.getElementById('analyticsDate');
const analyticsResult = document.getElementById('analyticsResult');
const todayDate = document.getElementById('todayDate');

/* 🔒 ГАРАНТИЯ: модалка закрыта при старте */
modal.classList.add('hidden');

/* ===== Дата ===== */
const today = new Date();
const todayStr = today.toISOString().slice(0,10);

todayDate.textContent = today.toLocaleDateString('ru-RU', {
  weekday: 'long',
  day: 'numeric',
  month: 'long'
});

analyticsDate.value = todayStr;

/* ===== Ученики ===== */
let students = [
  { id: 1, name: "Иван", price: 700 },
  { id: 2, name: "Мария", price: 1000 }
];

studentSelect.innerHTML = '';
students.forEach(s => {
  const o = document.createElement('option');
  o.value = s.id;
  o.textContent = s.name;
  studentSelect.appendChild(o);
});

/* ===== Данные ===== */
let lessons = JSON.parse(localStorage.getItem('lessons') || '[]');

/* ===== Кнопки ===== */
addBtn.onclick = () => {
  modal.classList.remove('hidden');
};

cancelBtn.onclick = () => {
  modal.classList.add('hidden');
};

function checkForm() {
  saveBtn.disabled = !(studentSelect.value && dateInput.value && timeInput.value);
}

studentSelect.onchange = checkForm;
dateInput.oninput = checkForm;
timeInput.oninput = checkForm;

/* ===== Сохранение ===== */
saveBtn.onclick = () => {
  const student = students.find(s => s.id == studentSelect.value);

  lessons.push({
    student: student.name,
    subject: subjectSelect.value,
    date: dateInput.value,
    time: timeInput.value,
    price: priceSelect.value || student.price,
    status: 'planned',
    paid: false
  });

  localStorage.setItem('lessons', JSON.stringify(lessons));
  modal.classList.add('hidden');
  render();
};

/* ===== Статусы ===== */
function nextStatus(s) {
  if (s === 'planned') return 'done';
  if (s === 'done') return 'cancelled';
  if (s === 'cancelled') return 'planned';
  return 'planned';
}

/* ===== Рендер ===== */
function render() {
  schedule.innerHTML = '';

  const todayLessons = lessons
    .map((l, i) => ({ ...l, index: i }))
    .filter(l => l.date === todayStr);

  if (!todayLessons.length) {
    schedule.innerHTML = '<p class="empty">Сегодня занятий нет</p>';
    return;
  }

  todayLessons.forEach(l => {
    const d = document.createElement('div');
    d.className = 'lesson';
    d.dataset.subject = l.subject;

    d.innerHTML = `
      <div>${l.time} — ${l.subject} (${l.student})</div>
      <div>
        <span class="status">${icon(l.status)}</span>
        <span>${l.paid ? '💰' : '⏳'}</span>
      </div>
    `;

    d.querySelector('.status').onclick = () => {
      lessons[l.index].status = nextStatus(l.status);
      localStorage.setItem('lessons', JSON.stringify(lessons));
      render();
    };

    d.querySelector('span:last-child').onclick = () => {
      lessons[l.index].paid = !lessons[l.index].paid;
      localStorage.setItem('lessons', JSON.stringify(lessons));
      render();
    };

    schedule.appendChild(d);
  });

  renderAnalytics();
}

function icon(s) {
  return s === 'done' ? '✅' : s === 'cancelled' ? '❌' : '🕒';
}

/* ===== Аналитика ===== */
function renderAnalytics() {
  const d = analyticsDate.value;
  const done = lessons.filter(l => l.date === d && l.status === 'done');
  const sum = done.reduce((a, b) => a + Number(b.price), 0);
  analyticsResult.textContent = `Проведено: ${done.length} | Доход: ${sum} ₽`;
}

analyticsDate.onchange = renderAnalytics;

/* ===== Тема ===== */
const savedTheme = localStorage.getItem('theme') || 'dark';
document.body.className = savedTheme;
themeToggle.textContent = savedTheme === 'dark' ? '🌙' : '☀️';

themeToggle.onclick = () => {
  document.body.classList.toggle('dark');
  document.body.classList.toggle('light');
  const t = document.body.classList.contains('dark') ? 'dark' : 'light';
  localStorage.setItem('theme', t);
  themeToggle.textContent = t === 'dark' ? '🌙' : '☀️';
};

/* ===== Старт ===== */
render();
