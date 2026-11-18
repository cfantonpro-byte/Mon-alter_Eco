const test = require('node:test');
const assert = require('node:assert/strict');
const {handler} = require('../netlify/functions/submit-lead.js');

process.env.AIRTABLE_TOKEN = 'test';
process.env.AIRTABLE_BASE_ID = 'base';

// Faux Airtable : aucun doublon ; refuse les colonnes listées comme le ferait une table sans elles.
function fakeAirtable(missing = []){
  const posts = [];
  global.fetch = async (url, options = {}) => {
    if(options.method !== 'POST') return {ok: true, status: 200, json: async () => ({records: []})};
    const fields = JSON.parse(options.body).records[0].fields;
    posts.push(fields);
    const absent = missing.find(name => name in fields);
    return absent
      ? {ok: false, status: 422, json: async () => ({error: {type: 'UNKNOWN_FIELD_NAME', message: `Unknown field name: "${absent}"`}})}
      : {ok: true, status: 200, json: async () => ({records: [{id: 'rec1'}]})};
  };
  return posts;
}

const lead = {nomPrenom: 'Test', telephone: '0612345678', objectifs: ['Réduire mon imposition'], solutions: ['Plan d’épargne retraite', 'Girardin industriel'], origine: 'tester · abc'};
const send = () => handler({httpMethod: 'POST', body: JSON.stringify(lead)});

test('les solutions identifiées sont enregistrées dans la fiche', async () => {
  const posts = fakeAirtable();
  assert.equal((await send()).statusCode, 200);
  assert.equal(posts[0]['Solutions identifiées'], 'Plan d’épargne retraite, Girardin industriel');
});

test('sans colonne « Solutions identifiées », le lead est enregistré quand même, lien d’origine compris', async () => {
  const posts = fakeAirtable(['Solutions identifiées']);
  assert.equal((await send()).statusCode, 200);
  assert.equal(posts.length, 2);
  assert.ok(!('Solutions identifiées' in posts[1]));
  assert.equal(posts[1]["Lien d'origine"], 'tester · abc');
});
