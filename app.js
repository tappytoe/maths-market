(() => {
"use strict";
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const STORE="tappytoe-maths-market-v1";
const fruit=[{name:"apple",emoji:"🍎"},{name:"orange",emoji:"🍊"},{name:"pear",emoji:"🍐"},{name:"banana",emoji:"🍌"},{name:"strawberry",emoji:"🍓"},{name:"watermelon",emoji:"🍉"},{name:"carrot",emoji:"🥕"},{name:"corn",emoji:"🌽"}];
const customers=[{name:"Benny Bear",emoji:"🐻"},{name:"Mimi Mouse",emoji:"🐭"},{name:"Pip Penguin",emoji:"🐧"},{name:"Kiki Cat",emoji:"🐱"},{name:"Ollie Otter",emoji:"🦦"},{name:"Lulu Bunny",emoji:"🐰"}];
let level=1,mode="basket",task=null,round=0,stars=0,completed=0,seen=new Set(),selectedItems=[],selectedCoins=[],done=false,attempts=0,answerValue=0;
try{const s=JSON.parse(localStorage.getItem(STORE)||"{}");stars=Number(s.stars)||0;completed=Number(s.completed)||0}catch(_){}
const rand=(a,b)=>Math.floor(Math.random()*(b-a+1))+a, pick=a=>a[rand(0,a.length-1)];
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=rand(0,i);[a[i],a[j]]=[a[j],a[i]]}return a};
const cash=c=>"$"+(c/100).toFixed(2);
function persist(){$("#star-count").textContent=stars;$("#progress-copy").textContent=completed?completed+" missions completed. You're growing your maths skills!":"Complete a mission to earn your first star!";$("#progress-fill").style.width=Math.min(100,completed*5)+"%";try{localStorage.setItem(STORE,JSON.stringify({stars,completed}))}catch(_){}}
function setLevel(n){level=Number(n);$$(".level-card").forEach(b=>{let on=+b.dataset.level===level;b.classList.toggle("selected",on);b.setAttribute("aria-pressed",String(on))});$("#mission-subtitle").textContent="Primary "+level+" • "+["Little Sprout","Bright Bud","Curious Grower","Market Maker","Maths Whiz","Market Master"][level-1]+" missions";startMission()}
function setMode(m){mode=m;$$(".mission-tab").forEach(b=>b.classList.toggle("active",b.dataset.mode===m));startMission()}
function generate(){
const f=pick(fruit),g=pick(fruit.filter(x=>x.name!==f.name)),customer=pick(customers),t={level,mode,fruit:f,other:g,customer};
if(mode==="basket"){const min=[0,3,4,5,7,9,12][level],max=[0,8,10,14,18,24,30][level];t.target=rand(min,max);t.answer=t.target;t.prompt=level<=2?"Could you put "+t.target+" "+f.name+(t.target===1?"":"s")+" in my basket?":"My market picnic needs "+t.target+" "+f.name+"s. Can you count out exactly that many?";t.hint="Tap the requested fruit one at a time. Count the basket until it shows "+t.target+"."}
if(mode==="coins"){t.target=level<=2?rand(1,9)*10:rand(level<=4?2:12,level<=4?15:45)*10+pick([0,5]);t.answer=t.target;t.prompt=(level<=2?"This snack costs ":"Your market order costs ")+cash(t.target)+". Choose coins to pay exactly!";t.hint="Try making dollars first, then add the cents. Tap coins to add them; choose Return all coins to start over."}
if(mode==="order"){
if(level<=2){t.a=rand(2,level===1?6:9);t.b=rand(1,level===1?5:8);t.op=pick(["+","−"])}
else if(level<=4){t.a=rand(3,level===3?9:12);t.b=rand(2,level===3?8:12);t.op=pick(["+","−","×"])}
else{t.op=pick(["+","−","×"]);t.a=t.op==="×"?rand(2,level===5?12:18):rand(12,level===5?45:90);t.b=pick([2,3,4,5,6,8,10])}
if(t.op==="−"&&t.b>t.a)[t.a,t.b]=[t.b,t.a];t.answer=t.op==="+"?t.a+t.b:t.op==="−"?t.a-t.b:t.a*t.b;
t.prompt=t.op==="×"?"A crate holds "+t.a+" "+f.name+"s. There are "+t.b+" crates. How many altogether?":t.op==="+"?"The stall has "+t.a+" "+f.name+"s and gets "+t.b+" more. How many now?":"There are "+t.a+" "+f.name+"s. The stall sells "+t.b+". How many are left?";
t.hint=t.op==="+"?"Put both amounts together.":t.op==="−"?"Start with the larger amount and take away the smaller one.":"Think of equal groups: "+t.a+" groups of "+t.b+"."
}
return t}
function signature(t){return [t.level,t.mode,t.prompt,t.target,t.a,t.b,t.op].join("|")}
function startMission(){
$("#feedback-banner").hidden=true;$("#next-button").hidden=true;$("#check-button").disabled=false;$("#hint-text").hidden=true;done=false;attempts=0;selectedItems=[];selectedCoins=[];
let next;for(let i=0;i<50;i++){next=generate();const k=signature(next);if(!seen.has(k)){seen.add(k);break}}if(seen.size>240)seen.clear();task=next;round++;
$("#customer-avatar").textContent=task.customer.emoji;$("#customer-name").textContent=task.customer.name+" says…";$("#mission-prompt").textContent=task.prompt;$("#mission-badge").textContent="MISSION "+String(round).padStart(2,"0");
$("#action-note").textContent=mode==="basket"?"Tap the fruit to add it to your basket.":mode==="coins"?"Tap coins to choose them, then check your total.":"Use the + and − controls to solve the order.";
render()}
function render(){
const area=$("#playground");area.innerHTML="";
if(mode==="basket"){
const basket=document.createElement("div");basket.className="basket-display";basket.innerHTML='<div class="basket-title">🧺 MY MARKET BASKET</div><div class="basket-items" id="basket-items"><span class="empty-basket">Your basket is waiting…</span></div><div class="basket-total" id="basket-total">0 / '+task.target+' collected</div>';area.append(basket);
const tray=document.createElement("div");tray.className="coin-tray";const options=shuffle([task.fruit,task.other,...shuffle(fruit.filter(f=>f.name!==task.fruit.name&&f.name!==task.other.name)).slice(0,2)]);
options.forEach(f=>{const b=document.createElement("button");b.className="item-card";b.innerHTML='<span class="emoji">'+f.emoji+'</span><span class="item-label">'+f.name+'</span>';b.addEventListener("click",()=>{if(done)return;if(f.name!==task.fruit.name){b.classList.add("wiggle");toast("Your customer asked for "+task.fruit.name+"s!");setTimeout(()=>b.classList.remove("wiggle"),350);return}selectedItems.push(f);updateBasket()});tray.append(b)});area.append(tray);updateBasket()
}else if(mode==="coins"){
const tray=document.createElement("div");tray.className="coin-tray";const denoms=level<=2?[10,20,50]:level<=4?[5,10,20,50,100]:[5,10,20,50,100,200];
denoms.forEach(v=>{const b=document.createElement("button");b.className="coin-button";b.textContent=v>=100?"$"+(v/100):v+"¢";b.setAttribute("aria-label","Add "+cash(v)+" coin");b.addEventListener("click",()=>{if(done)return;selectedCoins.push(v);b.classList.add("selected");updateCoins()});tray.append(b)});
const total=document.createElement("div");total.className="money-total";total.id="money-total";tray.append(total);
const clear=document.createElement("button");clear.className="hint-button";clear.type="button";clear.textContent="Return all coins";clear.addEventListener("click",()=>{if(done)return;selectedCoins=[];tray.querySelectorAll(".coin-button").forEach(b=>b.classList.remove("selected"));updateCoins()});tray.append(clear);area.append(tray);updateCoins()
}else{
const layout=document.createElement("div");layout.className="order-layout";const ticket=document.createElement("div");ticket.className="order-ticket";ticket.innerHTML='<span class="ticket-label">CUSTOMER ORDER</span><h3>Help at the stall!</h3><div class="order-line"><span>First amount</span><span>'+task.a+'</span></div><div class="order-line"><span>Second amount</span><span>'+task.b+'</span></div><div class="order-line"><span>Maths move</span><span>'+task.op+'</span></div>';
const builder=document.createElement("div");builder.className="order-builder";builder.innerHTML='<span class="ticket-label">YOUR ANSWER</span><h3>Work it out</h3><div class="stepper-row"><span>Answer</span><div class="stepper"><button type="button" id="answer-minus" aria-label="Decrease answer">−</button><strong id="answer-value">0</strong><button type="button" id="answer-plus" aria-label="Increase answer">+</button></div></div><p style="font-size:11px;line-height:1.6;color:#7b9187;font-weight:800">Tap the answer number to jump by 10. Need help? Try a hint.</p>';layout.append(ticket,builder);area.append(layout);answerValue=0;
$("#answer-minus").addEventListener("click",()=>{answerValue=Math.max(0,answerValue-1);syncAnswer()});$("#answer-plus").addEventListener("click",()=>{answerValue=Math.min(task.answer+10,answerValue+1);syncAnswer()});$("#answer-value").style.cursor="pointer";$("#answer-value").addEventListener("click",()=>{answerValue=Math.min(task.answer+10,answerValue+10);syncAnswer()})
}}
function updateBasket(){const h=$("#basket-items");if(!h)return;h.innerHTML="";if(!selectedItems.length)h.innerHTML='<span class="empty-basket">Your basket is waiting…</span>';else selectedItems.forEach(f=>{const s=document.createElement("span");s.textContent=f.emoji;h.append(s)});$("#basket-total").textContent=selectedItems.length+" / "+task.target+" collected"}
function updateCoins(){$("#money-total").textContent="Your coins: "+cash(selectedCoins.reduce((a,b)=>a+b,0))}
function syncAnswer(){$("#answer-value").textContent=answerValue}
function getAnswer(){return mode==="basket"?selectedItems.length:mode==="coins"?selectedCoins.reduce((a,b)=>a+b,0):answerValue}
function check(){if(done)return;attempts++;if(getAnswer()===task.answer){done=true;stars++;completed++;persist();$("#feedback-banner").className="feedback-banner";$("#feedback-banner").textContent=pick(["Brilliant! Your customer is smiling. +1 market star! ✨","You did it! Maths magic at the market! +1 star! 🌟","Super market helper! That's exactly right. +1 star! 🎉"]);$("#feedback-banner").hidden=false;$("#check-button").disabled=true;$("#next-button").hidden=false}else{$("#feedback-banner").className="feedback-banner wrong";$("#feedback-banner").textContent=attempts===1?"Not quite yet — have another look and try again. 💛":"Keep going! Try a hint, then have another go. 🌱";$("#feedback-banner").hidden=false}}
function hint(){$("#hint-text").textContent=task.hint;if(mode==="coins")$("#hint-text").textContent+=" You have selected "+cash(getAnswer())+" so far.";if(mode==="basket")$("#hint-text").textContent+=" You have "+selectedItems.length+" in your basket so far.";$("#hint-text").hidden=false}
function toast(message){const t=$("#toast");t.textContent=message;t.classList.add("show");clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove("show"),2200)}
$$(".level-card").forEach(b=>b.addEventListener("click",()=>setLevel(b.dataset.level)));$$(".mission-tab").forEach(b=>b.addEventListener("click",()=>setMode(b.dataset.mode)));$("#check-button").addEventListener("click",check);$("#hint-button").addEventListener("click",hint);$("#next-button").addEventListener("click",startMission);setLevel(1);persist();
})();