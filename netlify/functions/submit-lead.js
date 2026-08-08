// netlify/functions/submit-lead.js
// Envoie les données du formulaire vers Airtable après vérification SMS

exports.handler = async (event) => {
  // Vérification de la méthode HTTP
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({
        error: 'Method not allowed'
      })
    };
  }

  // Lecture des données envoyées par le formulaire
  let lead;

  try {
    lead = JSON.parse(event.body);
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: 'Corps de requête invalide'
      })
    };
  }

  // Variables d'environnement Netlify
  const apiKey = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const table = process.env.AIRTABLE_TABLE_NAME || 'Leads';

  // Vérification de la configuration Airtable
  if (!apiKey || !baseId || !table) {
    console.error('Variables Airtable manquantes');

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Configuration serveur incomplète'
      })
    };
  }

  // Données du formulaire envoyées vers Airtable
  const fields = {
    'Nom et prénom': lead.nomPrenom || '',
    'N° telephone (fx)': lead.telephone || '',
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
    'Source': 'Mon Alter-Eco – Site web'
  };

  // Envoi des données vers Airtable
  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fields: fields
        })
      }
    );

    const data = await response.json();

    // Gestion des erreurs Airtable
    if (!response.ok) {
      console.error('Erreur Airtable:', data);

      return {
        statusCode: 400,
        body: JSON.stringify({
          error: data.error?.message || 'Erreur Airtable'
        })
      };
    }

    // Succès
    console.log(
      'Lead envoyé avec succès à Airtable:',
      data.id
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        id: data.id
      })
    };

  } catch (err) {
    // Erreur réseau / serveur
    console.error('Erreur réseau:', err);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Erreur serveur inattendue'
      })
    };
  }
};
