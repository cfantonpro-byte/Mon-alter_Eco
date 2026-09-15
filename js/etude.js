/* Socle commun ; Stüdyz reste une solution du catalogue. */
(function(){
  const fallback={civilite:'',statut:'Salarié',famille:'Marié(e)',objectifs:['Préparer ma retraite','Valoriser mon épargne'],impot:5000,impotLabel:'5 000 – 7 500 €',mensuel:350,mensuelLabel:'200–500 €',epargne:40000,epargneLabel:'30 000–50 000 €',age:42,ville:'Votre ville',prenom:'',nom:''};
  let profile=fallback;
  try{profile={...fallback,...JSON.parse(sessionStorage.getItem('alterEcoStudyProfile')||'{}')};}catch(e){}
  if(new URLSearchParams(window.location.search).get('demo')==='studyz'){
    profile={...fallback,statut:'Salarié',famille:'En couple',objectifs:["Investir dans l'immobilier",'Valoriser mon épargne','Préparer ma retraite'],impot:6250,impotLabel:'5 000 – 7 500 €',mensuel:500,mensuelLabel:'500–1 000 €',epargne:40000,epargneLabel:'30 000–50 000 €',age:36,ville:'Bordeaux',codePostal:'33000',prenom:'Alex',nom:'Martin'};
  }
  profile.objectifs=Array.isArray(profile.objectifs)&&profile.objectifs.length?profile.objectifs:fallback.objectifs;

  const study=AlterEcoEngine.buildStudy(profile);
  const money=n=>new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(n);
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  const SOLUTION_ICON={'assurance-vie':'diversification','per':'roundSavings','pea':'equities','immobilier':'rental','scpi':'scpi','studyz':'studentHousing','protection':'protection'};
  // Grandes illustrations réservées à la piste recommandée et à sa fiche.
  const FEATURED_IMAGE={
    'assurance-vie':'assets/Assurance-vie multisupport.png',
    immobilier:'assets/Immobilier locatif.png',
    scpi:'assets/SCPI.png',
    protection:'assets/Prévoyance.png',
    per:'assets/per-illustration.webp'
  };
  const featuredImage=solution=>FEATURED_IMAGE[solution.id]||solution.image||solution.illustration;
  const PREMIUM_ICON={
    complete:'assets/result-ui-kit-v1/status-complete-gold.png',
    roundProtection:'assets/ui/Bouton_bouclier.png',
    roundGrowth:'assets/ui/Bouton_graph.png',
    roundSavings:'assets/ui/Bouton_tirelire.png',
    glanceHorizon:'assets/icone profil/Horizon.png',
    glanceCapital:'assets/icone profil/Coffre.png',
    glanceBalance:'assets/icone profil/Balance.png',
    glanceSecurity:'assets/icone profil/Sécurisé.png',
    glanceTax:'assets/icone profil/Impots.png',
    glanceRoutes:'assets/icone profil/Diversification.png',
    glanceProgress:'assets/icone profil/classement.png',
    glanceExplore:'assets/icone profil/telescope.png',
    glanceAllocation:'assets/icone profil/Autre.png',
    birth:'assets/site-icons/Calendrier.png',
    tax:'assets/icone profil/Impots.png',
    capital:'assets/site-icons/Coffre_fort.png',
    monthly:'assets/result-semantic-v1/capacity-wallet.png',
    outlook:'assets/icone profil/telescope.png',
    progress:'assets/icone profil/classement.png',
    routes:'assets/icone profil/Diversification.png',
    portfolio:'assets/site-icons/Dossier.png',
    review:'assets/site-icons/Fichier_Loupe.png',
    family:'assets/situation-union-default.png',
    profession:'assets/csp-employee-default.png',
    balance:'assets/result-semantic-v1/profile-balance.png',
    security:'assets/result-semantic-v1/security-lock.png',
    performance:'assets/result-semantic-v1/performance-target.png',
    horizon:'assets/result-semantic-v1/horizon-calendar.png',
    savings:'assets/result-semantic-v1/savings-capacity.png',
    diversification:'assets/result-semantic-v1/diversification.png',
    retirement:'assets/result-semantic-v1/solution-per.png',
    equities:'assets/result-semantic-v1/solution-pea.png',
    rental:'assets/result-semantic-v1/solution-rental.png',
    scpi:'assets/result-semantic-v1/solution-scpi.png',
    impact:'assets/result-semantic-v1/impact-education.png',
    protection:'assets/result-semantic-v1/solution-protection.png',
    studentHousing:'assets/result-semantic-v1/studyz-demand.png',
    management:'assets/result-semantic-v1/studyz-management.png',
    studentImpact:'assets/result-semantic-v1/studyz-impact.png',
    location:'assets/result-semantic-v1/location-france.png',
    priority:'assets/result-semantic-v1/priority.png',
    capacity:'assets/result-semantic-v1/capacity-wallet.png',
    analysis:'assets/result-semantic-v1/personal-analysis.png',
    advisor:'assets/result-semantic-v1/advisor-support.png'
  };
  const dots=score=>`<span class="shell-dots" aria-label="Potentiel ${score} sur 4">${[1,2,3,4].map(i=>`<i class="${i<=score?'on':''}"></i>`).join('')}</span>`;
  const iconBadge=(name,dark)=>`<span class="shell-icon-badge${dark?' on-dark':''}">${AppShell.icon(name,22)}</span>`;
  const premiumBadge=(name,label='')=>`<span class="premium-icon-badge"><img src="${PREMIUM_ICON[name]||PREMIUM_ICON.balance}" alt="${esc(label)}" loading="lazy"></span>`;
  const featuredSolution=()=>study.featured?.partner
    ? study.featured
    : (study.featured?.id==='pea' ? (study.solutions.find(solution=>solution.id!=='pea')||study.featured) : study.featured);

  function potentialBadges(){
    const p=study.profile, goals=p.objectifs, badges=[];
    const add=(icon,label)=>{if(!badges.some(b=>b[0]===icon)) badges.push([icon,label]);};
    const mapping={
      'Protéger ma famille':['glanceSecurity','Protéger vos proches'],
      'Protéger mon activité':['glanceSecurity','Protéger votre activité'],
      'Anticiper ma transmission':['glanceCapital','Transmission à préparer'],
      'Réduire mon imposition':['glanceTax','Fiscalité à optimiser'],
      'Préparer ma retraite':['glanceHorizon','Retraite à préparer'],
      "Investir dans l'immobilier":['glanceBalance','Projet immobilier'],
      'Valoriser mon épargne':['glanceProgress','Épargne à valoriser']
    };
    goals.forEach(goal=>{if(mapping[goal]) add(...mapping[goal]);});
    if(goals.some(g=>/autre/i.test(g))) add('glanceExplore','Projets à préciser');
    if(p.epargne>=50000) add('glanceAllocation','Répartition à étudier');
    else if(p.epargne>=10000) add('glanceCapital','Capital disponible');
    if(goals.length>1) add('glanceRoutes','Pistes complémentaires');
    if(badges.length<3) add('glanceProgress',p.mensuel>=100?'Épargne régulière':'Épargne à développer');
    if(badges.length<3) add('glanceExplore','Pistes à explorer');
    if(badges.length<3) add('glanceCapital','Patrimoine à construire');
    return badges.slice(0,4);
  }

  const SHORT_BENEFITS={
    'assurance-vie':'Une épargne à organiser et diversifier.',
    per:'Préparer demain, étudier votre fiscalité.',
    pea:'Investir en actions sur la durée.',
    immobilier:'Un bien pour construire votre patrimoine.',
    studyz:'Explorer l’immobilier étudiant.',
    scpi:'L’immobilier, sans gestion locative directe.',
    protection:'Protéger vos proches et votre activité.'
  };
  function investorTitle(){
    const goals=profile.objectifs;
    if(goals.includes('Anticiper ma transmission')) return 'Artisan de la transmission';
    if(goals.includes('Protéger ma famille')||goals.includes('Protéger mon activité')) return 'Gardien de l’essentiel';
    if(goals.length>=3) return 'Architecte de projets';
    if(goals.includes('Préparer ma retraite')||goals.includes("Investir dans l'immobilier")) return 'Bâtisseur d’avenir';
    return 'Éclaireur patrimonial';
  }

  function bannerHead(eyebrow, titleHtml, lead, photo){
    return `<div class="tv-banner">
      <img src="${esc(photo||'assets/hero-banner-walter.webp')}" alt="" loading="eager">
      <div class="tv-banner-shade"></div>
      <div class="tv-banner-copy">
        <span class="tv-eyebrow on-dark">${esc(eyebrow)}</span>
        <h1>${titleHtml}</h1>
        <p>${esc(lead)}</p>
      </div>
    </div>`;
  }

  function profileFacts(){
    const facts=[
      ['user', profile.prenom ? esc(profile.prenom) : esc(profile.statut)],
      ['coins', `${money(profile.epargne)} disponibles`],
      ['chart', `${money(profile.mensuel)} / mois`],
      ['target', esc(profile.objectifs[0]||'Projet à définir')]
    ];
    return `<div class="prospect-strip">${facts.map(([icon,label])=>`<div>${iconBadge(icon)}<span>${label}</span></div>`).join('')}</div>`;
  }

  function solutionCard(s, withPhoto){
    const icon=SOLUTION_ICON[s.id]||'diversification';
    return `<article class="pcard reveal">
      ${withPhoto?`<div class="pcard-media"><img src="${esc(s.image||s.illustration||'')}" alt="" loading="lazy"></div>`:`<div class="solution-vignette">${premiumBadge(icon,s.name)}</div>`}
      <div class="pcard-head"><span class="pcard-type">${esc(s.type)}</span>${s.score>=4&&s.id!=='pea'?'<span class="shell-badge-star">'+AppShell.icon('star',12)+' Fort</span>':''}</div>
      <h3>${esc(s.name)}</h3>
      <p>${esc(SHORT_BENEFITS[s.id]||s.benefit)}</p>
      <div class="pcard-foot"><span>Potentiel</span>${dots(s.score)}<button type="button" class="pcard-chevron solution-open" data-solution="${esc(s.id)}" aria-label="Voir le détail — ${esc(s.name)}">${AppShell.icon('chevron',18)}</button></div>
    </article>`;
  }

  function renderPotentiel(){
    const badges=potentialBadges();
    const drivers=[
      ...(Number(profile.epargne)>=10000?[['capital',profile.epargneLabel||money(profile.epargne),'Épargne totale']]:[]),
      ...(Number(profile.mensuel)>=100?[['monthly',profile.mensuelLabel||money(profile.mensuel),'Effort d’épargne mensuel']]:[]),
      ...(Number(profile.impot)>=2500?[['tax',profile.impotLabel||money(profile.impot),'Imposition annuelle']]:[]),
      ['birth',`${study.horizon} ans`,'Horizon étudié']
    ];
    return `<section class="tabview" data-view="potentiel">
      ${bannerHead('Votre potentiel','Un potentiel d’investissement<br>à la hauteur de vos <em>objectifs</em>','Nous avons analysé votre profil, vos critères et votre situation. Voici le potentiel d’investissement qui s’offre à vous.','assets/study-hero-synthese-v2.png')}
      <div class="card profile-glance tv-overlap">
        <div class="glance-copy">
          <span class="tv-eyebrow small">Votre profil en un coup d’œil</span>
          <h2>Un profil ${esc(study.investorProfile.label.toLowerCase())}${badges[2][1].includes('solide')?' et ambitieux':''}</h2>
          <p>Vous recherchez ${study.investorProfile.appetite==='FAIBLE'?'la sécurité avant tout':study.investorProfile.appetite==='ÉLEVÉE'?'un rendement soutenu, avec une part de risque acceptée':'un équilibre entre rendement, sécurité et disponibilité'}, sur un horizon d’environ ${study.horizon} ans.</p>
          <div class="badge-row">${badges.map(([icon,label])=>`<div class="mini-badge">${premiumBadge(icon,label)}<span>${esc(label)}</span></div>`).join('')}</div>
        </div>
      </div>
      <div class="tv-row">
        <div class="tv-col">
          <span class="tv-eyebrow small">Votre capacité d’investissement</span>
          <h2>Une capacité financière de ${money(study.capacity.low)} à ${money(study.capacity.high)}</h2>
          <p>En fonction de votre épargne, de votre effort mensuel et de votre horizon, cette enveloppe vous permet d’envisager des solutions diversifiées et adaptées.</p>
        </div>
        <div class="card capacity-card capacity-drivers">
          <span class="tv-eyebrow small">Ce qui alimente ce potentiel</span>
          <div class="capacity-facts">${drivers.map(([icon,value,label])=>`<span>${premiumBadge(icon,label)}<span><b>${esc(value)}</b>${esc(label)}</span></span>`).join('')}</div>
          <div class="glance-gauge">
            <div class="glance-gauge-art potential-meter" style="--score:${study.potentialScore};--needle-angle:${135+Math.max(0,Math.min(100,study.potentialScore))*2.7}deg" aria-label="Score de potentiel : ${study.potentialScore} sur 100"><span></span></div>
            <div class="glance-gauge-value"><strong>${study.potentialScore}</strong><small>/100</small></div>
            <span class="tv-eyebrow small">Score de potentiel</span>
          </div>
        </div>
      </div>
      <button type="button" class="tv-link capacity-follow-link" data-nav-hash="pistes">Voir le détail de vos pistes ${AppShell.icon('chevron',14)}</button>
      <div class="next-study-step"><div>${premiumBadge('review','Prochaine étape')}<span><small>Prochaine étape</small><strong>Découvrir vos pistes personnalisées</strong></span></div><button type="button" class="cta-gold" data-nav-hash="pistes">Continuer ${AppShell.icon('chevron',16)}</button></div>
    </section>`;
  }

  function featuredCard(f){
    if(!f) return '';
    const isPartner=!!f.partner;
    const matchedGoals=profile.objectifs.filter(goal=>(f.goals||[]).includes(goal));
    return `<div class="hero-piste${isPartner?' is-partner':''}">
      <div class="hero-piste-body">
        <span class="shell-badge-star">${premiumBadge('priority')} ${isPartner?'Piste prioritaire':'Piste recommandée'}</span>
        <span class="tv-eyebrow small">${esc(f.type)}</span>
        <h2>${esc(f.name)}</h2>
        <p class="hero-piste-lead">${isPartner?'Un investissement immobilier concret et durable, au cœur des villes étudiantes.':esc(f.benefit)}</p>
        <button type="button" class="cta-gold solution-open" data-solution="${esc(f.id)}">Voir le détail de cette piste ${AppShell.icon('chevron',16)}</button>
      </div>
      <div class="hero-piste-media"><img src="${esc(featuredImage(f)||'assets/scroll-building-end.png')}" alt="" loading="lazy">${isPartner?`<span>${premiumBadge('location','Présence en France')} Plusieurs villes en France</span>`:''}</div>
    </div>`;
  }

  function renderPistes(){
    const featured=featuredSolution();
    const others=study.solutions.filter(s=>!featured||s.id!==featured.id).sort((a,b)=>(a.id==='pea')-(b.id==='pea')).slice(0,4);
    return `<section class="tabview" data-view="pistes">
      ${bannerHead('Vos résultats','Voici la piste la plus<br>adaptée<br>à votre <em>profil</em>','Après avoir analysé vos objectifs, votre situation et vos préférences, nous avons identifié une opportunité qui correspond pleinement à vos attentes.','assets/study-hero-horizon-v1.png')}
      <div class="tv-overlap">${featuredCard(featured)}</div>
      <div class="tv-col-main" style="margin-top:36px">
        <span class="tv-eyebrow small">Autres pistes</span>
        <h2>D’autres opportunités à explorer</h2>
        <p>Selon votre profil, ces pistes peuvent également représenter un intérêt.</p>
        <div class="pcard-grid">${others.map(s=>solutionCard(s,false)).join('')}</div>
      </div>
      <div class="card advisor-note">${premiumBadge('advisor','Conseil personnalisé')}<div><span class="tv-eyebrow small">Notre conseil</span><p>${featured&&featured.partner?'La piste Studyz présente aujourd’hui le meilleur équilibre entre potentiel, simplicité de gestion et impact, selon votre profil.':'Commencez par approfondir la piste prioritaire, puis comparez-la aux autres solutions adaptées à votre profil.'}</p></div>${AppShell.icon('chevron',18)}</div>
      <div class="next-study-step"><div>${premiumBadge('portfolio','')}<span><small>Prochaine étape</small><strong>Découvrir votre synthèse personnalisée</strong></span></div><button type="button" class="cta-gold" data-nav-hash="synthese">Continuer ${AppShell.icon('chevron',16)}</button></div>
    </section>`;
  }

  function renderSynthese(){
    const featured=featuredSolution();
    const fiscalGoal=study.profile.objectifs.includes('Réduire mon imposition');
    const recapFacts=[
      ['Capital disponible',money(profile.epargne)],
      ['Effort mensuel',money(profile.mensuel)],
      fiscalGoal?['Imposition annuelle',profile.impotLabel||money(profile.impot)]:['Horizon étudié',`${study.horizon} ans`]
    ];
    const planSteps=[
      ['Valider votre profil et vos objectifs', true, `Vos priorités — ${profile.objectifs.slice(0,2).map(esc).join(' et ')} — structurent désormais votre étude.`],
      ['Explorer les pistes d’investissement', true, `${study.solutions.length} solutions compatibles ont été comparées selon votre situation et votre capacité.`],
      ['Découvrir la solution recommandée', true, `${esc(featured?.name||'Votre piste prioritaire')} ressort comme la première piste à approfondir, sous réserve de validation.`],
      ['Passer à l’action', false, 'Échangez avec un conseiller pour vérifier les hypothèses, préciser votre projet et définir les actions adaptées.']
    ];
    const fullName=[profile.prenom,profile.nom].filter(Boolean).map(esc).join(' ');
    const identity=`<span class="identity-first">${esc(profile.prenom||'Prénom')}</span> <span class="identity-last">${esc(profile.nom||'Nom')}</span>`;
    const location=[profile.codePostal,profile.ville].filter(Boolean).map(esc).join(' ');
    const profileItems=[
      ['family','Situation familiale',esc(profile.famille||'Non renseignée')],
      ['profession','CSP',esc(profile.statut||'Non renseignée')],
      ['location','Résidence',location||'Non renseignée'],
      ['tax','Fiscalité annuelle',esc(profile.impotLabel||money(profile.impot))],
      ['capital','Épargne disponible',money(profile.epargne)],
      ['monthly','Effort mensuel',money(profile.mensuel)]
    ];
    return `<section class="tabview" data-view="synthese">
      ${bannerHead('Votre synthèse','Des <em>pistes</em> alignées<br>avec<br>votre <em>potentiel</em>','Voici la synthèse de votre analyse personnalisée : votre profil, votre capacité d’investissement et la solution la plus adaptée à votre situation.','assets/study-hero-pistes-v2.png')}
      <div class="synthesis-journey tv-overlap">
        <div class="synthesis-profile-main">
          <span class="synthesis-section-index">01</span>
          <span class="tv-eyebrow small">Synthèse de votre parcours</span>
          <h2 class="synthesis-section-title">Profil</h2>
          <div class="identity-profile-row"><p class="synthesis-identity">${identity}</p>
          <div class="synthesis-profile-result"><span>Profil de l’investisseur</span><b>${esc(investorTitle())}</b></div></div>
          <div class="synthesis-profile-facts">${profileItems.map(([icon,label,value])=>`<div>${premiumBadge(icon,label)}<span><small>${label}</small><b>${value}</b></span></div>`).join('')}</div>
          <div class="synthesis-objectives"><small>Vos objectifs prioritaires</small><div>${profile.objectifs.map(goal=>`<span>${esc(goal)}</span>`).join('')}</div></div>
        </div>
        <div class="synthesis-capacity">
          <span class="synthesis-section-index">02</span>
          <span class="tv-eyebrow small">Synthèse de votre parcours</span>
          <h2 class="synthesis-section-title">Potentiel</h2>
          <div class="synthesis-potential-line"><h2 class="synthesis-score" aria-label="Indicateur de potentiel : ${study.potentialScore} pour cent">${study.potentialScore}<small>%</small></h2><p>${money(study.capacity.low)} – ${money(study.capacity.high)} mobilisables</p></div>
          <p class="synthesis-potential-copy">Ce potentiel tient compte de votre épargne disponible, de votre effort mensuel et d’un horizon d’environ ${study.horizon} ans.</p>
          <div class="synthesis-potential-facts">${recapFacts.map(([label,value])=>`<span><small>${esc(label)}</small><b>${esc(value)}</b></span>`).join('')}</div>
        </div>
      </div>
      ${featured?`<div class="synthesis-featured">${featuredCard(featured)}</div>`:''}
      <div class="analysis-email"><button type="button" class="cta-gold" data-email-analysis>Recevoir mon analyse par mail</button><p>Votre étude, à conserver pour la suite.</p></div>
      <div class="tv-col-main" style="margin-top:22px">
        <span class="tv-eyebrow small">Votre plan d’action</span>
        <h2>Les prochaines étapes</h2>
        <p class="plan-stepper-intro">Touchez une étape pour afficher son détail.</p>
        <div class="plan-stepper">${planSteps.map(([label,done,detail],i)=>`<details class="plan-step ${done?'is-done':'is-current'}"><summary><span class="plan-step-dot"><i>${done?AppShell.icon('check',14):i+1}</i></span><span><b>${i+1}. ${esc(label)}</b><small>${done?'Terminé':'À venir'}</small></span><i class="plan-step-toggle" aria-hidden="true"><img class="step-expand" src="assets/site-icons/Plus.png" alt=""><img class="step-collapse" src="assets/site-icons/Moins.png" alt=""></i></summary><div class="plan-step-detail"><p>${detail}</p></div></details>`).join('')}</div>
      </div>
      <div class="card impact-note">${premiumBadge('complete','')}<div><h3>Un investissement qui a du sens</h3><p>${featured&&featured.partner?'Avec Studyz, vous associez votre projet patrimonial à l’accès au logement et à la réussite des étudiants.':'Votre piste prioritaire associe votre projet patrimonial à une approche durable et concrète.'}</p></div></div>
      ${featured&&featured.partner?`<div class="card contact-card" style="margin-top:20px"><span class="tv-eyebrow small">Une question sur Stüdyz ?</span><p>Un conseiller est à votre disposition pour approfondir cette solution et répondre à vos questions.</p><a class="cta-gold" href="mailto:conseil@mon-alter-eco.fr">Contacter mon conseiller ${AppShell.icon('chevron',16)}</a></div>`:''}
    </section>`;
  }

  const RENDERERS={potentiel:renderPotentiel, pistes:renderPistes, synthese:renderSynthese};
  const main=document.getElementById('study');

  function currentTab(){
    const h=(location.hash||'').replace('#','');
    return RENDERERS[h] ? h : 'potentiel';
  }

  function paint(){
    const tab=currentTab();
    main.innerHTML=RENDERERS[tab]();
    AppShell.render({current:tab, unlocked:true, initials:(profile.prenom||profile.nom||profile.statut||'AE').slice(0,2)});
    const resultAvatar=document.querySelector('#app-topbar .shell-avatar img');
    if(resultAvatar){
      resultAvatar.src=tab==='potentiel'?'assets/ui/Genie_loupe.PNG':tab==='synthese'?'assets/genie/genie_valide.png':'assets/walter-result-avatar.png';
      resultAvatar.parentElement.classList.add('shell-avatar--result');
    }
    requestAnimationFrame(()=>main.querySelectorAll('.reveal').forEach(el=>el.classList.add('visible')));
    wireDrawerButtons();
    main.querySelector('[data-email-analysis]')?.addEventListener('click',()=>{
      const dialog=document.getElementById('analysis-email-dialog');
      if(dialog) dialog.showModal();
    });
    main.querySelectorAll('[data-nav-hash]').forEach(btn=>btn.addEventListener('click',()=>{location.hash=btn.dataset.navHash;}));
  }

  const drawer=document.getElementById('solution-drawer');
  const cityPhotos=[['Saint-Étienne','Saint-Etienne'],['Rochefort','Rochefort'],['Toulouse – Quint','Quint'],['Tarbes','Tarbes']];
  let selectedCity=-1;
  let baseCityImage='';
  const cityPicker=document.createElement('div');
  cityPicker.className='drawer-city-picker';
  cityPicker.hidden=true;
  cityPicker.innerHTML=`<label for="study-city">Découvrez les villes proposées</label><select id="study-city"><option value="-1">Choisir une ville</option>${cityPhotos.map(([label],i)=>`<option value="${i}">${esc(label)}</option>`).join('')}</select><small>Illustrations non contractuelles. Disponibilité des programmes à confirmer.</small>`;
  document.getElementById('drawer-benefit').before(cityPicker);
  function showCityPhoto(){
    if(selectedCity===-1){document.getElementById('drawer-illustration').src=baseCityImage;document.getElementById('drawer-illustration').alt='Présentation de la résidence';return;}
    const [label,file]=cityPhotos[selectedCity];
    document.getElementById('drawer-illustration').src=encodeURI(`assets/studyz/photos/${file}.png`);
    document.getElementById('drawer-illustration').alt=`Illustration d’ambiance : ${label}`;
  }
  cityPicker.querySelector('select').addEventListener('change',event=>{
    selectedCity=Number(event.target.value);
    if(selectedCity===-1||cityPhotos[selectedCity])showCityPhoto();
  });
  const benefits=document.createElement('section');
  benefits.className='drawer-benefits';
  benefits.hidden=true;
  benefits.innerHTML=`<h3>Les atouts de cette solution</h3><div>${[
    ['glanceProgress','Un projet accessible','De petites surfaces pour construire votre projet, selon votre budget et le financement.'],
    ['glanceSecurity','Gestion et garanties','Un accompagnement locatif et des couvertures selon le contrat retenu.'],
    ['tax','Des leviers fiscaux','TVA récupérable et fiscalité des revenus à étudier, sous conditions.']
  ].map(([icon,title,copy])=>`<article>${premiumBadge(icon,'')}<h4>${title}</h4><p>${copy}</p></article>`).join('')}</div>`;
  drawer.querySelector('.drawer-grid').before(benefits);
  const riskDetails=document.createElement('details');
  riskDetails.className='drawer-risk-details';
  riskDetails.hidden=true;
  riskDetails.innerHTML='<summary>Conditions et risques à connaître</summary><p></p>';
  drawer.querySelector('.drawer-grid').after(riskDetails);
  const closeDrawer=()=>{drawer.classList.remove('open');drawer.setAttribute('aria-hidden','true');document.body.classList.remove('drawer-open')};
  function openDrawer(id){
    const solution=study.solutions.find(item=>item.id===id) || (study.featured&&study.featured.id===id?study.featured:null);
    if(!solution) return;
    document.getElementById('drawer-type').textContent=solution.type;
    document.getElementById('drawer-title').textContent=solution.name;
    document.getElementById('drawer-benefit').textContent=solution.benefit;
    const goals=study.profile.objectifs.filter(goal=>(solution.goals||[]).includes(goal)).slice(0,3);
    document.getElementById('drawer-reasons').innerHTML=goals.map(goal=>`<span class="drawer-goal">${esc(goal)}</span>`).join('');
    document.getElementById('drawer-conditions').innerHTML=solution.conditions.map(item=>`<li>${esc(item)}</li>`).join('');
    document.getElementById('drawer-vigilance').textContent=solution.vigilance;
    const isStudyz=solution.id==='studyz';
    drawer.classList.toggle('is-studyz',isStudyz);
    benefits.hidden=!isStudyz;
    riskDetails.hidden=!isStudyz;
    riskDetails.open=false;
    riskDetails.querySelector('p').textContent=solution.vigilance;
    drawer.querySelector('.drawer-alert').hidden=isStudyz;
    drawer.querySelector('.drawer-grid').classList.toggle('single-column',isStudyz);
    const source=document.getElementById('drawer-source');source.hidden=!solution.sourceUrl;source.href=solution.sourceUrl||'#';
    document.getElementById('drawer-symbol').innerHTML=`<img src="${PREMIUM_ICON[SOLUTION_ICON[solution.id]]||PREMIUM_ICON.diversification}" alt="">`;
    document.getElementById('drawer-index').textContent=String(study.solutions.findIndex(s=>s.id===solution.id)+1).padStart(2,'0');
    const illustration=document.getElementById('drawer-illustration');
    const img=solution.id===featuredSolution()?.id?featuredImage(solution):null;
    if(img) illustration.src=img; else illustration.removeAttribute('src');
    cityPicker.hidden=solution.id!=='studyz';
    illustration.alt='';
    if(isStudyz){baseCityImage=img;selectedCity=-1;cityPicker.querySelector('select').value='-1';showCityPhoto();}
    document.getElementById('drawer-visual').classList.toggle('has-illustration',Boolean(img));
    drawer.classList.add('open');drawer.setAttribute('aria-hidden','false');document.body.classList.add('drawer-open');drawer.querySelector('.drawer-close').focus();
  }
  function wireDrawerButtons(){
    main.querySelectorAll('.solution-open').forEach(button=>button.addEventListener('click',()=>openDrawer(button.dataset.solution)));
  }
  drawer.querySelector('.drawer-close').addEventListener('click',closeDrawer);
  drawer.addEventListener('click',event=>{if(event.target===drawer)closeDrawer()});
  addEventListener('keydown',event=>{if(event.key==='Escape'&&drawer.classList.contains('open'))closeDrawer()});

  addEventListener('hashchange',()=>{
    paint();
    window.scrollTo({top:0,left:0,behavior:'instant'});
    document.getElementById('app-tabbar')?.classList.remove('results-bar-hidden');
  });
  let previousScrollY=window.scrollY||0;
  addEventListener('scroll',()=>{
    const y=Math.max(0,window.scrollY||0),bar=document.getElementById('app-tabbar');
    if(Math.abs(y-previousScrollY)<5&&y>20)return;
    if(bar)bar.classList.toggle('results-bar-hidden',y>previousScrollY&&y>80);
    previousScrollY=y;
  },{passive:true});
  paint();
})();
