import { describe, expect, it } from "vitest";
import { readGoogleCredential } from "./auth";

function credential(payload: Record<string, unknown>) {
  const encode = (value: Record<string, unknown>) => btoa(JSON.stringify(value)).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
  return `${encode({ alg: "RS256", typ: "JWT" })}.${encode(payload)}.test-signature`;
}

describe("Google browser identity claims", () => {
  const clientId = "tradesense-test.apps.googleusercontent.com";
  const now = Date.UTC(2026, 9, 2);
  const valid = { aud: clientId, iss: "https://accounts.google.com", exp: now / 1_000 + 300, sub: "google-user-1", email: "trader@example.com", email_verified: true, name: "Demo Trader" };

  it("keeps only the bounded profile fields needed by the interface", () => {
    expect(readGoogleCredential(credential({ ...valid, picture: "https://example.com/avatar.png", nonce: "discarded" }), clientId, now)).toEqual({
      subject: "google-user-1", email: "trader@example.com", name: "Demo Trader", picture: "https://example.com/avatar.png",
    });
  });

  it("rejects an expired, unverified, or wrong-audience credential", () => {
    expect(() => readGoogleCredential(credential({ ...valid, exp: now / 1_000 - 1 }), clientId, now)).toThrow("expired");
    expect(() => readGoogleCredential(credential({ ...valid, email_verified: false }), clientId, now)).toThrow("verified Google account");
    expect(() => readGoogleCredential(credential({ ...valid, aud: "another-client" }), clientId, now)).toThrow("different client");
  });
});
