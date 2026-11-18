/* Socle commun ; Stüdyz reste une solution du catalogue. */
(function(){
  const fallback={civilite:'',statut:'Salarié',famille:'Marié(e)',objectifs:['Préparer ma retraite','Valoriser mon épargne'],impot:5000,impotLabel:'5 000 – 7 500 €',mensuel:350,mensuelLabel:'200–500 €',epargne:40000,epargneLabel:'30 000–50 000 €',age:42,ville:'Votre ville',prenom:'',nom:''};
  let profile=fallback;
  try{profile={...fallback,...JSON.parse(sessionStorage.getItem('alterEcoStudyProfile')||'{}')};}catch(e){}
  if(new URLSearchParams(window.location.search).get('demo')==='studyz'){
    profile={...fallback,statut:'Salarié',famille:'En couple',objectifs:["Investir dans l'immobilier",'Valoriser mon épargne','Préparer ma retraite'],impot:6250,impotLabel:'5 000 – 7 500 €',mensuel:500,mensuelLabel:'500–1 000 €',epargne:40000,epargneLabel:'30 000–50 000 €',age:36,ville:'Bordeaux',codePostal:'33000',prenom:'Alex',nom:'Martin'};
  }
  if(new URLSearchParams(window.location.search).get('demo')==='simulators'){
    profile={...fallback,statut:'Salarié',famille:'Marié(e)',objectifs:['Réduire mon imposition',"Investir dans l'immobilier"],impot:6250,impotLabel:'5 000 – 7 500 €',mensuel:500,mensuelLabel:'500–1 000 €',epargne:40000,epargneLabel:'30 000–50 000 €',age:42,ville:'Bordeaux',codePostal:'33000',prenom:'Alex',nom:'Martin'};
  }
  profile.objectifs=Array.isArray(profile.objectifs)&&profile.objectifs.length?profile.objectifs:fallback.objectifs;

  const study=AlterEcoEngine.buildStudy(profile);
  const money=n=>new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(n);
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  const SOLUTION_ICON={'assurance-vie':'diversification','per':'roundSavings','pea':'equities','immobilier':'rental','scpi':'scpi','studyz':'studentHousing','protection':'protection','girardin':'solutionGirardin','denormandie':'solutionDenormandie'};
  // Grandes illustrations réservées à la piste recommandée et à sa fiche.
  const FEATURED_IMAGE={
    'assurance-vie':'assets/Assurance-vie multisupport.png',
    immobilier:'assets/Immobilier locatif.png',
    scpi:'assets/SCPI.png',
    protection:'assets/Prévoyance.png',
    per:'assets/per-illustration.webp',
    pea:'assets/Plan_epargne_ actions.png'
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
    solutionGirardin:'assets/result-semantic-v1/solution-girardin.png',
    solutionDenormandie:'assets/result-semantic-v1/solution-denormandie.png',
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
  const featuredSolution=()=>{
    if(study.featured?.partner)return study.featured;
    if(study.featured?.complementary)return study.solutions.find(solution=>!solution.complementary)||null;
    return study.featured?.id==='pea'
      ? (study.solutions.find(solution=>solution.id!=='pea'&&!solution.complementary)||study.featured)
      : study.featured;
  };

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
    protection:'Protéger vos proches et votre activité.',
    girardin:'Une réduction d’impôt liée à l’outre-mer, à étudier.',
    denormandie:'L’ancien rénové, avec réduction d’impôt sous conditions.'
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
    if(!f) return `<div class="hero-piste hero-piste-empty"><div class="hero-piste-body"><span class="tv-eyebrow small">Analyse terminée</span><h2>Vos options sont détaillées plus bas</h2><p>Aucune piste patrimoniale générale ne ressort comme prioritaire. Retrouvez les solutions compatibles avec vos objectifs dans les autres pistes.</p><a class="cta-gold" href="#autres-solutions">Voir les autres pistes ${AppShell.icon('chevron',16)}</a></div><div class="hero-piste-media"><img src="assets/study-hero-pistes-v2.png" alt="" loading="lazy"></div></div>`;
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
      <div class="hero-piste-media"><img src="${esc(featuredImage(f)||'assets/study-hero-pistes-v2.png')}" alt="" loading="lazy">${isPartner?`<span>${premiumBadge('location','Présence en France')} Plusieurs villes en France</span>`:''}</div>
    </div>`;
  }

  function renderPistes(){
    const featured=featuredSolution();
    const rankByPotential=(a,b)=>b.score-a.score
      ||Number(!!a.complementary)-Number(!!b.complementary)
      ||Number(a.id==='pea')-Number(b.id==='pea');
    const rest=study.solutions.filter(s=>!featured||s.id!==featured.id).sort(rankByPotential);
    const others=[
      ...rest.filter(s=>!s.complementary).slice(0,4),
      ...rest.filter(s=>s.complementary)
    ].sort(rankByPotential);
    return `<section class="tabview" data-view="pistes">
      ${bannerHead('Vos résultats','Voici la piste la plus<br>adaptée<br>à votre <em>profil</em>','Après avoir analysé vos objectifs, votre situation et vos préférences, nous avons identifié une opportunité qui correspond pleinement à vos attentes.','assets/study-hero-horizon-v1.png')}
      <div class="tv-overlap">${featuredCard(featured)}</div>
      <div class="tv-col-main" style="margin-top:36px">
        <span class="tv-eyebrow small">Autres pistes</span>
        <h2>D’autres opportunités à explorer</h2>
        <p>Selon votre profil, ces pistes peuvent également représenter un intérêt.</p>
        <div class="pcard-grid" id="autres-solutions">${others.map(s=>solutionCard(s,false)).join('')}</div>
      </div>
      <div class="card advisor-note">${premiumBadge('advisor','Conseil personnalisé')}<div><span class="tv-eyebrow small">Notre conseil</span><p>${featured&&featured.partner?'La piste Studyz présente aujourd’hui le meilleur équilibre entre potentiel, simplicité de gestion et impact, selon votre profil.':featured?'Commencez par approfondir la piste prioritaire, puis comparez-la aux autres solutions adaptées à votre profil.':'Les autres pistes présentées correspondent à vos objectifs ; vérifiez leurs conditions avant de poursuivre.'}</p></div>${AppShell.icon('chevron',18)}</div>
      <div class="next-study-step"><div>${premiumBadge('portfolio','')}<span><small>Prochaine étape</small><strong>Découvrir votre synthèse personnalisée</strong></span></div><button type="button" class="cta-gold" data-nav-hash="synthese">Continuer ${AppShell.icon('chevron',16)}</button></div>
    </section>`;
  }

  function loadSimulatorInputs(id){
    try{return JSON.parse(sessionStorage.getItem(`alterEcoSimulator:${id}`)||'{}')||{};}catch(e){return {};}
  }
  const positiveNumber=value=>{
    const number=Number(value);
    return Number.isFinite(number)&&number>0?number:0;
  };
  const simulatorField=(id,label,value,help='',step=100)=>`<label class="sim-field" for="${id}"><span>${label}</span><input id="${id}" name="${id}" type="number" min="0" step="${step}" inputmode="decimal" value="${esc(value||'')}" data-sim-field="${id}">${help?`<small>${help}</small>`:''}</label>`;
  const simulatorBack=()=>`<button type="button" class="sim-back" data-nav-hash="pistes">${AppShell.icon('chevron',16)} Retour à mes solutions</button>`;
  const simulatorSources=links=>`<div class="sim-sources"><span>Sources officielles</span>${links.map(([label,url])=>`<a href="${url}" target="_blank" rel="noopener">${label} ${AppShell.icon('chevron',13)}</a>`).join('')}</div>`;

  function renderGirardin(){
    const saved=loadSimulatorInputs('girardin');
    return `<section class="tabview simulator-view" data-view="simulation-girardin">
      ${bannerHead('Simulateur Girardin industriel','Évaluez une <em>proposition</em> Girardin','Comparez le montant souscrit à la réduction d’impôt annoncée par l’opérateur. Les chiffres de l’offre sont indispensables : le taux dépend du projet et du montage.','assets/study-hero-horizon-v1.png')}
      ${simulatorBack()}
      <div class="simulator-layout">
        <form class="card simulator-form" data-simulator-form="girardin" novalidate>
          <span class="tv-eyebrow small">Votre proposition</span>
          <h2>Les montants annoncés</h2>
          <p>Recopiez les montants indiqués dans le dossier de l’opérateur. Le résultat ne suppose aucun taux forfaitaire.</p>
          ${simulatorField('girardin-contribution','Montant de votre souscription (€)',saved['girardin-contribution'])}
          ${simulatorField('girardin-reduction','Réduction d’impôt annoncée (€)',saved['girardin-reduction'])}
          ${simulatorField('girardin-tax','Votre impôt annuel exact (€) — facultatif',saved['girardin-tax'],'Votre questionnaire indique : '+esc(profile.impotLabel||money(profile.impot)))}
        </form>
        <section class="card simulator-output" aria-live="polite" aria-atomic="true">
          <span class="tv-eyebrow small">Votre simulation</span>
          <h2>Écart fiscal indicatif</h2>
          <p class="sim-result-lead" id="girardin-result-lead">Saisissez la souscription et la réduction annoncée pour afficher la comparaison.</p>
          <div class="sim-metrics" id="girardin-metrics"></div>
          <p class="sim-warning" id="girardin-warning" hidden></p>
          <p class="sim-disclaimer">Cette comparaison reprend les montants de l’offre ; elle ne valide ni l’éligibilité ni la disponibilité de la réduction. Vérifiez le plafond outre-mer, les conditions du montage, l’exploitant et les risques de reprise. Le capital peut être perdu.</p>
        </section>
      </div>
      ${simulatorSources([['Impôts.gouv.fr — investissements productifs outre-mer','https://www.impots.gouv.fr/professionnel/reduction-ou-deduction-au-titre-des-investissements-productifs-neufs'],['BOFiP — article 199 undecies B','https://bofip.impots.gouv.fr/bofip/4720-PGP.html/identifiant=BOI-BIC-RICI-20-10-20240703']])}
    </section>`;
  }

  function renderDenormandie(){
    const saved=loadSimulatorInputs('denormandie');
    return `<section class="tabview simulator-view" data-view="simulation-denormandie">
      ${bannerHead('Simulateur Denormandie','Estimez votre <em>réduction</em> Denormandie','Une première estimation à partir de votre budget travaux, du prix de revient, de la surface et de la durée de location. Calcul selon les taux publiés pour un investissement réalisé en 2026.','assets/study-hero-horizon-v1.png')}
      ${simulatorBack()}
      <div class="simulator-layout">
        <form class="card simulator-form" data-simulator-form="denormandie" novalidate>
          <span class="tv-eyebrow small">Votre projet immobilier</span>
          <h2>Les caractéristiques du logement</h2>
          <p>Renseignez les dépenses éligibles et la surface habitable. Les travaux doivent représenter au moins 25 % du coût total de l’opération.</p>
          ${simulatorField('denormandie-price','Prix de revient hors travaux (€)',saved['denormandie-price'],'Achat et frais retenus dans la base fiscale. Le plafond de 300 000 € peut être partagé avec d’autres investissements concernés.')}
          ${simulatorField('denormandie-works','Travaux éligibles (€)',saved['denormandie-works'],'Travaux facturés par une entreprise.')}
          ${simulatorField('denormandie-area','Surface habitable (m²)',saved['denormandie-area'],'Base retenue plafonnée à 5 500 € par m².','1')}
          <label class="sim-field" for="denormandie-years"><span>Engagement initial de location</span><select id="denormandie-years" name="denormandie-years" data-sim-field="denormandie-years"><option value="6" ${saved['denormandie-years']!=='9'?'selected':''}>6 ans</option><option value="9" ${saved['denormandie-years']==='9'?'selected':''}>9 ans</option></select></label>
          <label class="sim-field" for="denormandie-territory"><span>Lieu du logement</span><select id="denormandie-territory" name="denormandie-territory" data-sim-field="denormandie-territory"><option value="metropole" ${saved['denormandie-territory']!=='outremer'?'selected':''}>France métropolitaine</option><option value="outremer" ${saved['denormandie-territory']==='outremer'?'selected':''}>Outre-mer</option></select></label>
          ${simulatorField('denormandie-tax','Votre impôt annuel exact (€) — facultatif',saved['denormandie-tax'],'Votre questionnaire indique : '+esc(profile.impotLabel||money(profile.impot)))}
        </form>
        <section class="card simulator-output" aria-live="polite" aria-atomic="true">
          <span class="tv-eyebrow small">Votre simulation 2026</span>
          <h2>Réduction d’impôt estimée</h2>
          <p class="sim-result-lead" id="denormandie-result-lead">Complétez le prix, les travaux et la surface pour estimer la réduction.</p>
          <div class="sim-metrics" id="denormandie-metrics"></div>
          <p class="sim-warning" id="denormandie-warning" hidden></p>
          <p class="sim-disclaimer">Estimation indicative, sous réserve de la commune éligible, des travaux admissibles, des plafonds de loyers et de ressources, et du respect de toutes les conditions. Le calcul ne tient pas compte des autres avantages fiscaux ni du plafonnement global. La part annuelle qui dépasse votre impôt n’est ni remboursée ni reportée.</p>
        </section>
      </div>
      ${simulatorSources([['Vérifier la commune — Service-Public.fr','https://www.service-public.gouv.fr/simulateur/calcul/Zone-Denormandie'],['Taux et plafonds — BOFiP','https://bofip.impots.gouv.fr/bofip/11940-PGP.html/identifiant=BOI-IR-RICI-365-30-20240328'],['Conditions du dispositif — Service-Public.fr','https://www.service-public.gouv.fr/particuliers/vosdroits/F35011']])}
    </section>`;
  }

  function updateGirardinSimulation(){
    const form=main.querySelector('[data-simulator-form="girardin"]');
    if(!form)return;
    const value=id=>positiveNumber(form.querySelector(`[name="${id}"]`)?.value);
    const contribution=value('girardin-contribution'), reduction=value('girardin-reduction'), tax=value('girardin-tax');
    const lead=main.querySelector('#girardin-result-lead'), metrics=main.querySelector('#girardin-metrics'), warning=main.querySelector('#girardin-warning');
    warning.hidden=true;
    if(!contribution||!reduction){
      lead.textContent='Saisissez la souscription et la réduction annoncée pour afficher la comparaison.';
      metrics.innerHTML='';
      return;
    }
    const difference=reduction-contribution;
    lead.textContent=difference>=0?'Écart nominal entre la réduction annoncée et votre souscription.':'La réduction annoncée est inférieure à votre souscription.';
    metrics.innerHTML=`<div><span>Souscription</span><b>${money(contribution)}</b></div><div><span>Réduction annoncée</span><b>${money(reduction)}</b></div><div class="sim-metric-emphasis"><span>${difference>=0?'Écart nominal indicatif':'Écart nominal'}</span><b>${difference>=0?'+':''}${money(difference)}</b></div>`;
    if(tax&&reduction>tax){
      warning.hidden=false;
      warning.textContent='La réduction annoncée dépasse votre impôt annuel renseigné. Faites confirmer par un professionnel les règles d’imputation, de report et les plafonds applicables à votre situation.';
    }
  }

  function updateDenormandieSimulation(){
    const form=main.querySelector('[data-simulator-form="denormandie"]');
    if(!form)return;
    const value=id=>positiveNumber(form.querySelector(`[name="${id}"]`)?.value);
    const price=value('denormandie-price'), works=value('denormandie-works'), area=value('denormandie-area'), tax=value('denormandie-tax');
    const years=Number(form.querySelector('[name="denormandie-years"]')?.value)===9?9:6;
    const overseas=form.querySelector('[name="denormandie-territory"]')?.value==='outremer';
    const total=price+works, workShare=total?works/total:0;
    const lead=main.querySelector('#denormandie-result-lead'), metrics=main.querySelector('#denormandie-metrics'), warning=main.querySelector('#denormandie-warning');
    warning.hidden=true;
    if(!price||!works||!area){
      lead.textContent='Complétez le prix, les travaux et la surface pour estimer la réduction.';
      metrics.innerHTML='';
      return;
    }
    if(workShare<.25){
      lead.textContent='Le seuil travaux de 25 % du coût total n’est pas atteint : la réduction n’est pas calculée.';
      metrics.innerHTML=`<div><span>Part des travaux dans l’opération</span><b>${new Intl.NumberFormat('fr-FR',{style:'percent',maximumFractionDigits:1}).format(workShare)}</b></div><div><span>Seuil requis</span><b>25 % minimum</b></div>`;
      return;
    }
    const rate=overseas?(years===6?0.23:0.29):(years===6?0.12:0.18);
    const base=Math.min(total,300000,area*5500);
    const totalReduction=base*rate, annualReduction=totalReduction/years;
    const annualApplied=tax?Math.min(tax,annualReduction):null;
    const annualUnused=tax?Math.max(0,annualReduction-tax):null;
    const percent=new Intl.NumberFormat('fr-FR',{style:'percent',maximumFractionDigits:1});
    lead.textContent='Estimation indicative, si les autres critères d’éligibilité sont respectés.';
    metrics.innerHTML=`<div><span>Base retenue après plafonds</span><b>${money(base)}</b></div><div><span>Taux total (${years} ans)</span><b>${percent.format(rate)}</b></div><div class="sim-metric-emphasis"><span>Réduction totale estimée</span><b>${money(totalReduction)}</b></div><div class="sim-metric-emphasis"><span>Réduction annuelle estimée</span><b>${money(annualReduction)} / an</b></div>${tax?`<div><span>Imputable au maximum avant autres avantages</span><b>${money(annualApplied)} / an</b></div>`:''}`;
    if(tax&&annualUnused>0){
      warning.hidden=false;
      warning.textContent=`Environ ${money(annualUnused)} de réduction annuelle dépasserait l’impôt renseigné. Cette fraction ne peut pas être remboursée ni reportée.`;
    }
  }

  function wireSimulatorForm(){
    const form=main.querySelector('[data-simulator-form]');
    if(!form)return;
    const simulator=form.dataset.simulatorForm;
    const update=simulator==='girardin'?updateGirardinSimulation:updateDenormandieSimulation;
    form.addEventListener('input',()=>{
      const values=Object.fromEntries([...form.querySelectorAll('[data-sim-field]')].map(field=>[field.name,field.value]));
      try{sessionStorage.setItem(`alterEcoSimulator:${simulator}`,JSON.stringify(values));}catch(e){}
      update();
    });
    form.addEventListener('change',()=>form.dispatchEvent(new Event('input',{bubbles:true})));
    update();
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
      ['Découvrir la solution recommandée', true, featured?`${esc(featured.name)} ressort comme la première piste à approfondir, sous réserve de validation.`:'Les solutions compatibles avec vos objectifs sont présentées dans vos autres pistes.'],
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
      <div class="card impact-note">${premiumBadge('complete','')}<div><h3>Un investissement qui a du sens</h3><p>${featured&&featured.partner?'Avec Studyz, vous associez votre projet patrimonial à l’accès au logement et à la réussite des étudiants.':featured?'Votre piste prioritaire associe votre projet patrimonial à une approche durable et concrète.':'Consultez les autres pistes pour approfondir les solutions liées à vos objectifs.'}</p></div></div>
      ${featured&&featured.partner?`<div class="card contact-card" style="margin-top:20px"><span class="tv-eyebrow small">Une question sur Stüdyz ?</span><p>Un conseiller est à votre disposition pour approfondir cette solution et répondre à vos questions.</p><a class="cta-gold" href="mailto:conseil@mon-alter-eco.fr">Contacter mon conseiller ${AppShell.icon('chevron',16)}</a></div>`:''}
    </section>`;
  }

  const RENDERERS={potentiel:renderPotentiel, pistes:renderPistes, synthese:renderSynthese, 'simulation-girardin':renderGirardin, 'simulation-denormandie':renderDenormandie};
  const main=document.getElementById('study');

  function currentTab(){
    const h=(location.hash||'').replace('#','');
    if(h==='simulation-girardin'&&!study.solutions.some(item=>item.id==='girardin'))return 'pistes';
    if(h==='simulation-denormandie'&&!study.solutions.some(item=>item.id==='denormandie'))return 'pistes';
    return RENDERERS[h] ? h : 'potentiel';
  }

  function paint(){
    const tab=currentTab();
    main.innerHTML=RENDERERS[tab]();
    const shellTab=tab.startsWith('simulation-')?'pistes':tab;
    AppShell.render({current:shellTab, unlocked:true, initials:(profile.prenom||profile.nom||profile.statut||'AE').slice(0,2)});
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
    main.querySelectorAll('[href="#autres-solutions"]').forEach(link=>link.addEventListener('click',event=>{
      event.preventDefault();
      main.querySelector('#autres-solutions')?.scrollIntoView({behavior:'smooth',block:'center'});
    }));
    wireSimulatorForm();
  }

  const drawer=document.getElementById('solution-drawer');
  const cityPhotos=[
    ['Albi','Albi'],
    ['Angers – Les Ponts-de-Cé','Angers'],
    ['Clermont-Ferrand','Clermont'],
    ['La Rochelle – Aytré','La rochelle_Aytré'],
    ['Mont-Saint-Aignan','Mont Saint Agnan'],
    ['Niort','Niort'],
    ['Rochefort','Rochefort'],
    ['Saint-Étienne','Saint-Etienne'],
    ['Tarbes','Tarbes'],
    ['Toulouse – Quint','Toulouse_Quint']
  ];
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
    const simulatorButton=document.getElementById('drawer-simulator');
    const simulatorRoute={girardin:'simulation-girardin',denormandie:'simulation-denormandie'}[solution.id];
    simulatorButton.hidden=!simulatorRoute;
    simulatorButton.textContent=solution.id==='girardin'?'Simuler une offre Girardin':'Simuler mon projet Denormandie';
    simulatorButton.onclick=()=>{closeDrawer();location.hash=simulatorRoute;};
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
