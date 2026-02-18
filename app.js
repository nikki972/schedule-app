const addBtn = document.getElementById('addBtn');
const modal = document.getElementById('modal');
const cancelBtn = document.getElementById('cancelBtn');
const saveBtn = document.getElementById('saveBtn');

const subject = document.getElementById('subject');
const dateInput = document.getElementById('date');
const startTime = document.getElementById('startTime');
const priceSelect = document.getElementById('price');

const schedule = document.getElementById('schedule');
const todayDate = document.getElementById('todayDate');

const today = new Date();
todayDate.textContent = today.toLocaleDateString('ru-RU', {
  weekday: 'long',
  day: 'numeric',
  month: 'long'
});

let lessons = JSON.parse(localStorage.getItem('lessons') || '[]');

function checkForm() {
  if (dateInput.value && startTime.value) {
    saveBtn.disabled = false;
  } else {
    saveBtn.disabled = true;
  }
}

addBtn.onclick = () => {
  modal.classList.remove('hidden');
};

cancelBtn.onclick = () => {
  modal.classList.add('hidden');
};

dateInput.oninput = checkForm;
startTime.oninput = checkForm;

saveBtn.onclick = () => {
  const lesson = {
    subject: subject.value,
    date: dateInput.value,
    start: startTime.value,
    duration: 60,
    price: priceSelect.value || null,
    status: 'planned'
  };

  lessons.push(lesson);
  localStorage.setItem('lessons', JSON.stringify(lessons));
  modal.classList.add('hidden');
  render();
};

function render() {
  schedule.innerHTML = '';

  const todayStr = today.toISOString().slice(0,10);
  const todayLessons = lessons.filter(l => l.date === todayStr);

  if (todayLessons.length === 0) {
    schedule.innerHTML = '<p class="empty">Сегодня занятий нет</p>';
    return;
  }

  todayLessons.forEach(l => {
    const div = document.createElement('div');
    div.textContent = `${l.start} — ${l.subject} (${l.duration} мин)`;
    schedule.appendChild(div);
  });
}

render();
