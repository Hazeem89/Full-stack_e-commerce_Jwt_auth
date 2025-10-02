import { useEffect, useState } from 'react'
import {Link} from "react-router";
import styles from './CategoriesTable.module.css';


const CategoriesTable = () => {

    const [categories, setCategories] = useState([]);
    
      useEffect(() => {
    
        fetch('http://localhost:8000/categories')  
        .then(resp => resp.json())
        .then(categories => {
        setCategories (categories)
      });
      }, [categories]);

      const deleteCategory = (id) => {
      fetch(`http://localhost:8000/admin/categories/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      .then(resp => {
        if (resp.ok) {
          setCategories(categories.filter(category => category.id !== id));
        } else {
          console.error('Failed to delete category');
        }
      })
      .catch(error => console.error('Error deleting category:', error));
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