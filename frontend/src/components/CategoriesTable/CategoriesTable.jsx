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
                  <th>Namn</th>
              </tr>
              </thead> 
              <tbody>
              {categories.map((c) => (
                  <tr key={c.id}>
                  <td>{c.name}</td>
                  </tr>
                  ))}
              </tbody>
          </table>  
        </div>
       </> 
    );
}

export default CategoriesTable;