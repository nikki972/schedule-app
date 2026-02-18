const $ = id => document.getElementById(id);

const todayScreen = $('todayScreen');
const title = $('title');
const todayDate = $('todayDate');
const todayMark = $('todayMark');

const prevDayBtn = $('prevDay');
const nextDayBtn = $('nextDay');

const addBtn = $('addBtn');
const modal = $('modal');
const saveBtn = $('saveBtn');
const cancelBtn = $('cancelBtn');

const studentInput = $('student');
const subjectSelect = $('subject');
const dateInput = $('date');
const timeInput = $('time');

let lessons = [];
let currentDate = new Date();

/* ===== HEADER ===== */
const days = ['Воскресенье','Понедельник','Вторник','Среда','Четверг','Пятница','Суббота'];

function updateHeader() {
  title.textContent = days[currentDate.getDay()];
  todayDate.textContent = currentDate.toLocaleDateString('ru-RU');
  todayMark.classList.toggle(
    'hidden',
    currentDate.toDateString() !== new Date().toDateString()
  );
}

/* ===== DAY NAV ===== */
function changeDay(d) {
  currentDate.setDate(currentDate.getDate() + d);
  updateHeader();
  renderToday();
}

prevDayBtn.onclick = () => changeDay(-1);
nextDayBtn.onclick = () => changeDay(1);

/* ===== SORT + RENDER ===== */
function renderToday() {
  todayScreen.innerHTML = '';
  const day = currentDate.toISOString().slice(0,10);

  const list = lessons
    .filter(l => l.date === day)
    .sort((a, b) => a.time.localeCompare(b.time));

  if (!list.length) {
    todayScreen.innerHTML =
      '<p style="padding:16px;opacity:.6">Нет занятий</p>';
    return;
  }

  list.forEach(l => {
    const row = document.createElement('div');
    row.className = 'lesson';

    row.innerHTML = `
      <div class="lesson-time">${l.time}</div>
      <div class="lesson-info">
        <div class="lesson-student">${l.student}</div>
        <div class="lesson-subject">${l.subject}</div>
      </div>
    `;

    todayScreen.appendChild(row);
  });
}

/* ===== MODAL ===== */
function checkForm() {
  saveBtn.disabled = !(
    studentInput.value &&
    dateInput.value &&
    timeInput.value
  );
}

[studentInput, dateInput, timeInput].forEach(i => i.oninput = checkForm);

addBtn.onclick = () => {
  modal.classList.add('active');
  dateInput.value = currentDate.toISOString().slice(0,10);
  subjectSelect.value = 'Математика';
  checkForm();
};

cancelBtn.onclick = () => modal.classList.remove('active');

saveBtn.onclick = () => {
  lessons.push({
    student: studentInput.value,
    subject: subjectSelect.value,
    date: dateInput.value,
    time: timeInput.value
  });
  modal.classList.remove('active');
  renderToday();
};

/* INIT */
updateHeader();
renderToday();
