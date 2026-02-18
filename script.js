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
const subjectInput = $('subject');
const dateInput = $('date');
const timeInput = $('time');

let lessons = [];
let currentDate = new Date();

/* ===== DATE ===== */
const weekDays = ['Воскресенье','Понедельник','Вторник','Среда','Четверг','Пятница','Суббота'];

function formatDate(d) {
  return d.toLocaleDateString('ru-RU',{day:'2-digit',month:'2-digit',year:'2-digit'});
}

function isToday(d){
  const t=new Date();
  return d.toDateString()===t.toDateString();
}

function updateHeader(){
  title.textContent = weekDays[currentDate.getDay()];
  todayDate.textContent = formatDate(currentDate);
  todayMark.classList.toggle('hidden', !isToday(currentDate));
}

/* ===== DAY NAV ===== */
function changeDay(d){
  currentDate.setDate(currentDate.getDate()+d);
  updateHeader();
  renderToday();
}

prevDayBtn.onclick = ()=>changeDay(-1);
nextDayBtn.onclick = ()=>changeDay(1);

/* ===== TODAY ===== */
function renderToday(){
  todayScreen.innerHTML='';
  const day=currentDate.toISOString().slice(0,10);
  const list=lessons.filter(l=>l.date===day);

  if(!list.length){
    todayScreen.innerHTML='<p style="padding:16px;opacity:.6">Нет занятий</p>';
    return;
  }

  list.forEach(l=>{
    const d=document.createElement('div');
    d.className='lesson';
    d.textContent=`${l.time} — ${l.subject} (${l.student})`;
    todayScreen.appendChild(d);
  });
}

/* ===== SHEET ===== */
function checkForm(){
  saveBtn.disabled = !(studentInput.value && subjectInput.value && dateInput.value && timeInput.value);
}

[studentInput,subjectInput,dateInput,timeInput].forEach(i=>i.oninput=checkForm);

addBtn.onclick = ()=>{
  modal.classList.add('active');
  dateInput.value = currentDate.toISOString().slice(0,10);
};

cancelBtn.onclick = ()=>modal.classList.remove('active');

saveBtn.onclick = ()=>{
  lessons.push({
    student: studentInput.value,
    subject: subjectInput.value,
    date: dateInput.value,
    time: timeInput.value
  });
  modal.classList.remove('active');
  renderToday();
};

/* INIT */
updateHeader();
renderToday();
