import{a as e,c as t,d as n,f as r,h as i,i as a,l as o,n as s,o as c,s as l,t as u,u as d,x as f}from"./ids-CGJgSf-y.js";var p=document.querySelector(`#app`);p.innerHTML=`
  <main>
    <h1>Mythic Dice</h1>
    <p id="status">Waiting for Owlbear…</p>
    <button id="attach" type="button" disabled>Attach to Token</button>
    <p id="token-status">No token attached.</p>
    <div class="color-bar" role="group" aria-label="Die color">${t.map(e=>`
    <button
      type="button"
      class="swatch"
      data-color="${e.id}"
      style="background: ${e.swatch}"
      aria-label="${e.label}"
      aria-pressed="false"
      title="${e.label}"
    ></button>
  `).join(``)}</div>
    <div class="dice">${d.map(e=>`
    <button type="button" class="die" data-die="${e}" disabled>
      <img alt="${e}" width="512" height="512" />
    </button>
  `).join(``)}</div>
    <button id="clear-color" type="button" disabled>Clear color dice</button>
  </main>
`;var m=document.querySelector(`#status`),h=document.querySelector(`#token-status`),g=document.querySelector(`#attach`),_=document.querySelector(`#clear-color`),v=[...document.querySelectorAll(`.swatch`)],y=[...document.querySelectorAll(`.die`)],b=o,x=!1;function S(){for(let e of v)e.setAttribute(`aria-pressed`,e.dataset.color===b?`true`:`false`);for(let e of y){let t=e.querySelector(`img`);t.src=n(i(e.dataset.die,b)),t.alt=`${b} ${e.dataset.die}`,e.disabled=!x}_.disabled=!x,_.textContent=`Clear ${b} dice`}function C(e){let t=document.documentElement;t.dataset.mode=e.mode,t.style.setProperty(`--bg`,e.background.paper),t.style.setProperty(`--text`,e.text.primary),t.style.setProperty(`--muted`,e.text.secondary),t.style.setProperty(`--line`,e.mode===`DARK`?`#57534e`:`#a8a29e`)}var w=0;async function T(e){let t=++w,n=!!e.metadata?.[a],i=e.metadata?.[l],o=e.metadata?.[s];if(r(o)&&o!==b&&(b=o),g.disabled=!1,n&&(h.textContent=`Click a character token.`),!i){x=!1,S(),n||(h.textContent=`No token attached.`);return}x=!0;let c=`token`;if(await f.scene.isReady()){let e=(await f.scene.items.getItems([i]))[0];if(t!==w)return;if(!e){x=!1,S(),h.textContent=n?`Click a character token. The previous token is not on this scene.`:`The attached token is not on this scene.`;return}e.name&&(c=e.name)}S(),h.textContent=n?`Click a character token. Still attached to ${c}.`:`Attached to ${c}.`}for(let e of v)e.addEventListener(`click`,async()=>{b=e.dataset.color,S(),f.isAvailable&&f.isReady&&await f.player.setMetadata({[s]:b})});for(let t of y)t.addEventListener(`click`,async()=>{x&&f.isAvailable&&await f.player.setMetadata({[e]:{id:crypto.randomUUID(),die:t.dataset.die,color:b}})});g.addEventListener(`click`,async()=>{let e=await f.player.getSelection()??[];await f.player.setMetadata({[l]:null,[a]:!0,[c]:e}),await f.player.deselect()}),_.addEventListener(`click`,async()=>{x&&f.isAvailable&&await f.player.setMetadata({[u]:b})}),f.onReady(async()=>{m.textContent=`Connected to Owlbear.`,C(await f.theme.getTheme()),f.theme.onChange(C),S(),await T({metadata:await f.player.getMetadata(),selection:await f.player.getSelection()??[]}),f.player.onChange(T)});