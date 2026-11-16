const DATA_URL = "data/menu.json";
const money = value => value == null ? "Preço a confirmar" : value.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const $ = selector => document.querySelector(selector);
let data, activeCategory = "lanches";

async function init(){
  const response = await fetch(DATA_URL);
  data = await response.json();
  document.querySelectorAll("[data-ifood]").forEach(link => link.href = data.brand.ifood);
  $("#year").textContent = new Date().getFullYear();
  renderCategories(); renderMenu(activeCategory); renderLocations(); setupNav(); setupQuiz(); setupMotion();
  updateOpenStatuses(); setInterval(updateOpenStatuses, 60000);
  addRestaurantSchema();
}
function renderCategories(){
  $("#category-tabs").innerHTML = data.categories.map(cat =>
    `<button class="category-tab" role="tab" aria-selected="${cat.id===activeCategory}" data-category="${cat.id}">${cat.icon} ${cat.name}</button>`
  ).join("");
  $("#category-tabs").addEventListener("click", event=>{
    const button=event.target.closest("[data-category]"); if(!button)return;
    activeCategory=button.dataset.category;
    $("#category-tabs").querySelectorAll("button").forEach(b=>b.setAttribute("aria-selected",String(b===button)));
    renderMenu(activeCategory);
  });
}
const artIcons={crown:"♛",city:"▥",burger:"🍔",street:"↗",factory:"▦",train:"▤",cactus:"🌵",leaf:"🌿",star:"★",wave:"〰",fries:"🍟",nuggets:"✦",shake:"🥤",drink:"🥤",beer:"🍺",cocktail:"🍸"};
function renderMenu(id){
  const category=data.categories.find(c=>c.id===id);
  $("#category-eyebrow").textContent=category.eyebrow.toUpperCase();
  $("#menu-count").textContent=`${String(category.items.length).padStart(2,"0")} OPÇÕES`;
  $("#menu-grid").innerHTML=category.items.map((item,index)=>`
    <article class="menu-card" tabindex="0" role="button" aria-label="${item.name}, ${money(item.price)}. Ver detalhes" data-item="${index}">
      <div class="card-top"><span class="district-tag">⌖ ${item.district}</span><span class="card-art" aria-hidden="true">${artIcons[item.art]||"✳"}</span></div>
      <h3>${item.name}</h3><p>${item.description}</p>
      <div class="card-bottom"><span class="price ${item.price==null?"pending":""}">${money(item.price)}</span><span class="card-more">DETALHES ↗</span></div>
      ${item.availability?`<span class="new-tag">${item.availability.toUpperCase()}</span>`:""}
    </article>`).join("");
  const activate=card=>{
    const item=category.items[Number(card.dataset.item)];
    card.querySelector(".card-more").textContent=item.availability?item.availability.toUpperCase():"FEITO PRA MATAR A FOME";
    card.classList.toggle("selected");
  };
  $("#menu-grid").querySelectorAll(".menu-card").forEach(card=>{
    card.addEventListener("click",()=>activate(card));
    card.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();activate(card)}});
  });
}
function parseTime(value){const [h,m]=value.split(":").map(Number);return h*60+m}
function statusFor(location, now){
  if(!location.hours)return {label:"Horário a confirmar",state:"unknown"};
  const day=now.getDay(), mins=now.getHours()*60+now.getMinutes();
  for(const slot of location.hours){
    if(slot.days.includes(day)){
      const open=parseTime(slot.open), close=parseTime(slot.close);
      if(mins>=open && mins<close)return {label:"Aberto agora · fecha às "+slot.close,state:"open"};
      if(mins<open)return {label:"Abre hoje às "+slot.open,state:"closed"};
    }
    // Horários que passam da meia-noite: verifica o dia anterior.
    const prev=(day+6)%7;
    if(slot.days.includes(prev)&&parseTime(slot.close)<parseTime(slot.open)&&mins<parseTime(slot.close))
      return {label:"Aberto agora · fecha às "+slot.close,state:"open"};
  }
  const future=[];
  for(let offset=0;offset<8;offset++){
    const weekday=(day+offset)%7;
    location.hours.forEach(slot=>{if(slot.days.includes(weekday)){
      const start=parseTime(slot.open);
      if(offset>0 || start>mins)future.push({offset,start});
    }});
  }
  future.sort((a,b)=>a.offset-b.offset||a.start-b.start);
  if(!future.length)return {label:"Fechado hoje",state:"closed"};
  const next=future[0], time=`${String(Math.floor(next.start/60)).padStart(2,"0")}:${String(next.start%60).padStart(2,"0")}`;
  const dayNames=["domingo","segunda","terça","quarta","quinta","sexta","sábado"];
  return {label:next.offset===0?`Abre hoje às ${time}`:`Abre ${dayNames[(day+next.offset)%7]} às ${time}`,state:"closed"};
}
function renderLocations(){
  $("#location-grid").innerHTML=data.locations.map(loc=>`
    <article class="location-card">
      <span class="district">${loc.district}</span><h3>${loc.name}</h3>
      <address>${loc.address}</address>
      <p class="hours-label">${loc.hoursLabel}</p>
      <span class="open-status ${loc.hours?"":"unknown"}" data-status="${loc.id}"><i></i>Calculando horário…</span>
      <div class="location-actions"><a class="small-btn orange" href="${loc.maps}" target="_blank" rel="noopener">COMO CHEGAR ↗</a><a class="small-btn" href="${data.brand.ifood}" target="_blank" rel="noopener">PEDIR NO IFOOD ↗</a></div>
      <iframe class="map-frame" loading="lazy" title="Mapa de ${loc.name}" src="https://maps.google.com/maps?q=${encodeURIComponent(loc.address)}&output=embed"></iframe>
    </article>`).join("");
}
function updateOpenStatuses(){
  const now=new Date(new Date().toLocaleString("en-US",{timeZone:"America/Sao_Paulo"}));
  data.locations.forEach(loc=>{
    const el=document.querySelector(`[data-status="${loc.id}"]`); if(!el)return;
    const result=statusFor(loc,now);el.className=`open-status ${result.state}`;el.innerHTML=`<i></i>${result.label}`;
  });
}
const quiz=[
 {q:"Qual é a sua vibe hoje?",opts:[["Clássico, sem erro","classic"],["Bacon? Sempre!","bacon"],["Quero experimentar algo diferente","adventure"]]},
 {q:"Escolhe um rolê:",opts:[["Centro movimentado","classic"],["Fumaça e chapa quente","bacon"],["Pé na areia, mente leve","adventure"]]},
 {q:"O que não pode faltar?",opts:[["Queijo derretendo","classic"],["Bacon crocante","bacon"],["Uma surpresa de sabor","adventure"]]}
];
let quizIndex=0,quizScores={classic:0,bacon:0,adventure:0};
function setupQuiz(){renderQuizQuestion()}
function renderQuizQuestion(){
 const q=quiz[quizIndex];$("#quiz-step").textContent=`0${quizIndex+1} / 03`;$("#progress-fill").style.width=`${(quizIndex+1)/3*100}%`;
 $("#quiz-question").textContent=q.q;
 $("#quiz-options").innerHTML=q.opts.map(([label,key])=>`<button class="quiz-option" data-score="${key}">${label} →</button>`).join("");
 $("#quiz-result").hidden=true;
 $("#quiz-options").querySelectorAll("button").forEach(btn=>btn.addEventListener("click",()=>{
  quizScores[btn.dataset.score]++;quizIndex++;
  if(quizIndex<3)renderQuizQuestion();else showQuizResult();
 }));
}
function showQuizResult(){
 const winner=Object.entries(quizScores).sort((a,b)=>b[1]-a[1])[0][0];
 const recommendations={classic:["Centrinho","2 smash de 65g, cheddar e molho picles. Um clássico da cidade."],bacon:["Baconville","2 smash de 65g, cheddar e bacon fatiado. O bairro tem personalidade."],adventure:["Litoral","Burger de camarão, maionese de wasabi, couve crispy e catupiry. Exclusivo do salão."]};
 const [name,desc]=recommendations[winner], item=data.categories[0].items.find(x=>x.name===name);
 $("#quiz-options").innerHTML="";$("#quiz-question").textContent="O Chico escolheu seu bairro!";
 $("#quiz-result").hidden=false;$("#quiz-result").innerHTML=`<strong>Seu rolê: ${name}!</strong>${desc}<br>${item.price==null?"Preço a confirmar · só no salão":money(item.price)}<br><a href="${data.brand.ifood}" target="_blank" rel="noopener">PEDIR NO IFOOD ↗</a> <button id="quiz-again" class="quiz-option">FAZER DE NOVO ↻</button>`;
 $("#quiz-again").addEventListener("click",()=>{quizIndex=0;quizScores={classic:0,bacon:0,adventure:0};renderQuizQuestion()});
}
function setupNav(){
 const toggle=$(".menu-toggle"),nav=$(".nav");
 toggle.addEventListener("click",()=>{const open=nav.classList.toggle("open");toggle.setAttribute("aria-expanded",String(open));toggle.textContent=open?"×":"☰"});
 nav.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{nav.classList.remove("open");toggle.setAttribute("aria-expanded","false");toggle.textContent="☰"}));
}
function addRestaurantSchema(){
 const loc=data.locations[0];
 const schema={"@context":"https://schema.org","@type":"Restaurant","name":data.brand.name,"servesCuisine":"Hambúrgueres, Smash Burger","description":data.brand.slogan,"url":location.href,"sameAs":[data.brand.instagram],"address":{"@type":"PostalAddress","streetAddress":"Rua Conselheiro Antônio Prado, 103","addressLocality":"Guarulhos","addressRegion":"SP","addressCountry":"BR"},"openingHoursSpecification":[{"@type":"OpeningHoursSpecification","dayOfWeek":["Wednesday","Thursday","Friday"],"opens":"12:00","closes":"23:00"},{"@type":"OpeningHoursSpecification","dayOfWeek":["Saturday","Sunday"],"opens":"18:00","closes":"00:00"}]};
 $("#restaurant-schema").textContent=JSON.stringify(schema);
}
init().catch(error=>{console.error("Não foi possível carregar data/menu.json",error);$("#menu-grid").textContent="Não foi possível carregar o cardápio. Verifique se está usando um servidor local."});


