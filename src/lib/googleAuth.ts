import crypto from 'crypto';

/**
 * Generates a Google API OAuth access token using a Service Account JWT.
 * Runs entirely in Next.js Serverless Node.js runtime environment.
 */
export async function getGoogleAccessToken(scopes: string[]): Promise<string> {
  let email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  let privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

  if (privateKey && privateKey.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(privateKey);
      email = parsed.client_email || email;
      privateKey = parsed.private_key;
    } catch (e) {
      console.error("Failed to parse GOOGLE_SERVICE_ACCOUNT_KEY as JSON", e);
    }
  }

  if (privateKey) {
    privateKey = privateKey.replace(/\\n/g, '\n');
  }

  if (!email || !privateKey || email.includes('placeholder')) {
    throw new Error('Google Service Account credentials missing or placeholder values detected.');
  }

  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 3600;

  const header = {
    alg: 'RS256',
    typ: 'JWT',
  };

  const claimSet = {
    iss: email,
    scope: scopes.join(' '),
    aud: 'https://oauth2.googleapis.com/token',
    exp,
    iat,
  };

  const base64UrlEncode = (str: string) => {
    return Buffer.from(str)
      .toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  };

  const jwtHeader = base64UrlEncode(JSON.stringify(header));
  const jwtClaim = base64UrlEncode(JSON.stringify(claimSet));
  const jwtInput = `${jwtHeader}.${jwtClaim}`;

  // Sign using Node.js crypto (RSA-SHA256)
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(jwtInput);
  const signature = sign.sign(privateKey, 'base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  const jwt = `${jwtInput}.${signature}`;

  // Exchange JWT for access token
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  const data = await res.json();
  if (data.error) {
    throw new Error(`Google OAuth token exchange failed: ${data.error_description || data.error}`);
  }

  return data.access_token;
}
