import { useEffect, useRef, useState } from "react";
import { loginWithGoogle } from "../api/auth";
import { useAuth } from "./AuthContext";

declare global {
  interface Window {
    google?: { accounts: { id: { initialize: (options: { client_id: string; callback: (response: { credential: string }) => void }) => void; renderButton: (element: HTMLElement, options: Record<string, string>) => void; } } };
  }
}

export default function GoogleLoginButton() {
  const buttonRef = useRef<HTMLDivElement>(null);
  const { setSession } = useAuth();
  const [message, setMessage] = useState<string | null>(null);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

  useEffect(() => {
    if (!clientId || !buttonRef.current) return;
    const render = () => {
      if (!window.google || !buttonRef.current) return;
      window.google.accounts.id.initialize({ client_id: clientId, callback: async ({ credential }) => {
        try { setSession(await loginWithGoogle(credential)); } catch { setMessage("Google sign-in could not be completed."); }
      } });
      buttonRef.current.replaceChildren();
      window.google.accounts.id.renderButton(buttonRef.current, { theme: "outline", size: "large", width: "360", text: "continue_with", shape: "pill" });
    };
    if (window.google) { render(); return; }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = render;
    document.head.appendChild(script);
    return () => { script.remove(); };
  }, [clientId, setSession]);

  if (!clientId) return <p className="google-not-configured">Google login is ready after setting <code>VITE_GOOGLE_CLIENT_ID</code>.</p>;
  return <div className="google-login"><div ref={buttonRef} /><span>{message}</span></div>;
}
