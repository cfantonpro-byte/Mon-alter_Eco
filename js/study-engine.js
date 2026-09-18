const NOUVELLE_AQUITAINE_DEPARTMENTS = new Set(['16','17','19','23','24','33','40','47','64','79','86','87']);
const isNouvelleAquitaine = profile => NOUVELLE_AQUITAINE_DEPARTMENTS.has(String(profile.codePostal || '').trim().slice(0,2));

const ALTER_ECO_SOLUTIONS = [
  {
    id: 'assurance-vie', name: 'Assurance-vie multisupport', type: 'Épargne & diversification',
    goals: ['Valoriser mon épargne', 'Protéger ma famille', 'Anticiper ma transmission'],
    positives: p => (p.epargne >= 10000 ? 1 : 0) + (p.age >= 30 ? 1 : 0),
    exclude: () => false,
    benefit: 'Structurer une épargne disponible et diversifiée dans un cadre fiscal progressif.',
    lever: 'Organiser et diversifier votre épargne',
    conditions: ['Définir l’horizon de placement', 'Comparer les frais du contrat', 'Choisir une allocation adaptée au risque'],
    vigilance: 'La valeur des unités de compte peut fluctuer et le capital investi sur ces supports n’est pas garanti.'
  },
  {
    id: 'per', name: 'Plan d’épargne retraite', type: 'Retraite & fiscalité', illustration: 'assets/per-illustration.webp',
    goals: ['Préparer ma retraite', 'Réduire mon imposition'],
    positives: p => (p.impot >= 5000 ? 1 : 0) + (p.age >= 30 && p.age <= 60 ? 1 : 0) + (p.mensuel >= 200 ? 1 : 0),
    exclude: p => p.age >= 65,
    benefit: 'Préparer des revenus futurs tout en étudiant un possible avantage fiscal à l’entrée.',
    lever: 'Préparer progressivement vos revenus futurs',
    conditions: ['Vérifier le plafond de déduction disponible', 'Évaluer la tranche marginale d’imposition', 'Anticiper la fiscalité à la sortie'],
    vigilance: 'L’épargne est en principe indisponible jusqu’à la retraite, hors cas légaux de déblocage.'
  },
  {
    id: 'pea', name: 'Plan d’épargne en actions', type: 'Investissement long terme',
    goals: ['Valoriser mon épargne'],
    positives: p => (p.age <= 55 ? 1 : 0) + (p.epargne >= 10000 ? 1 : 0) + (p.mensuel >= 200 ? 1 : 0),
    exclude: p => p.age >= 70,
    benefit: 'Développer une exposition progressive aux marchés sur un horizon long.',
    lever: 'Donner du temps à votre capital',
    conditions: ['Disposer d’un horizon suffisamment long', 'Diversifier secteurs et zones géographiques', 'Accepter les fluctuations de marché'],
    vigilance: 'Les marchés actions peuvent subir des baisses importantes, y compris sur plusieurs années.'
  },
  {
    id: 'immobilier', name: 'Immobilier locatif', type: 'Immobilier & revenus futurs', illustration: 'assets/immobilier-illustration.webp',
    goals: ["Investir dans l'immobilier", 'Préparer ma retraite', 'Réduire mon imposition'],
    positives: p => (p.epargne >= 30000 ? 1 : 0) + (p.mensuel >= 500 ? 1 : 0) + (p.impot >= 5000 ? 1 : 0),
    exclude: p => p.mensuel < 200,
    benefit: 'Étudier la constitution d’un actif tangible et de revenus complémentaires à terme.',
    lever: 'Développer votre exposition immobilière',
    conditions: ['Mesurer la capacité d’endettement', 'Étudier le marché locatif local', 'Intégrer charges, travaux et vacance'],
    vigilance: 'Un investissement immobilier est peu liquide et comporte des risques locatifs, financiers et de perte en capital.'
  },
  {
    id: 'studyz', name: 'Investir dans un logement étudiant', type: 'Immobilier meublé avec services',
    goals: ["Investir dans l'immobilier", 'Valoriser mon épargne', 'Préparer ma retraite'],
    positives: () => 3,
    exclude: p => !isNouvelleAquitaine(p) || p.epargne < 10000 || p.mensuel < 200,
    benefit: 'Étudier l’acquisition d’un logement meublé dans une résidence avec services destinée aux étudiants et jeunes actifs.',
    lever: 'Diversifier votre patrimoine avec l’immobilier étudiant', partner: 'Stüdyz', minScore: 4, image: 'assets/studyz-residence-illustration.png',
    conditions: ['Étudier le programme, son emplacement et la demande locative', 'Vérifier le mandat de gestion, les garanties, les charges et leur durée', 'Faire valider le financement, le régime fiscal et les conditions de récupération de TVA'],
    vigilance: 'Tout investissement immobilier locatif comporte des risques : vacance, impayés, charges, évolution de la fiscalité, faible liquidité et perte en capital à la revente.',
    requiredGoals: ["Investir dans l'immobilier", 'Valoriser mon épargne', 'Préparer ma retraite'], minGoalMatches: 1,
    reasons: p => [
      'Votre résidence est située en Nouvelle-Aquitaine',
      'Votre capacité d’épargne atteint au moins 200 € par mois',
      'Votre épargne disponible atteint au moins 10 000 €',
      `Votre objectif est « ${p.objectifs.find(goal => ["Investir dans l'immobilier", 'Valoriser mon épargne', 'Préparer ma retraite'].includes(goal))} »`
    ],
    sourceUrl: 'https://residence-studyz.fr/investir-studyz/'
  },
  {
    id: 'scpi', name: 'SCPI', type: 'Immobilier & revenus futurs',
    goals: ["Investir dans l'immobilier", 'Valoriser mon épargne', 'Préparer ma retraite'],
    positives: p => (p.epargne >= 5000 ? 1 : 0) + (p.mensuel >= 100 ? 1 : 0),
    exclude: p => p.epargne < 1000,
    benefit: 'Étudier un accès à l’immobilier professionnel ou résidentiel sans gestion locative directe, via des parts de SCPI.',
    lever: 'Diversifier sans gestion locative directe',
    conditions: ['Comparer les frais de souscription et de gestion', 'Vérifier le taux de distribution historique et sa régularité', 'Tenir compte du délai de jouissance et de la fiscalité applicable'],
    vigilance: 'Les revenus des SCPI ne sont pas garantis, le capital investi peut varier à la baisse, et la revente des parts peut prendre du temps.'
  },
  {
    id: 'protection', name: 'Solutions de prévoyance', type: 'Protection',
    goals: ['Protéger ma famille', 'Protéger mon activité'],
    positives: p => (/Chef|Artisan|libérale/i.test(p.statut) ? 1 : 0) + (/Mari|Pacs|Union/i.test(p.famille) ? 1 : 0),
    exclude: () => false,
    benefit: 'Évaluer les conséquences d’un imprévu sur vos proches, vos revenus ou votre activité.',
    lever: 'Sécuriser les personnes et revenus qui comptent',
    conditions: ['Chiffrer les revenus à protéger', 'Inventorier les garanties déjà détenues', 'Comparer exclusions, délais et franchises'],
    vigilance: 'Le niveau de couverture dépend des garanties, exclusions, délais de carence et conditions médicales du contrat.'
  }
];

