import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem("session");
    console.log("Stored token in useAuth:", storedToken);
    if (storedToken) {
      setSessionToken(storedToken);
      setIsAuthenticated(true);
    }
  }, []);

  const checkSessionToken = useCallback(() => {
    const token = localStorage.getItem("session");
    console.log("Checking session token:", token);
    if (token) {
      setSessionToken(token);
      setIsAuthenticated(true);
      return token;
    }
    setIsAuthenticated(false);
    return null;
  }, []);

  const login = useCallback(async () => {
    console.log("Login function called");
    const codeVerifier = generateCodeVerifier();
    localStorage.setItem("code_verifier", codeVerifier);
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    const url = new URL(`${API_BASE_URL}/login`);
    url.searchParams.set("code_challenge", codeChallenge);
    console.log("Redirecting to:", url.toString());
    window.location.href = url.toString();
  }, []);

  const handleCallback = useCallback(
    async (loginId: string) => {
      const codeVerifier = localStorage.getItem("code_verifier");
      if (!codeVerifier) {
        throw new Error("Code verifier not found");
      }
      console.log("handleCallback");
      try {
        const response = await fetch(`${API_BASE_URL}/session`, {
          method: "POST",
          body: JSON.stringify({
            login_id: loginId,
            code_verifier: codeVerifier,
          }),
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Failed to exchange authorization code for session token: ${errorText}`
          );
        }

        const result = await response.json();
        const newSessionToken = result.session;
        console.log("New session token received:", newSessionToken);
        localStorage.setItem("session", newSessionToken);
        setSessionToken(newSessionToken);
        setIsAuthenticated(true);
        console.log("Authentication successful");
        navigate("/members");
      } catch (error) {
        console.error("Login failed:", error);
        throw error;
      }
    },
    [navigate]
  );

  const logout = useCallback(async () => {
    if (sessionToken) {
      try {
        await fetch(`${API_BASE_URL}/session`, {
          method: "DELETE",
          headers: {
            Authorization: `Session ${sessionToken}`,
          },
        });
      } catch (error) {
        console.error("Logout failed:", error);
      }
    }
    localStorage.removeItem("session");
    localStorage.removeItem("code_verifier");
    setSessionToken(null);
    setIsAuthenticated(false);
    navigate("/");
  }, [sessionToken, navigate]);

  return {
    isAuthenticated,
    sessionToken,
    login,
    handleCallback,
    logout,
    checkSessionToken,
  };
}

// ヘルパー関数
function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64UrlEncode(array);
}

async function generateCodeChallenge(codeVerifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return base64UrlEncode(new Uint8Array(hash));
}

function base64UrlEncode(array: Uint8Array): string {
  return btoa(String.fromCharCode.apply(null, Array.from(array)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}
