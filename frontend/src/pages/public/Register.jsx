import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";
import styles from "../../components/NewProductForm/NewProductForm.module.css";

function Register() {
  const [formData, setFormData] = useState({ email: "", password: "" });
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

        localStorage.removeItem('favorites');
      }
    } catch (err) {
      console.error('Error syncing favorites:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let newErrors = {};
    if (!formData.email) newErrors.email = "⛔ E-post krävs";
    if (!formData.password) newErrors.password = "⛔ Lösenord krävs";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setStatus({ loading: true, error: null, success: null });

    try {
      // Register user
      const registerResponse = await api.post("/users/register", formData);
      const registerData = registerResponse.data;

      console.log("Registration success:", registerData);

      // Auto-login after registration
      const loginResponse = await api.post("/users/login", {
        username: formData.email,
        password: formData.password
      });

      const loginData = loginResponse.data; // { accessToken, user: {...} }

      // Store user and accessToken in context (sets Authorization header too)
      login(loginData);

      // Sync anonymous favorites to backend
      await syncFavoritesToBackend(loginData.user.id);

      setFormData({ email: "", password: "" });
      setStatus({
        loading: false,
        error: null,
        success: "✅ Registrering lyckades! Omdirigerar...",
      });

      setTimeout(() => {
        navigate("/");
      }, 2000);

    } catch (error) {
      console.error("Registration error:", error);
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
        <h3>Registrera konto</h3>
        <br></br>
        <div>
          <label>E-post</label>
          <br />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
          />
          {errors.email && (
            <p className={styles.errorMessage}>{errors.email}</p>
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
            autoComplete="new-password"
          />
          {errors.password && (
            <p className={styles.errorMessage}>{errors.password}</p>
          )}
        </div>

        {status.error && <p className={styles.errorMessage}>{status.error}</p>}

        {status.success && (
          <p className={styles.successMessage}>{status.success}</p>
        )}
        <br></br>
        <button
          type="submit"
          className={styles.formUnit}
          disabled={status.loading}
        >
          {status.loading ? "Skickar in ..." : "Registrera"}
        </button>
        <br></br>
        <div>Är du redan en kund?</div>
        <div
          style={{
            cursor: "pointer",
            color: hovered ? "#0056b3" : "#007bff",
            fontWeight: "bold",
            transition: "color 0.2s ease",
          }}
          onClick={() => navigate("/login")}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          Logga in här
        </div>
      </form>
    </div>
  );
}

export default Register;