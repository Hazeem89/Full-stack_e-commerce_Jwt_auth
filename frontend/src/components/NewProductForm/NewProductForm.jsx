import { useState, useEffect } from "react";
import {Link, useNavigate} from "react-router";
import styles from './NewProductForm.module.css'

function NewProductForm() {
    
    const [formData, setFormData] = useState({
        Name: "",
        Description: "",
        ImageUrl: "",
        Brand: "",
        SKU: "",
        Price: "",
        PublicationDate: "",
    });

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState("");
    const [categories, setCategories] = useState([]); 
    const [selectedCategories, setSelectedCategories] = useState([]);

    useEffect(() => {
        fetch('http://localhost:8000/categories')
        .then(response => response.json())
        .then(data => setCategories(data))
        .catch(error => console.error('Error fetching categories:', error));
    }, []);

    const [status, setStatus] = useState({
        loading: false,
        success: false,
        error: null
    });
    
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Handle image file selection
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
            // Clear any existing imageUrl error
            if (errors.imageUrl) {
                setErrors(prev => ({ ...prev, imageUrl: null }));
            }
        }
    };
    
    const validateForm = () => {
      let newErrors = {};
      if (!formData.Name) newErrors.Name = "⛔ Product name is required";
      if (!formData.Description)
        newErrors.Description = "⛔ Product description is required";
      if (!imageFile && !formData.ImageUrl)
        newErrors.ImageUrl = "⛔ Product URL is required";
      if (!formData.Brand) newErrors.Brand = "⛔ Product brand is required";
      // SKU presence check
      if (!formData.SKU) {
        newErrors.SKU = "⛔ Product SKU is required";
      } else {
        // SKU format check: 3 uppercase letters followed by 3 digits
        const skuPattern = /^[A-Z]{3}[0-9]{3}$/;
        if (!skuPattern.test(formData.SKU)) {
          newErrors.SKU =
            "⛔ SKU must be in the format XXX123 (3 uppercase letters followed by 3 digits)";
        }
      }
      if (!formData.Price) newErrors.Price = "⛔ Product price is required";
      if (formData.PublicationDate) {
        const selectedDate = new Date(formData.PublicationDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate > today) {
          newErrors.PublicationDate =
            "⛔ Publication date cannot be in the future";
        }
      }
      if (selectedCategories.length === 0)
        newErrors.Categories = "⛔ At least one category must be selected";
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleCategoryChange = (event) => {
        const value = event.target.value;
        setSelectedCategories(prevCategories =>
        prevCategories.includes(value)
            ? prevCategories.filter(category => category !== value)
            : [...prevCategories, value]
        );
    };
    
    // Upload image to server
    const uploadImage = async (file) => {
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch('http://localhost:8000/admin/upload-image', {
            method: 'POST',
            body: formData,
            credentials: 'include',
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to upload image');
        }

        const result = await response.json();
        return result.ImageUrl;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        
        setStatus({ loading: true, success: false, error: null });

        try {
          let ImageUrl = formData.ImageUrl;
          console.log('Initial imageUrl:', ImageUrl);

          // Upload image if file is selected
          if (imageFile) {
              ImageUrl = await uploadImage(imageFile);
              console.log('Uploaded imageUrl:', ImageUrl);
          }
        
          const submissionData = {
              Name: formData.Name,
              Description: formData.Description,
              Brand: formData.Brand,
              ImageUrl: ImageUrl,
              SKU: formData.SKU,
              Price: formData.Price,
              PublicationDate: formData.PublicationDate || null,
              Categories: selectedCategories.map(id => parseInt(id))
          };

           console.log('Submission data:', submissionData);
          
          const response = await fetch("http://localhost:8000/admin/products", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(submissionData),
              credentials: 'include',
          });
              
          if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || "Failed to submit form");
          }
            
            const result = await response.json();
            console.log("Server Response:", result);
            
            setStatus({ loading: false, success: true, error: null });

            // Reset form
            setFormData({
                Name: "",
                Description: "",
                ImageUrl: "",
                Brand: "",
                SKU: "",
                Price: "",
                PublicationDate: "",
            });

            setImageFile(null);
            setImagePreview("");
            setSelectedCategories([]);
            
            setTimeout(() => {
                setStatus(prev => ({ ...prev, success: false }));
                navigate("/admin/products");
            }, 1500);
            
        } catch (error) {
            console.error("Error submitting form:", error);
            setStatus({ loading: false, success: false, error: error.message });
        }
    };
    
    return (
      <>
        <div>
          {status.success && (
            <span className={styles.successMessage}>
              Product added successfully!✅
            </span>
          )}

          {status.error && (
            <div className={styles.errorMessage}>Error: {status.error}</div>
          )}

          <form onSubmit={handleSubmit} className={styles.container}>
            <h4>Ny produkt</h4>
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

            <div className={styles.formUnit}>
              <label>Beskrivning</label>
              <br />
              <textarea
                name="Description"
                value={formData.Description}
                onChange={handleChange}
                rows="4"
              />
              {errors.Description && (
                <p className={styles.errorMessage}>{errors.Description}</p>
              )}
            </div>

            <div className={styles.formUnit}>
              <label>Bild</label>
              <br />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {imagePreview && (
                <div className={styles.imagePreview}>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{
                      maxWidth: "200px",
                      maxHeight: "200px",
                      marginTop: "10px",
                    }}
                  />
                </div>
              )}
              <small>Or provide URL:</small>
              <input
                type="url"
                name="ImageUrl"
                value={formData.ImageUrl}
                onChange={handleChange}
                placeholder="http://example.com/image.jpg"
              />
              {errors.ImageUrl && (
                <p className={styles.errorMessage}>{errors.ImageUrl}</p>
              )}
            </div>

            <div className={styles.formUnit}>
              <label>Märke</label>
              <br />
              <input
                type="text"
                name="Brand"
                value={formData.Brand}
                onChange={handleChange}
              />
              {errors.Brand && (
                <p className={styles.errorMessage}>{errors.Brand}</p>
              )}
            </div>

            <div className={styles.formUnit}>
              <label>SKU</label>
              <br />
              <input
                type="text"
                name="SKU"
                value={formData.SKU}
                onChange={handleChange}
              />
              {errors.SKU && (
                <p className={styles.errorMessage}>{errors.SKU}</p>
              )}
            </div>

            <div className={styles.formUnit}>
              <label>Pris</label>
              <br />
              <input
                type="number"
                name="Price"
                value={formData.Price}
                onChange={handleChange}
              />
              {errors.Price && (
                <p className={styles.errorMessage}>{errors.Price}</p>
              )}
            </div>

            <div className={styles.formUnit}>
              <label>Publiseringsdatum</label>
              <br />
              <input
                type="date"
                name="PublicationDate"
                value={formData.PublicationDate}
                onChange={handleChange}
              />
              {errors.PublicationDate && (
                <p className={styles.errorMessage}>{errors.PublicationDate}</p>
              )}
            </div>
            <br />
            <div>
              <label>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span>Categories:</span>
                  <button className={styles.smallButton}>
                    <Link to="/admin/categories/new">Ny kategori</Link>
                  </button>
                </div>
                <div className={styles.checkboxContainer}>
                  {categories.map((category) => (
                    <label key={category.id}>
                      <input
                        type="checkbox"
                        value={category.id}
                        checked={selectedCategories.includes(
                          category.id.toString()
                        )}
                        onChange={handleCategoryChange}
                      />
                      {category.name}
                    </label>
                  ))}
                </div>
                {errors.Categories && (
                  <p className={styles.errorMessage}>{errors.Categories}</p>
                )}
              </label>
            </div>

            <br />

            <button
              type="submit"
              className={styles.button}
              disabled={status.loading}
            >
              {status.loading ? "Skickar in ..." : "Lägg till"}
            </button>
          </form>
        </div>
      </>
    );
}

export default NewProductForm;