function setupMotion(){
  const reduce=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if(reduce)return;
  const hero=$(".hero"), mascot=$(".hero-mascot");
  if(hero&&mascot){
    hero.addEventListener("pointermove",event=>{
      if(event.pointerType==="touch")return;
      const rect=hero.getBoundingClientRect();
      const x=(event.clientX-rect.left)/rect.width-.5;
      const y=(event.clientY-rect.top)/rect.height-.5;
      mascot.style.transform=`translate(${x*12}px,${y*10}px)`;
    });
    hero.addEventListener("pointerleave",()=>mascot.style.transform="");
    window.addEventListener("scroll",()=>{
      const amount=Math.min(window.scrollY*.16,90);
      hero.querySelector(".skyline-back").style.transform=`translateY(${amount*.35}px) scaleX(1.1)`;
      hero.querySelector(".skyline-front").style.transform=`translateY(${amount*.65}px)`;
    },{passive:true});
  }
  const reveal=document.querySelectorAll(".menu-card,.location-card,.story-copy,.litoral-feature,.combo-banner,.insta-tile");
  reveal.forEach(el=>el.classList.add("reveal"));
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add("is-visible");observer.unobserve(entry.target)}});
  },{threshold:.12});
  reveal.forEach(el=>observer.observe(el));
}
