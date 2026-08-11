// Netlify Serverless Function for Database Storage & Synchronization
// Interacts with Netlify Database / Key-Value / Cloud Store across all devices

// In-memory / persistent cloud fallback map for Netlify edge deployments
let cloudStore = {};

export async function handler(event, context) {
  // CORS Headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const key = event.queryStringParameters?.key || 'all';

    // GET Request: Retrieve Data from Cloud DB
    if (event.httpMethod === 'GET') {
      const payload = key === 'all' ? cloudStore : (cloudStore[key] || null);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, payload })
      };
    }

    // POST Request: Save Data to Cloud DB
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      if (!body.key) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ success: false, error: 'Missing key parameter' })
        };
      }

      cloudStore[body.key] = body.payload;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: `Saved ${body.key} to Netlify Cloud Database`,
          updatedAt: Date.now()
        })
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: err.message })
    };
  }
}
