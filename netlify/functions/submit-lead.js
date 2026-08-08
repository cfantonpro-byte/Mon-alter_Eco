// netlify/functions/submit-lead.js
// Envoie les données du formulaire vers Airtable après vérification SMS

exports.handler = async (event) => {
  // Vérification de la méthode HTTP
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({
        error: "Method not allowed"
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
        error: "Corps de requête invalide"
      })
    };
  }

  // Variables d'environnement Netlify
  const apiKey = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const table = process.env.AIRTABLE_TABLE_NAME || "Leads";

  // Vérification de la configuration Airtable
  if (!apiKey || !baseId || !table) {
    console.error("Variables Airtable manquantes");

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Configuration serveur incomplète"
      })
    };
  }

  // Conversion du téléphone pour Airtable
  const telephoneString = String(lead.telephone || "").replace(/\D/g, "");

  const telephone = telephoneString
    ? parseInt(telephoneString, 10)
    : null;

  // Mapping des données du formulaire vers les colonnes Airtable
  // IMPORTANT :
  // Les noms ci-dessous correspondent à la structure de submit-form
  // qui fonctionnait auparavant.
  const fields = {
    "Nom et prénom": lead.nomPrenom || "",

    "N° telephone (fx)": telephone,

    "CSP": lead.csp || "",

    "Situation familiale": lead.situationFamiliale || "",

    "Age": lead.age,

    "Imposition annuelle": lead.impositionAnnuelle || "",

    "Effort d'épargne": lead.effortEpargne || "",

    "Epargne totale": lead.epargneTotale || "",

    "Ville": lead.ville || "",

    "Code postal": lead.codePostal || "",

    "Objectifs": Array.isArray(lead.objectifs)
      ? lead.objectifs
      : [],

    // Nouvelles données ajoutées dans submit-lead
    "Consentement": lead.consentement || "",

    "Email": lead.emailConsentement || "",

    "Source": "Mon Alter-Eco – Site web"
  };

  // Airtable n'aime pas les valeurs null/undefined/vides.
  // On les retire avant l'envoi.
  Object.keys(fields).forEach((key) => {
    if (
      fields[key] === null ||
      fields[key] === undefined ||
      fields[key] === ""
    ) {
      delete fields[key];
    }
  });

  // Envoi des données vers Airtable
  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          records: [
            {
              fields: fields
            }
          ],
          typecast: true
        })
      }
    );

    const data = await response.json();

    // Gestion des erreurs Airtable
    if (!response.ok) {
      console.error("Erreur Airtable:", data);

      return {
        statusCode: response.status,
        body: JSON.stringify({
          error: data.error?.message || "Erreur Airtable",
          details: data
        })
      };
    }

    // Succès
    const recordId = data.records?.[0]?.id;

    console.log(
      "Lead envoyé avec succès à Airtable:",
      recordId
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        id: recordId
      })
    };

  } catch (err) {
    // Erreur réseau / serveur
    console.error("Erreur réseau:", err);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Erreur serveur inattendue"
      })
    };
  }
};
