import { useState } from 'react'; 
import { useNavigate } from "react-router";
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

    const handleSubmit = (e) => {
        e.preventDefault();

        let newErrors = {};
        if (!formData.Name) newErrors.Name = "⛔ Category name is required";
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;

        setStatus({ loading: true, error: null });

        fetch('http://localhost:8000/admin/categories', {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        })
            .then(async (response) => {
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.error || 'Something went wrong');
                }

                console.log('Success:', data);
                setFormData({ Name: "" });
                setStatus({ loading: false, error: null, success: "✅ Category added successfully!" });
                setTimeout(() => {
                    navigate("/admin/products/new");
                }, 1500);
            })
            .catch((error) => {
                console.error('Error:', error);
                setStatus({ loading: false, error: error.message });
                setTimeout(() => {
                    navigate("/admin/products/new");
                }, 1500);
            })
            .finally(() => {
                setStatus((prev) => ({ ...prev, loading: false }));
            });
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
