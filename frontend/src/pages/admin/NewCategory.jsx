import { useState } from 'react';
import { useNavigate } from "react-router";
import api from '../../services/api';
import styles from '../../components/NewProductForm/NewProductForm.module.css';

function NewCategory() {
    const [formData, setFormData] = useState({ Name: "" });
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState({ loading: false, error: null, success: null });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setErrors({});
        setStatus({ ...status, error: null }); // clear previous errors
    };

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        let newErrors = {};
        if (!formData.Name) newErrors.Name = "⛔ Category name is required";
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;

        setStatus({ loading: true, error: null });

        try {
            const response = await api.post('/admin/categories', formData);
            console.log('Success:', response.data);
            setFormData({ Name: "" });
            setStatus({ loading: false, error: null, success: "✅ Category added successfully!" });
            setTimeout(() => {
                navigate("/admin/products/new");
            }, 1500);
        } catch (error) {
            console.error('Error:', error);
            const errorMessage = error.response?.data?.error || error.message || 'Something went wrong';
            setStatus({ loading: false, error: errorMessage });
            setTimeout(() => {
                navigate("/admin/products/new");
            }, 1500);
        }
    };

    return (
      <div>
        <form onSubmit={handleSubmit} className={styles.container}>
          <h4>Ny kategori</h4>

          <div className={styles.formUnit}>
            <label>Namn</label>
            <br />
            <input
              type="text"
              name="Name"
              value={formData.Name}
              onChange={handleChange}
            />
            {errors.Name && (
              <p className={styles.errorMessage}>{errors.Name}</p>
            )}
          </div>

          {status.error && (
            <p className={styles.errorMessage}>{status.error}</p>
          )}

          {status.success && (
            <p className={styles.successMessage}>{status.success}</p>
          )}

          <br />
          <button
            type="submit"
            className={styles.formUnit}
            disabled={status.loading}
          >
            {status.loading ? "Skickar in ..." : "Lägg till"}
          </button>
        </form>
      </div>
    );
}

export default NewCategory;
