// --- Элементы формы и экрана ---
const addBtn = document.getElementById('addBtn');
const modal = document.getElementById('modal');
const cancelBtn = document.getElementById('cancelBtn');
const saveBtn = document.getElementById('saveBtn');

const studentSelect = document.getElementById('student');
const subject = document.getElementById('subject');
const dateInput = document.getElementById('date');
const startTime = document.getElementById('startTime');
const priceSelect = document.getElementById('price');

const schedule = document.getElementById('schedule');
const todayDate = document.getElementById('todayDate');

const themeToggle = document.getElementById('themeToggle');

// --- Сегодняшняя дата ---
const today = new Date();
todayDate.textContent = today.toLocaleDateString('ru-RU', {
  weekday: 'long',
  day: 'numeric',
  month: 'long'
});

// --- Список учеников ---
let students = [
  { id: 1, name: "Иван", price: 700 },
  { id: 2, name: "Мария", price: 1000 },
  { id: 3, name: "Пётр", price: 700 },
  { id: 4, name: "Светлана", price: 1000 }
];

// --- Предметы и их цвета ---
const subjectColors = {
  "Математика": "#2196f3",
  "Алгебра": "#9c27b0",
  "Геометрия": "#ff9800",
  "Физика": "#4caf50"
};

// --- Заполняем select учеников ---
function renderStudents() {
  studentSelect.innerHTML = '';
  students.forEach(s => {
    const option = document.createElement('option');
    option.value = s.id;
    option.textContent = s.name;
    studentSelect.appendChild(option);
  });
}
renderStudents();

// --- Занятия ---
let lessons = JSON.parse(localStorage.getItem('lessons') || '[]');

// --- Проверка формы ---
function checkForm() {
  saveBtn.disabled = !(studentSelect.value && dateInput.value && startTime.value);
}

// --- Обработчики кнопок ---
addBtn.onclick = () => modal.classList.remove('hidden');
cancelBtn.onclick = () => modal.classList.add('hidden');
dateInput.oninput = checkForm;
startTime.oninput = checkForm;
studentSelect.oninput = () => {
  checkForm();
  const selectedStudent = students.find(s => s.id == studentSelect.value);
  if (selectedStudent && !priceSelect.value) priceSelect.value = selectedStudent.price;
};

// --- Сохранение нового занятия ---
saveBtn.onclick = () => {
  const selectedStudent = students.find(s => s.id == studentSelect.value);
  const lesson = {
    studentId: selectedStudent.id,
    studentName: selectedStudent.name,
    subject: subject.value,
    date: dateInput.value,
    start: startTime.value,
    price: priceSelect.value || selectedStudent.price,
    status: 'planned',
    paid: false
  };
  lessons.push(lesson);
  localStorage.setItem('lessons', JSON.stringify(lessons));
  modal.classList.add('hidden');
  render();
  renderAnalytics();
};

// --- Изменение статуса ---
function setStatus(index, newStatus) {
  lessons[index].status = newStatus;
  localStorage.setItem('lessons', JSON.stringify(lessons));
  render();
  renderAnalytics();
}

// --- Переключение оплаты ---
function togglePaid(index) {
  lessons[index].paid = !lessons[index].paid;
  localStorage.setItem('lessons', JSON.stringify(lessons));
  render();
  renderAnalytics();
}

// --- Отрисовка занятий ---
function render() {
  schedule.innerHTML = '';
  const todayStr = today.toISOString().slice(0,10);
  const todayLessons = lessons
    .map((l,i) => ({...l, index: i}))
    .filter(l => l.date === todayStr);

  if(todayLessons.length === 0){
    schedule.innerHTML = '<p class="empty">Сегодня занятий нет</p>';
    return;
  }

  todayLessons.forEach(l => {
    const div = document.createElement('div');
    div.className = 'lesson';
    div.style.borderLeft = `6px solid ${subjectColors[l.subject] || '#fff'}`;

    const left = document.createElement('div');
    left.textContent = `${l.start} — ${l.subject} (${l.studentName})`;

    const right = document.createElement('div');

    const statusBtn = document.createElement('span');
    statusBtn.className = 'status';
    statusBtn.textContent = l.status === 'planned' ? '🕒' :
                             l.status === 'done' ? '✅' :
                             l.status === 'cancelled' ? '❌' : '🔁';
    statusBtn.onclick = () => {
      const next = l.status === 'planned' ? 'done' :
                   l.status === 'done' ? 'cancelled' :
                   l.status === 'cancelled' ? 'moved' : 'planned';
      setStatus(l.index, next);
    };
    right.appendChild(statusBtn);

    const paidBtn = document.createElement('span');
    paidBtn.textContent = l.paid ? '💰' : '⏳';
    paidBtn.style.marginLeft = '8px';
    paidBtn.style.cursor = 'pointer';
    paidBtn.onclick = () => togglePaid(l.index);
    right.appendChild(paidBtn);

    div.appendChild(left);
    div.appendChild(right);
    schedule.appendChild(div);
  });
}

// --- Первичная отрисовка ---
render();

// --- Аналитика дохода ---
const analyticsDateInput = document.getElementById('analyticsDate');
const analyticsResult = document.getElementById('analyticsResult');
analyticsDateInput.value = today.toISOString().slice(0,10);

function renderAnalytics() {
  const date = analyticsDateInput.value;
  const lessonsForDate = lessons.filter(l => l.date === date && l.status === 'done');
  const total = lessonsForDate.reduce((sum, l) => sum + Number(l.price || 0), 0);
  const paidCount = lessonsForDate.filter(l => l.paid).length;
  const totalCount = lessonsForDate.length;
  analyticsResult.textContent = `Занятий проведено: ${totalCount} (оплачено: ${paidCount}) | Доход: ${total} ₽`;
}
analyticsDateInput.oninput = renderAnalytics;
renderAnalytics();

// --- Переключение темы ---
let savedTheme = localStorage.getItem('theme') || 'dark';
document.body.classList.remove('light','dark');
document.body.classList.add(savedTheme);
themeToggle.textContent = savedTheme === 'dark' ? '🌙' : '☀️';

themeToggle.onclick = () => {
  document.body.classList.toggle('dark');
  document.body.classList.toggle('light');
  const newTheme = document.body.classList.contains('dark') ? 'dark' : 'light';
  localStorage.setItem('theme', newTheme);
  themeToggle.textContent = newTheme === 'dark' ? '🌙' : '☀️';
};
