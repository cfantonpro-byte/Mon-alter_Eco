/* Chrome partagé (barre du haut + indicateur d'étapes + barre d'onglets du bas)
   Utilisé par index.html (étape Profil) et study.html (Potentiel/Pistes/Synthèse). */
(function(){
  let lockedTipTimer=null;
  const STEPS = [
    {id:'profil', label:'Profil', icon:'user'},
    {id:'potentiel', label:'Potentiel', icon:'chart'},
    {id:'pistes', label:'Pistes', icon:'compass'},
    {id:'synthese', label:'Synthèse', icon:'doc'}
  ];

  const PATHS = {
    menu: 'M4 7h16M4 12h16M4 17h16',
    user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9a7 7 0 0 1 14 0',
    chart: 'M5 19V10M12 19V5M19 19v-7',
    compass: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm3.2-12.2-2 5-5 2 2-5 5-2Z',
    doc: 'M7 3h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm7 0v4h4M9 12h6M9 15.5h6M9 8.5h3',
    check: 'M5 12.5 9.5 17 19 7',
    star: 'M12 3.5l2.4 5.1 5.6.6-4.2 3.8 1.2 5.5L12 15.9 6.9 18.5l1.2-5.5-4.1-3.8 5.6-.6L12 3.5Z',
    leaf: 'M19 5C9 5 5 11 5 17.5c0 .3.2.5.5.5C12 18 19 15 19 5Zm0 0C13 9 9 13 6 17',
    shield: 'M12 3l7 3v6c0 5-3.5 7.7-7 9-3.5-1.3-7-4-7-9V6l7-3Z',
    clock: 'M12 7v5l3.2 3.2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z',
    coins: 'M8 10a4 3 0 1 0 0-6 4 3 0 0 0 0 6Zm0 0v6a4 3 0 0 0 8 0v-6M8 13a4 3 0 0 0 8 0',
    house: 'M4 11 12 4l8 7M6 10v9h12v-9',
    building: 'M6 21V6l6-3 6 3v15M6 21h12M9 10h2M13 10h2M9 14h2M13 14h2M9 18h2M13 18h2',
    target: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-4.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM12 12h.01',
    headset: 'M4 13a8 8 0 0 1 16 0v4a2 2 0 0 1-2 2h-1v-6h3M4 13v4a2 2 0 0 0 2 2h1v-6H4',
    cap: 'M12 5 2 9.5 12 14l10-4.5L12 5Zm-6 5.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-5.5',
    chevron: 'M9 5l7 7-7 7',
    close: 'M6 6l12 12M18 6 6 18'
  };

  function icon(name, size){
    size = size || 20;
    const d = PATHS[name] || PATHS.doc;
    return '<svg class="shell-icon" width="'+size+'" height="'+size+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+d+'"/></svg>';
  }

  function isUnlocked(step, unlocked){
    return unlocked === true || (Array.isArray(unlocked) && unlocked.includes(step.id));
  }
  function tabState(step, current, unlocked){
    if(step.id === current) return 'active';
    return isUnlocked(step, unlocked) ? 'done' : 'locked';
  }
  function stepState(step, current, unlocked, index, currentIndex){
    if(step.id === current) return 'active';
    if(!isUnlocked(step, unlocked)) return 'locked';
    return index < currentIndex ? 'done' : 'upcoming';
  }

  function defaultNavigate(id, opts){
    if(typeof opts.onTab === 'function'){ opts.onTab(id); return; }
    if(id === 'profil'){ location.href = 'index.html'; return; }
    location.href = 'study.html#' + id;
  }

  function renderTopbar(el, opts){
    const initials = (opts.initials || '').slice(0,2).toUpperCase() || '·';
    const currentIndex = STEPS.findIndex(function(s){return s.id===opts.current});
    el.innerHTML =
      '<div class="shell-bar">' +
        '<div class="shell-menu-wrap"><button class="shell-menu-btn" type="button" aria-label="Menu" data-shell-menu aria-expanded="false">' + icon('menu',20) + '</button>' +
          '<div class="shell-menu-panel" hidden><button type="button" data-legal>Mentions légales & confidentialité</button></div></div>' +
        '<span class="shell-logo" aria-hidden="true"><img src="assets/logo-white-gold-transparent.png" alt="Mon Alter-€co"></span>' +
        (opts.walterToggle
          ? '<button class="shell-avatar shell-avatar--active" type="button" data-walter-toggle aria-label="Désactiver les conseils de Walter" aria-pressed="true"><img src="assets/walter-chat-avatar.png" alt="Walter"></button>'
          : '<span class="shell-avatar" aria-hidden="true"><img src="assets/walter-chat-avatar.png" alt=""></span>') +
      '</div>' +
      '<div class="shell-steps" role="list">' +
        STEPS.map(function(step, i){
          const state = stepState(step, opts.current, opts.unlocked, i, currentIndex);
          return (
            '<div class="shell-step shell-step--' + state + '" role="listitem" data-step="' + step.id + '">' +
              '<button type="button" class="shell-step-dot" data-nav="' + step.id + '" aria-disabled="' + (state==='locked') + '" aria-current="' + (state==='active') + '">' +
                (state==='done' ? icon('check',13) : (i+1)) +
              '</button>' +
              '<span class="shell-step-label">' + step.label + '</span>' +
            '</div>' +
            (i < STEPS.length-1 ? '<span class="shell-step-line shell-step-line--' + (state!=='locked' ? 'on':'off') + '"></span>' : '')
          );
        }).join('') +
      '</div>' +
      '<div class="shell-locked-tip" role="status" aria-live="polite" hidden></div>';
  }

  function renderTabbar(el, opts){
    el.innerHTML =
      '<div class="shell-tabbar" role="tablist">' +
        STEPS.map(function(step){
          const state = tabState(step, opts.current, opts.unlocked);
          const isLocked = state === 'locked';
          return (
            '<button type="button" class="shell-tab shell-tab--' + state + '" data-nav="' + step.id + '"' + (isLocked ? ' disabled' : '') + ' role="tab" aria-selected="' + (state==='active') + '">' +
              icon(step.icon, 20) +
              '<span>' + step.label + '</span>' +
            '</button>'
          );
        }).join('') +
      '</div>';
  }

  function render(opts){
    opts = opts || {};
    const top = document.getElementById('app-topbar');
    const bottom = document.getElementById('app-tabbar');
    if(top) renderTopbar(top, opts);
    if(bottom) renderTabbar(bottom, opts);
    document.body.classList.add('has-app-shell');
    [top, bottom].forEach(function(container){
      if(!container) return;
      container.onclick = function(event){
        const homeLink=event.target.closest('[data-shell-home]');
        if(homeLink){
          event.preventDefault();
          if(typeof window.goHome==='function') window.goHome();
          else window.location.href=homeLink.href;
          return;
        }
        const menuButton = event.target.closest('[data-shell-menu]');
        if(menuButton){
          const panel=container.querySelector('.shell-menu-panel');
          const open=panel.hasAttribute('hidden');
          panel.toggleAttribute('hidden',!open);
          menuButton.setAttribute('aria-expanded',String(open));
          return;
        }
        const legalButton=event.target.closest('[data-legal]');
        if(legalButton){
          const overlay=document.getElementById('ml-overlay');
          if(overlay) overlay.style.display='flex';
          const panel=container.querySelector('.shell-menu-panel');
          if(panel) panel.hidden=true;
          return;
        }
        const walterButton=event.target.closest('[data-walter-toggle]');
        if(walterButton && typeof window.toggleWalterAdvice==='function'){
          window.toggleWalterAdvice();
          return;
        }
        const btn = event.target.closest('[data-nav]');
        if(!btn) return;
        if(btn.getAttribute('aria-disabled')==='true'){
          const tip=top && top.querySelector('.shell-locked-tip');
          const label=btn.closest('.shell-step')?.querySelector('.shell-step-label')?.textContent || 'cet onglet';
          if(tip){
            tip.textContent='Terminez de compléter votre profil afin d’accéder à l’onglet '+label+'.';
            tip.hidden=false;
            clearTimeout(lockedTipTimer);
            lockedTipTimer=setTimeout(function(){tip.hidden=true},2600);
          }
          return;
        }
        // L'étape active ne doit rien faire au clic : "naviguer" vers l'étape
        // où l'on est déjà rechargeait la page et effaçait la progression.
        if(btn.getAttribute('aria-current')==='true') return;
        defaultNavigate(btn.dataset.nav, opts);
      };
      if(container===top){
        container.onmouseover=function(event){
          const btn=event.target.closest('.shell-step-dot[aria-disabled="true"]');
          const tip=container.querySelector('.shell-locked-tip');
          if(!btn||!tip)return;
          const label=btn.closest('.shell-step').querySelector('.shell-step-label').textContent;
          tip.textContent='Terminez de compléter votre profil afin d’accéder à l’onglet '+label+'.';
          tip.hidden=false;
        };
        container.onmouseout=function(event){
          if(event.target.closest('.shell-step-dot[aria-disabled="true"]')){
            const tip=container.querySelector('.shell-locked-tip');
            if(tip)tip.hidden=true;
          }
        };
      }
    });
  }

  window.AppShell = {STEPS, icon, render};
})();
