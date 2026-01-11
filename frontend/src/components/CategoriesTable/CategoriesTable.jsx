import { useEffect, useState } from 'react'
import {Link} from "react-router";
import api from '../../services/api';
import styles from './CategoriesTable.module.css';


const CategoriesTable = () => {

    const [categories, setCategories] = useState([]);

      useEffect(() => {
        const loadCategories = async () => {
          try {
            const response = await api.get('/categories');
            setCategories(response.data);
          } catch (error) {
            console.error('Error loading categories:', error);
          }
        };
        loadCategories();
      }, []);

      const deleteCategory = async (id) => {
        try {
          await api.delete(`/admin/categories/${id}`);
          setCategories(categories.filter(category => category.id !== id));
        } catch (error) {
          console.error('Error deleting category:', error);
          alert('Failed to delete category');
        }
      }


    return (
       <>
        <div className = {styles.parent}>
          <div className = {styles.container}>
              <h3>Kategorier</h3>
              <button className={styles.button}><Link to="/admin/categories/new">Ny kategori</Link></button>
          </div>       
        </div>       

        <div style ={{justifyItems : "center"}}>
          <table>
              <thead>
              <tr>
                  <th style={{ textAlign: "center" }}>Namn</th>
              </tr>
              </thead> 
              <tbody>
              {categories.map((c) => (
                  <tr key={c.id}>
                  <td  style={{ textAlign: "center" }}>
                    <div className={styles.tdContent}>
                    <span>{c.name}</span>
                  
                    {/* Radera with confirmation as a button */}
                    <button
                      className={styles.deleteButton}
                      type="button"
                      title="Radera kategori"
                      onClick={() => {
                        const confirmed = window.confirm(
                          `Är du säker på att du vill radera ${c.name}?`
                        );
                        if (confirmed) {
                          deleteCategory(c.id);
                        }
                      }}
                    >
                      &nbsp;&nbsp;&#x1F5D1;&nbsp;&nbsp;
                    </button>
                    </div>
                  </td>
                  </tr>
                  ))}
              </tbody>
          </table>  
        </div>
       </> 
    );
}

export default CategoriesTable;