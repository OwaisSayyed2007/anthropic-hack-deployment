"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import { api } from "@/lib/api";

function LoginInner() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { setToken, setUser } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/login", { username, password });
      setToken(res.data.token);
      setUser(res.data.user);
      
      const meRes = await api.get("/auth/me");
      const me = meRes.data;
      setUser(me);
      if (me.role === "professor") router.push("/professor");
      else router.push("/chat");
    } catch (err: any) {
      console.error("Login failed:", err);
      setError("Invalid username or password.");
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "relative", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      <div className="orb" style={{ width: 500, height: 500, background: "radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)", top: "-100px", left: "-100px" }} />
      <div className="orb" style={{ width: 400, height: 400, background: "radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)", bottom: "-80px", right: "-80px" }} />

      <div className="glass-strong slide-up" style={{ width: 440, padding: "48px 40px", textAlign: "center", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 32 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: "linear-gradient(135deg, #8b5cf6, #06b6d4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, boxShadow: "0 8px 24px rgba(139,92,246,0.4)"
          }}>🧠</div>
          <span style={{ fontSize: 26, fontWeight: 700 }} className="gradient-text">FIWB</span>
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, color: "var(--text-primary)" }}>
          Simple Login
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.6, marginBottom: 32 }}>
          Enter your credentials to access your Digital Twin.
        </p>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16, textAlign: "left" }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 6, display: "block", textTransform: "uppercase" }}>Username</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              placeholder="student or teacher"
              style={{ width: "100%", padding: "12px 16px", borderRadius: 10, background: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
              required
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 6, display: "block", textTransform: "uppercase" }}>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              placeholder="123"
              style={{ width: "100%", padding: "12px 16px", borderRadius: 10, background: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: "100%", padding: "14px", fontSize: 15, borderRadius: 12, marginTop: 12, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {error && (
          <p style={{ color: "#ef4444", fontSize: 13, marginTop: 12, padding: "8px 12px", background: "rgba(239,68,68,0.1)", borderRadius: 8, border: "1px solid rgba(239,68,68,0.2)" }}>
            {error}
          </p>
        )}

        <div style={{ marginTop: 32, paddingTop: 24, borderTop: "1px solid var(--border)" }}>
           <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
             Credentials: student/123 or teacher/123
           </p>
        </div>
      </div>
    </div>
  );
}

export default function RootPage() {
  const { token, user } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [simpleMode, setSimpleMode] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    if (token) {
      if (!user) {
        api.get("/auth/me")
          .then((res) => {
            const u = res.data;
            useAuthStore.getState().setUser(u);
            if (u.role === "professor") router.replace("/professor");
            else router.replace("/chat");
          })
          .catch(() => {
            useAuthStore.getState().logout();
          });
      } else {
        if (user.role === "professor") router.replace("/professor");
        else router.replace("/chat");
      }
    } else {
      api.get("/auth/config")
        .then((res) => {
          const cfg = res.data;
          if (cfg?.method === "simple") setSimpleMode(true);
          else setConfigError("Invalid authentication configuration.");
        })
        .catch((err) => {
          console.error("Config fetch failed:", err);
          setConfigError("Cannot connect to backend.");
        });
    }
  }, [token, user, router]);

  if (!mounted || token) return null;
  
  if (configError) {
    return (
      <div style={{ height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#ef4444" }}>{configError}</p>
        <button onClick={() => window.location.reload()} style={{ marginTop: 16 }}>Retry</button>
      </div>
    );
  }

  return <LoginInner />;
}
