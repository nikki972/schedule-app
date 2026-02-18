const modal = document.getElementById('modal');
const addBtn = document.getElementById('addBtn');
const cancelBtn = document.getElementById('cancelBtn');
const saveBtn = document.getElementById('saveBtn');
const schedule = document.getElementById('schedule');
const themeToggle = document.getElementById('themeToggle');

const student = document.getElementById('student');
const subject = document.getElementById('subject');
const date = document.getElementById('date');
const time = document.getElementById('startTime');
const price = document.getElementById('price');

const todayDate = document.getElementById('todayDate');

/* ===== ЖЁСТКО ЗАКРЫВАЕМ МОДАЛКУ ===== */
modal.classList.remove('active');

/* ===== Дата ===== */
const today = new Date();
const todayStr = today.toISOString().slice(0,10);
todayDate.textContent = today.toLocaleDateString('ru-RU');

/* ===== Ученики ===== */
const students = [
  { id: 1, name: 'Иван', price: 700 },
  { id: 2, name: 'Мария', price: 1000 }
];

students.forEach(s => {
  const o = document.createElement('option');
  o.value = s.id;
  o.textContent = s.name;
  student.appendChild(o);
});

/* ===== Данные ===== */
let lessons = JSON.parse(localStorage.getItem('lessons') || '[]');

/* ===== Кнопки ===== */
addBtn.onclick = () => modal.classList.add('active');
cancelBtn.onclick = () => modal.classList.remove('active');

function check() {
  saveBtn.disabled = !(student.value && date.value && time.value);
}

student.onchange = check;
date.oninput = check;
time.oninput = check;

/* ===== Сохранение ===== */
saveBtn.onclick = () => {
  const s = students.find(x => x.id == student.value);

  lessons.push({
    student: s.name,
    subject: subject.value,
    date: date.value,
    time: time.value,
    price: price.value || s.price
  });

  localStorage.setItem('lessons', JSON.stringify(lessons));
  modal.classList.remove('active');
  render();
};

/* ===== Рендер ===== */
function render() {
  schedule.innerHTML = '';
  const todayLessons = lessons.filter(l => l.date === todayStr);

  if (!todayLessons.length) {
    schedule.innerHTML = '<p class="empty">Сегодня занятий нет</p>';
    return;
  }

  todayLessons.forEach(l => {
    const d = document.createElement('div');
    d.className = 'lesson';
    d.textContent = `${l.time} — ${l.subject} (${l.student})`;
    schedule.appendChild(d);
  });
}

/* ===== Тема ===== */
themeToggle.onclick = () => {
  document.body.classList.toggle('dark');
  document.body.classList.toggle('light');
};

/* ===== Старт ===== */
render();
