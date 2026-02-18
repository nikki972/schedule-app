const $=id=>document.getElementById(id);
const modal=$('modal'),addBtn=$('addBtn'),cancelBtn=$('cancelBtn'),saveBtn=$('saveBtn');
const menuBtn=$('menuBtn'),sideMenu=$('sideMenu'),overlay=$('overlay'),closeMenu=$('closeMenu');
const goToday=$('goToday'),goAll=$('goAll'),goAnalytics=$('goAnalytics'),goStudents=$('goStudents');
const todayScreen=$('todayScreen'),allScreen=$('allScreen'),analyticsScreen=$('analyticsScreen'),studentsScreen=$('studentsScreen'),title=$('title');
const analyticsDate=$('analyticsDate'),countDone=$('countDone'),countPaid=$('countPaid'),sumIncome=$('sumIncome'),sumDebt=$('sumDebt');
const student=$('student'),subject=$('subject'),date=$('date'),time=$('startTime'),price=$('price');

let lessons=JSON.parse(localStorage.getItem('lessons')||'[]');
const students=[{id:1,name:'Иван',price:700},{id:2,name:'Мария',price:1000}];
students.forEach(s=>{const o=document.createElement('option');o.value=s.id;o.textContent=s.name;student.appendChild(o);});

menuBtn.onclick=()=>{sideMenu.classList.add('open');overlay.classList.add('show');};
overlay.onclick=closeSideMenu;closeMenu.onclick=closeSideMenu;
function closeSideMenu(){sideMenu.classList.remove('open');overlay.classList.remove('show');}

goToday.onclick=()=>showScreen('today');goAll.onclick=()=>showScreen('all');goAnalytics.onclick=()=>showScreen('analytics');goStudents.onclick=()=>showScreen('students');

function showScreen(s){
  todayScreen.classList.add('hidden');allScreen.classList.add('hidden');analyticsScreen.classList.add('hidden');studentsScreen.classList.add('hidden');
  if(s==='today'){todayScreen.classList.remove('hidden');title.textContent='Сегодня';renderToday();}
  if(s==='all'){allScreen.classList.remove('hidden');title.textContent='Все занятия';renderAll();}
  if(s==='analytics'){analyticsScreen.classList.remove('hidden');title.textContent='Аналитика';renderAnalytics();}
  if(s==='students'){studentsScreen.classList.remove('hidden');title.textContent='Ученики';renderStudents();}
  closeSideMenu();
}

function updateThemeIcon(){
  const btn=$('menuThemeToggle');
  if(document.body.classList.contains('dark')) btn.textContent='🌗'; else btn.textContent='☀️';
  btn.classList.add('active'); setTimeout(()=>btn.classList.remove('active'),300);
}
$('menuThemeToggle').onclick=()=>{
  document.body.classList.toggle('dark');document.body.classList.toggle('light');updateThemeIcon();
}
updateThemeIcon();

addBtn.onclick=()=>modal.classList.add('active');cancelBtn.onclick=()=>modal.classList.remove('active');
student.onchange=check;date.oninput=check;time.oninput=check;
function check(){saveBtn.disabled=!(student.value&&date.value&&time.value);}

saveBtn.onclick=()=>{
  const s=students.find(x=>x.id==student.value);
  lessons.push({student:s.name,subject:subject.value,date:date.value,time:time.value,price:price.value||s.price,status:'planned',paid:false});
  saveAll();
}

function statusIcon(s){return s==='done'?'✅':s==='cancelled'?'❌':'🕒';}
function nextStatus(s){return s==='planned'?'done':s==='done'?'cancelled':'planned';}

function renderLesson(container,l){
  const d=document.createElement('div');d.className='lesson';
  d.innerHTML=`<div>${l.date} ${l.time} — ${l.subject} (${l.student})<br>${l.price} ₽</div>
  <div>
  <span class="status">${statusIcon(l.status)}</span>
  <span class="paid">${l.paid?'💰':'⏳'}</span>
  <span class="move">🔁</span>
  </div>`;
  d.querySelector('.status').onclick=()=>{l.status=nextStatus(l.status);saveAll();}
  d.querySelector('.paid').onclick=()=>{l.paid=!l.paid;saveAll();}
  d.querySelector('.move').onclick=()=>{
    const newDate=prompt("Новая дата YYYY-MM-DD",l.date);
    const newTime=prompt("Новое время HH:MM",l.time);
    if(newDate && newTime){l.date=newDate;l.time=newTime;saveAll();}
  }
  container.appendChild(d);
}

function renderToday(){todayScreen.innerHTML='';const today=new Date().toISOString().slice(0,10);const list=lessons.filter(l=>l.date===today);
if(!list.length){todayScreen.innerHTML='<p>Сегодня занятий нет</p>';return;}
list.forEach(renderLesson.bind(null,todayScreen));}

function renderAll(){allScreen.innerHTML='';lessons.forEach(renderLesson.bind(null,allScreen));}

const today=new Date().toISOString().slice(0,10);
analyticsDate.value=today;
analyticsDate?.addEventListener('change',renderAnalytics);

function renderAnalytics(){
  const d=analyticsDate.value;
  const list=lessons.filter(l=>l.date===d && l.status==='done');
  const paid=list.filter(l=>l.paid);
  const income=paid.reduce((s,l)=>s+Number(l.price),0);
  const debt=list.reduce((s,l)=>s+Number(l.price),0)-income;
  if(countDone)countDone.textContent=list.length;
  if(countPaid)countPaid.textContent=paid.length;
  if(sumIncome)sumIncome.textContent=income+' ₽';
  if(sumDebt)sumDebt.textContent=debt+' ₽';
}

function renderStudents(){
  studentsScreen.innerHTML='';
  students.forEach(s=>{
    const d=document.createElement('div');d.className='students-card';
    const studentLessons=lessons.filter(l=>l.student===s.name);
    const paidCount=studentLessons.filter(l=>l.paid).length;
    const total=studentLessons.reduce((sum,l)=>sum+Number(l.price),0);
    const debt=total-studentLessons.filter(l=>l.paid).reduce((sum,l)=>sum+Number(l.price),0);
    d.innerHTML=`<strong>${s.name}</strong> — Цена: ${s.price} ₽<br>
    Занятий: ${studentLessons.length}, Оплачено: ${paidCount}, Долг: ${debt} ₽<br>
    <button class="changePrice">Сменить цену</button>`;
    d.querySelector('.changePrice').onclick=()=>{
      const np=parseInt(prompt("Новая цена",s.price));
      if(np){s.price=np;saveAll();}
    };
    studentsScreen.appendChild(d);
  });
}

function saveAll(){localStorage.setItem('lessons',JSON.stringify(lessons));renderToday();renderAll();renderAnalytics();renderStudents();}

showScreen('today');
