const test = require('node:test');
const assert = require('node:assert/strict');
const engine = require('./study-engine.js');
const withStudyzEnabled = fn => () => {
  const solution=engine.library.find(s=>s.id==='studyz');
  const previous=solution.enabled;
  solution.enabled=true;
  try{fn();}finally{solution.enabled=previous;}
};
test('Stüdyz reste conservé mais désactivé dans toutes les études', () => {
  assert.equal(engine.library.find(s=>s.id==='studyz').enabled,false);
  const study=engine.buildStudy({objectifs:["Investir dans l'immobilier",'Valoriser mon épargne'],mensuel:500,epargne:40000,codePostal:'33000',age:36});
  assert.ok(!study.solutions.some(s=>s.id==='studyz'));
  assert.notEqual(study.featured?.id,'studyz');
});

const profiles = {
  A: {age:25,statut:'Salarié',famille:'Célibataire',objectifs:['Valoriser mon épargne'],impot:500,mensuel:50,epargne:5000},
  B: {age:42,statut:'Salarié',famille:'Marié(e)',objectifs:['Préparer ma retraite'],impot:3750,mensuel:350,epargne:40000},
  C: {age:45,statut:"Chef d'entreprise",famille:'Marié(e)',objectifs:['Réduire mon imposition','Valoriser mon épargne'],impot:10000,mensuel:1500,epargne:150000},
  D: {age:48,statut:"Chef d'entreprise",famille:'Marié(e)',objectifs:['Préparer ma retraite','Réduire mon imposition',"Investir dans l'immobilier",'Valoriser mon épargne'],impot:10000,mensuel:1500,epargne:150000,codePostal:'33000'},
  E: {age:39,statut:'Profession libérale',famille:'Pacsé(e)',objectifs:["Investir dans l'immobilier"],impot:6250,mensuel:750,epargne:75000},
  F: {age:58,statut:'Profession libérale',famille:'Marié(e)',objectifs:['Anticiper ma transmission','Protéger ma famille'],impot:6250,mensuel:350,epargne:75000}
};

test('les six profils produisent des études sensiblement différentes', () => {
  const fingerprints = Object.values(profiles).map(profile => engine.buildStudy(profile).fingerprint);
  assert.equal(new Set(fingerprints).size, fingerprints.length);
});

test('Stüdyz réactivé est réservé aux prospects respectant les quatre critères', withStudyzEnabled(() => {
  for(const [name, profile] of Object.entries(profiles)){
    const ids = engine.buildStudy(profile).solutions.map(solution => solution.id);
    assert.equal(ids.includes('studyz'), name === 'D', `profil ${name}`);
  }
}));

test('Stüdyz réactivé accepte chacun des trois objectifs admissibles', withStudyzEnabled(() => {
  for(const objectif of ["Investir dans l'immobilier",'Valoriser mon épargne','Préparer ma retraite']){
    const ids=engine.buildStudy({objectifs:[objectif],mensuel:200,epargne:10000,codePostal:'17000'}).solutions.map(solution=>solution.id);
    assert.ok(ids.includes('studyz'), objectif);
  }
}));

test('Stüdyz réactivé refuse chaque critère manquant', withStudyzEnabled(() => {
  const admissible={objectifs:['Préparer ma retraite'],mensuel:200,epargne:10000,codePostal:'33000'};
  for(const profile of [
    {...admissible,codePostal:'75000'},
    {...admissible,objectifs:['Protéger ma famille']},
    {...admissible,mensuel:199},
    {...admissible,epargne:9999}
  ]) assert.ok(!engine.buildStudy(profile).solutions.some(solution=>solution.id==='studyz'));
}));

test('le profil protection/transmission ne reçoit pas de solution retraite ou immobilière', () => {
  const ids = engine.buildStudy(profiles.F).solutions.map(solution => solution.id);
  assert.deepEqual(ids, ['assurance-vie', 'protection']);
});

test('les variantes de libellés du simulateur sont normalisées', () => {
  const normalized = engine.normalizeProfile({objectifs:['Réduire mes impôts','Investir en immobilier']});
  assert.deepEqual(normalized.objectifs, ['Réduire mon imposition', "Investir dans l'immobilier"]);
});

test('les projections restent cohérentes et positives', () => {
  for(const profile of Object.values(profiles)){
    const study = engine.buildStudy(profile);
    assert.ok(study.projected >= study.contributed);
    assert.ok(study.horizon >= 5 && study.horizon <= 10);
    assert.deepEqual(study.scenarios.map(scenario => scenario.id), ['prudent','equilibre','dynamique']);
    assert.ok(study.scenarios[0].projected < study.scenarios[1].projected);
    assert.ok(study.scenarios[1].projected < study.scenarios[2].projected);
  }
});

test('les entrées invalides sont neutralisées', () => {
  const profile = engine.normalizeProfile({age:-4,epargne:'x',mensuel:-20,impot:null,objectifs:null});
  assert.equal(profile.age, 0);
  assert.equal(profile.epargne, 0);
  assert.equal(profile.mensuel, 0);
  assert.deepEqual(profile.objectifs, []);
});
