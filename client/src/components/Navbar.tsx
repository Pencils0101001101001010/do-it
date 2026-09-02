import { useAuth } from "../../context/auth-context";

export default function Navbar() {
  const { logout } = useAuth();
  return (
    <nav>
      <h2>DO_IT...</h2>
      <button onClick={logout}>Logout</button>
    </nav>
  );
}
