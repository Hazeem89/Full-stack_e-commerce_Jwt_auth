import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
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
        await fetch('http://localhost:8000/users/favorites/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, productIds: localFavorites })
        });
        
        // Clear local favorites after syncing
        localStorage.removeItem('favorites');
      }
    } catch (err) {
      console.error('Error syncing favorites:', err);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let newErrors = {};
    if (!formData.username) newErrors.username = "⛔ Användarnamn krävs";
    if (!formData.password) newErrors.password = "⛔ Lösenord krävs";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    setStatus({ loading: true, error: null, success: null });
    fetch("http://localhost:8000/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Något gick fel");
        }
        console.log("Success:", data);
        
        // Store user in context and localStorage
        login(data);
        
        // Sync anonymous favorites to backend
        await syncFavoritesToBackend(data.id);
        
        setFormData({ username: "", password: "" });
        setStatus({
          loading: false,
          error: null,
          success: "✅ Inloggning lyckades!",
        });
        setTimeout(() => {
          navigate("/");
        }, 2000);
      })
      .catch((error) => {
        console.error("Error:", error);
        setStatus({ loading: false, error: error.message, success: null });
      })
      .finally(() => {
        setStatus((prev) => ({ ...prev, loading: false }));
      });
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