import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signIn } from "../services/auth";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();

    setLoading(true);
    setError("");

    const { error } = await signIn(email, password);

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    navigate("/dashboard");
  }

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#0b0b0f",
      }}
    >
      <form
        onSubmit={handleLogin}
        style={{
          width: 360,
          display: "flex",
          flexDirection: "column",
          gap: 15,
          background: "#17181d",
          padding: 40,
          borderRadius: 12,
        }}
      >
        <h1 style={{ color: "white" }}>Studio Thirty6 OS</h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: 12 }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: 12 }}
        />

        {error && (
          <p style={{ color: "tomato" }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: 14,
            cursor: "pointer",
          }}
        >
          {loading ? "Signing In..." : "Login"}
        </button>
      </form>
    </div>
  );
}