const goalMatch = (solution, goals) => solution.goals.filter(g => goals.includes(g)).length;

const GOAL_ALIASES = {
  'Réduire mes impôts': 'Réduire mon imposition',
  'Investir en immobilier': "Investir dans l'immobilier"
};

function normalizeProfile(input = {}){
  const number = (value, fallback = 0) => Number.isFinite(Number(value)) ? Math.max(0, Number(value)) : fallback;
  const objectifs = Array.isArray(input.objectifs)
    ? [...new Set(input.objectifs.map(goal => GOAL_ALIASES[goal] || goal).filter(Boolean))]
    : [];
  return {
    ...input,
    age: Math.min(100, number(input.age)),
    epargne: number(input.epargne),
    mensuel: number(input.mensuel),
    impot: number(input.impot),
    codePostal: String(input.codePostal || '').replace(/\s/g,'').slice(0,5),
    statut: String(input.statut || 'Non renseigné'),
    famille: String(input.famille || 'Non renseignée'),
    objectifs
  };
}

function profileSignals(profile){
  return {
    horizonLong: profile.age > 0 && profile.age < 40,
    retraiteProche: profile.age >= 55,
    fiscaliteForte: profile.impot >= 7500,
    capitalSignificatif: profile.epargne >= 50000,
    effortFort: profile.mensuel >= 500,
    independant: /Chef|Artisan|Commerçant|libérale/i.test(profile.statut),
    familleAProteger: /Mari|Pacs|Union|Veuf/i.test(profile.famille)
  };
}

