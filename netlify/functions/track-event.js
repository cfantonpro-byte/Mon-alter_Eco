// netlify/functions/track-event.js
// Suivi temps réel du tunnel vers Airtable (en parallèle de GA4, qui a un
// délai de traitement) — même patron que submit-lead.js.

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({
        error: "Method not allowed"
      })
    };
  }

  let payload;

  try {
    payload = JSON.parse(event.body);
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: "Corps de requête invalide"
      })
    };
  }

  const apiKey = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const table = process.env.AIRTABLE_EVENTS_TABLE_NAME || "Suivi clics";

  if (!apiKey || !baseId || !table) {
    console.error("Variables Airtable manquantes");

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Configuration serveur incomplète"
      })
    };
  }

  const fields = {
    "Session ID": payload.sessionId || "",
    "Visitor ID": payload.visitorId || "",
    "Événement": payload.evenement || "",
    "Détail": payload.detail || "",
    "Étape": payload.etape
  };

  // Airtable n'aime pas les valeurs null/undefined/vides.
  Object.keys(fields).forEach((key) => {
    if (
      fields[key] === null ||
      fields[key] === undefined ||
      fields[key] === ""
    ) {
      delete fields[key];
    }
  });

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

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        id: data.records?.[0]?.id
      })
    };

  } catch (err) {
    console.error("Erreur réseau:", err);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Erreur serveur inattendue"
      })
    };
  }
};
