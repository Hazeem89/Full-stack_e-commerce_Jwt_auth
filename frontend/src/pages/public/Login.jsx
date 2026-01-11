import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";
import styles from "../../components/NewProductForm/NewProductForm.module.css";

function Login() {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({
    loading: false,
    error: null,
    success: null,
  });
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({});
    setStatus({ ...status, error: null });
  };

  const syncFavoritesToBackend = async (userId) => {
    try {
      const localFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');

      if (localFavorites.length > 0) {
        await api.post('/users/favorites/sync', {
          userId,
          productIds: localFavorites
        });

        // Clear local favorites after syncing
        localStorage.removeItem('favorites');
      }
    } catch (err) {
      console.error('Error syncing favorites:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let newErrors = {};
    if (!formData.username) newErrors.username = "⛔ Användarnamn krävs";
    if (!formData.password) newErrors.password = "⛔ Lösenord krävs";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setStatus({ loading: true, error: null, success: null });

    try {
      // Login with JWT
      const response = await api.post("/users/login", formData);
      const data = response.data; // { accessToken, user: {...} }

      // Store user and accessToken in context (sets Authorization header too)
      login(data);

      // Sync anonymous favorites to backend
      await syncFavoritesToBackend(data.user.id);

      setFormData({ username: "", password: "" });
      setStatus({
        loading: false,
        error: null,
        success: "✅ Inloggning lyckades!",
      });

      setTimeout(() => {
        navigate("/basket");
      }, 2000);
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage = error.response?.data?.error || error.message || "Något gick fel";
      setStatus({ loading: false, error: errorMessage, success: null });
    }
  };

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className={styles.container}
        style={{ flexDirection: "column", alignItems: "center" }}
      >
        <h3>Logga in</h3>
        <br></br>
        {status.error && <p className={styles.errorMessage}>{status.error}</p>}
        {status.success && (
          <p className={styles.successMessage}>{status.success}</p>
        )}
        <div>
          <label>E-post</label>
          <br />
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            autoComplete="username"
          />
          {errors.username && (
            <p className={styles.errorMessage}>{errors.username}</p>
          )}
        </div>
        <br></br>
        <div>
          <label>Lösenord</label>
          <br />
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            autoComplete="current-password"
          />
          {errors.password && (
            <p className={styles.errorMessage}>{errors.password}</p>
          )}
        </div>
        <br></br>
        <button
          type="submit"
          disabled={status.loading}
          className={styles.button}
        >
          {status.loading ? "Laddar..." : "Logga in"}
        </button>
        <br></br>
        <div>Har du inget kundkonto än?</div>
        <div
          style={{
            cursor: "pointer",
            color: hovered ? "#0056b3" : "#007bff",
            fontWeight: "bold",
            transition: "color 0.2s ease",
          }}
          onClick={() => navigate("/register")}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          Registrera här
        </div>
      </form>
    </div>
  );
}
export default Login;