import { useState, type SubmitEvent } from "react";
import type { AxiosError } from "axios";
import { useAuth } from "../../context/auth-context";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    await toast.promise(login(email, password), {
      loading: "Logging in...",
      success: "Welcome back!",
      error: (err: unknown) => {
        const axiosErr = err as AxiosError<{ error: string }>;
        return axiosErr.response?.data?.error || "Login failed";
      },
    });
    navigate("/");
  };

  return (
    <form onSubmit={handleSubmit} className="form-style">
      <h2>Login</h2>
      {error ? <p>{error}</p> : ""}

      <input
        type="text"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        aria-label="Email"
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        aria-label="password"
      />

      <button type="submit">Log in</button>

      <p>
        No account? <Link to="/register">Register</Link>
      </p>
    </form>
  );
}