function buildInsights(profile){
  const s = profileSignals(profile), insights = [];
  if(s.horizonLong) insights.push('Votre horizon encore long permet d’envisager une construction progressive et diversifiée.');
  if(s.retraiteProche) insights.push('La proximité de la retraite renforce l’importance de l’équilibre entre revenus futurs, disponibilité et maîtrise du risque.');
  if(s.fiscaliteForte) insights.push('Votre niveau d’imposition justifie d’étudier les leviers fiscaux, sans en faire l’unique moteur de décision.');
  if(s.capitalSignificatif) insights.push('Votre capital disponible rend la diversification plus importante qu’une recherche de rendement isolée.');
  if(s.effortFort) insights.push('Votre capacité d’épargne offre une marge de manœuvre pour structurer plusieurs horizons complémentaires.');
  if(s.independant) insights.push('Votre statut professionnel invite à traiter ensemble patrimoine privé, revenus et protection de l’activité.');
  if(s.familleAProteger && profile.objectifs.includes('Protéger ma famille')) insights.push('La protection de vos proches constitue un enjeu patrimonial à part entière.');
  return insights.slice(0, 3);
}

function scoreSolutions(profile){
  profile = normalizeProfile(profile);
  return ALTER_ECO_SOLUTIONS.filter(solution => solution.enabled !== false).map(solution => {
    if(solution.exclude(profile)) return {...solution, score: 0, reasons: [], excluded: true};
    const matches = goalMatch(solution, profile.objectifs);
    const missesRequiredGoal = solution.requiredGoals && !solution.requiredGoals.some(goal => profile.objectifs.includes(goal));
    if(missesRequiredGoal || matches < (solution.minGoalMatches || 1)) return {...solution, score: 0, reasons: [], excluded: true};
    const score = matches === 0 ? 0 : Math.min(4, matches + solution.positives(profile));
    const reasons = solution.reasons ? solution.reasons(profile) : solution.goals.filter(g => profile.objectifs.includes(g)).slice(0, 2);
    return {...solution, score, reasons, excluded: false};
  }).filter(s => s.score >= (s.minScore || 2)).sort((a,b) => b.score - a.score);
}

function computePotentialScore(profile, solutions){
  profile = normalizeProfile(profile);
  const epargneScore = Math.min(1, profile.epargne / 50000) * 25;
  const mensuelScore = Math.min(1, profile.mensuel / 1000) * 25;
  const age = profile.age;
  const horizonScore = age <= 0 ? 12.5 : age <= 35 ? 25 : age <= 50 ? 18 : age <= 60 ? 12 : 6;
  const diversityScore = Math.min(solutions.length, 4) / 4 * 25;
  return Math.round(epargneScore + mensuelScore + horizonScore + diversityScore);
}

