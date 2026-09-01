import { useState, type SubmitEvent } from "react";
import type { User } from "../types";
import { useAuth } from "../../context/auth-context";
import { Link, useNavigate } from "react-router-dom";
import type { AxiosError } from "axios";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const [formData, setFormData] = useState<User>({
    name: "",
    username: "",
    email: "",
    password: "",
  });
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await toast.promise(
        register(
          formData.name,
          formData.username,
          formData.email,
          formData.password,
        ),
        {
          loading: "Registering",
          success: "Welcome!",
          error: (err: unknown) => {
            const axiosErr = err as AxiosError<{ error: string }>;
            return axiosErr.response?.data?.error || "Registration failed.";
          },
        },
      );
      navigate("/login");
    } catch {
      //toast already handles the error
    }
  };

  //setFormData(((prev) => ({...prev, name: e.target.value})))} this makes sure that the user object updates only the field being typed in.
  return (
    <form onSubmit={handleSubmit} className="form-style">
      <h2>Register</h2>
      <input
        type="text"
        name="name"
        placeholder="Name"
        value={formData.name}
        onChange={handleChange}
        required
        aria-label="Name"
      />
      <input
        type="text"
        name="username"
        placeholder="Username"
        value={formData.username}
        onChange={handleChange}
        required
        aria-label="Username"
      />
      <input
        type="email"
        name="email"
        placeholder="email"
        value={formData.email}
        onChange={handleChange}
        required
        aria-label="email"
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleChange}
        required
        aria-label="Password"
      />
      <button type="submit">Register</button>
      <p>
        Have an account? <Link to="/login">Login</Link>
      </p>
    </form>
  );
}
