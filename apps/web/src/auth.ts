export const googleUserStorageKey = "tradesense.google-user.v1";

export type GoogleUser = {
  subject: string;
  email: string;
  name: string;
  picture?: string;
};

export const developerUser: GoogleUser = {
  subject: "developer",
  email: "developer@tradesense.local",
  name: "Developer",
};


type GoogleIdentityClaims = {
  aud?: string | string[];
  email?: string;
  email_verified?: boolean;
  exp?: number;
  iss?: string;
  name?: string;
  picture?: string;
  sub?: string;
};

function decodeSegment(segment: string): GoogleIdentityClaims {
  const normalized = segment.replaceAll("-", "+").replaceAll("_", "/").padEnd(Math.ceil(segment.length / 4) * 4, "=");
  const bytes = Uint8Array.from(atob(normalized), (character) => character.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes)) as GoogleIdentityClaims;
}

export function readGoogleCredential(credential: string, clientId: string, now = Date.now()): GoogleUser {
  const parts = credential.split(".");
  if (parts.length !== 3) throw new Error("Google returned an invalid identity credential.");
  const claims = decodeSegment(parts[1]!);
  const audiences = Array.isArray(claims.aud) ? claims.aud : claims.aud ? [claims.aud] : [];
  if (!audiences.includes(clientId)) throw new Error("Google returned a credential for a different client.");
  if (claims.iss !== "https://accounts.google.com" && claims.iss !== "accounts.google.com") throw new Error("Google returned an unexpected credential issuer.");
  if (!claims.exp || claims.exp * 1_000 <= now) throw new Error("The Google sign-in credential has expired.");
  if (!claims.sub || !claims.email || claims.email_verified !== true) throw new Error("A verified Google account email is required.");
  let picture: string | undefined;
  if (claims.picture) {
    try { if (new URL(claims.picture).protocol === "https:") picture = claims.picture; } catch { /* Ignore an invalid optional profile image. */ }
  }
  return { subject: claims.sub, email: claims.email, name: claims.name?.trim() || claims.email.split("@")[0]!, ...(picture ? { picture } : {}) };
}

export function readStoredGoogleUser(): GoogleUser | null {
  try {
    const value = sessionStorage.getItem(googleUserStorageKey);
    if (!value) return null;
    const parsed = JSON.parse(value) as Partial<GoogleUser>;
    if (parsed.subject === "local-demo-trader") { sessionStorage.removeItem(googleUserStorageKey); return null; }
    if (!parsed.subject || !parsed.email || !parsed.name) return null;
    return { subject: parsed.subject, email: parsed.email, name: parsed.name, ...(parsed.picture ? { picture: parsed.picture } : {}) };
  } catch { return null; }
}

export function storeGoogleUser(user: GoogleUser): void {
  sessionStorage.setItem(googleUserStorageKey, JSON.stringify(user));
}

export function clearGoogleUser(): void {
  sessionStorage.removeItem(googleUserStorageKey);
}