function computeCapacityRange(profile){
  profile = normalizeProfile(profile);
  const round5k = n => Math.round(n / 5000) * 5000;
  const low = round5k(profile.epargne);
  const high = Math.max(round5k(profile.epargne + profile.mensuel * 12 * 5), low + 5000);
  return {low, high};
}

function computeInvestorProfile(profile){
  profile = normalizeProfile(profile);
  const s = profileSignals(profile);
  if(s.retraiteProche || (!s.effortFort && !s.capitalSignificatif && !s.horizonLong)) return {label: 'Prudent', appetite: 'FAIBLE'};
  if(s.horizonLong && (s.effortFort || s.capitalSignificatif)) return {label: 'Dynamique', appetite: 'ÉLEVÉE'};
  return {label: 'Équilibré', appetite: 'MODÉRÉE'};
}

function pickFeaturedSolution(solutions){
  if(!solutions.length) return null;
  const partnerSolution = solutions.find(s => s.partner && s.score >= (s.minScore || 0));
  if(partnerSolution) return partnerSolution;
  // Tirage au sort parmi les solutions à égalité du meilleur score, pour ne
  // pas toujours mettre en avant la même solution par simple effet d'ordre
  // dans ALTER_ECO_SOLUTIONS.
  const topScore = solutions[0].score;
  const topTier = solutions.filter(s => s.score === topScore);
  return topTier[Math.floor(Math.random() * topTier.length)];
}

function buildStudy(profile){
  profile = normalizeProfile(profile);
  const solutions = scoreSolutions(profile);
  const goalLevers = {
    'Préparer ma retraite': 'Préparer vos revenus futurs',
    'Réduire mon imposition': 'Optimiser votre fiscalité avec mesure',
    'Valoriser mon épargne': 'Mettre votre épargne en mouvement',
    'Protéger ma famille': 'Renforcer la protection de vos proches',
    "Investir dans l'immobilier": 'Développer votre exposition immobilière',
    'Protéger mon activité': 'Sécuriser votre activité et vos revenus',
    'Anticiper ma transmission': 'Préparer la transmission de votre patrimoine'
  };
  const levers = [...new Set([...profile.objectifs.map(g => goalLevers[g]).filter(Boolean), ...solutions.map(s => s.lever)])].slice(0,4);
  const years = Math.max(5, Math.min(20, profile.age ? 65 - profile.age : 10));
  const horizon = Math.min(10, years);
  const project = rate => Math.round(profile.epargne * Math.pow(1+rate,horizon) + profile.mensuel*12*((Math.pow(1+rate,horizon)-1)/rate));
  const scenarios = [
    {id:'prudent', label:'Prudent', rate:.01, projected:project(.01), tone:'Préserver'},
    {id:'equilibre', label:'Équilibré', rate:.025, projected:project(.025), tone:'Équilibrer'},
    {id:'dynamique', label:'Dynamique', rate:.04, projected:project(.04), tone:'Développer'}
  ];
  const projected = scenarios[1].projected;
  const contributed = profile.epargne + profile.mensuel*12*horizon;
  const insights = buildInsights(profile);
  const fingerprint = solutions.map(solution => `${solution.id}:${solution.score}`).join('|') || 'no-solution';
  const potentialScore = computePotentialScore(profile, solutions);
  const capacity = computeCapacityRange(profile);
  const investorProfile = computeInvestorProfile(profile);
  const featured = pickFeaturedSolution(solutions);
  return {profile, solutions, levers, insights, horizon, scenarios, projected, contributed, fingerprint, potentialScore, capacity, investorProfile, featured};
}

const AlterEcoEngine = {buildStudy, scoreSolutions, normalizeProfile, buildInsights, isNouvelleAquitaine, computePotentialScore, computeCapacityRange, computeInvestorProfile, pickFeaturedSolution, library: ALTER_ECO_SOLUTIONS};
if(typeof window !== 'undefined') window.AlterEcoEngine = AlterEcoEngine;
if(typeof module !== 'undefined' && module.exports) module.exports = AlterEcoEngine;
