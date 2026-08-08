// netlify/functions/submit-lead.js
// Envoie les données du formulaire vers Airtable après vérification SMS

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  let lead;

  try {
    lead = JSON.parse(event.body);
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Corps de requête invalide' })
    };
  }

  // Variables Netlify
  const apiKey = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const table = process.env.AIRTABLE_TABLE_NAME || 'Leads';

  if (!apiKey || !baseId || !table) {
    console.error('Variables Airtable manquantes');
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Configuration serveur incomplète'
      })
    };
  }

  // Mapping des données du formulaire vers les colonnes Airtable
  const fields = {
    'Nom et prénom': lead.nomPrenom || '',
    'Téléphone': lead.telephone || '',
    'Statut professionnel': lead.csp || '',
    'Situation familiale': lead.situationFamiliale || '',
    'Objectifs': Array.isArray(lead.objectifs)
      ? lead.objectifs.join(', ')
      : '',
    'Imposition annuelle': lead.impositionAnnuelle || '',
    'Épargne mensuelle': lead.effortEpargne || '',
    'Épargne totale': lead.epargneTotale || '',
    'Ville': lead.ville || '',
    'Code postal': lead.codePostal || '',
    'Âge': lead.age || '',
    'Consentement': lead.consentement || '',
    'Email': lead.emailConsentement || '',
    'Source': 'Mon Alter-Eco – Site web',
  };

  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fields }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Erreur Airtable:', data);

      return {
        statusCode: 400,
        body: JSON.stringify({
          error: data.error?.message || 'Erreur Airtable'
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        id: data.id
      }),
    };

  } catch (err) {
    console.error('Erreur réseau:', err);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Erreur serveur inattendue'
      }),
    };
  }
};
