import { useEffect, useRef, useState } from "react";
import { readGoogleCredential, type GoogleUser } from "../auth";

type GoogleCredentialResponse = { credential?: string };
type GoogleIdentityApi = {
  initialize(options: { client_id: string; callback: (response: GoogleCredentialResponse) => void; auto_select: boolean; cancel_on_tap_outside: boolean }): void;
  renderButton(parent: HTMLElement, options: { theme: string; size: string; shape: string; text: string; width: number }): void;
};

declare global {
  interface Window { google?: { accounts: { id: GoogleIdentityApi & { disableAutoSelect?(): void } } }; }
}

const scriptId = "google-identity-services";

export function GoogleSignIn({ clientId, onSuccess }: { clientId: string; onSuccess: (user: GoogleUser) => void }) {
  const button = useRef<HTMLDivElement>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(Boolean(clientId));

  useEffect(() => {
    if (!clientId) { setLoading(false); return; }
    let active = true;
    const render = () => {
      if (!active || !button.current || !window.google?.accounts.id) return;
      button.current.replaceChildren();
      window.google.accounts.id.initialize({
        client_id: clientId,
        auto_select: false,
        cancel_on_tap_outside: true,
        callback: (response) => {
          try {
            if (!response.credential) throw new Error("Google sign-in did not return an identity credential.");
            const user = readGoogleCredential(response.credential, clientId);
            setError("");
            onSuccess(user);
          } catch (value) { setError(value instanceof Error ? value.message : "Google sign-in could not be completed."); }
        },
      });
      window.google.accounts.id.renderButton(button.current, { theme: "outline", size: "large", shape: "pill", text: "signin_with", width: 260 });
      setLoading(false);
    };
    if (window.google?.accounts.id) render();
    else {
      let script = document.getElementById(scriptId) as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement("script");
        script.id = scriptId;
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        document.head.append(script);
      }
      script.addEventListener("load", render);
      const failed = () => { if (active) { setLoading(false); setError("Google sign-in could not be loaded. Check the network connection and authorized origin."); } };
      script.addEventListener("error", failed);
      return () => { active = false; script?.removeEventListener("load", render); script?.removeEventListener("error", failed); };
    }
    return () => { active = false; };
  }, [clientId, onSuccess]);

  if (!clientId) return <div className="google-signin-error" role="status">Google sign-in is not configured. Add <code>VITE_GOOGLE_CLIENT_ID</code> and restart the web app.</div>;
  return <div className="google-signin-wrap">
    {loading && <span className="google-signin-loading">Loading Google sign-in…</span>}
    <div ref={button} className="google-signin-button" aria-label="Google sign-in" />
    {error && <p className="google-signin-error" role="alert">{error}</p>}
  </div>;
}
