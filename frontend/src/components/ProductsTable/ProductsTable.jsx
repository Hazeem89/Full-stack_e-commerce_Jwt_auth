import { useEffect, useState } from 'react'
import {Link} from "react-router";
import styles from './ProductsTable.module.css';


const ProductsTable = () => {

    const [products, setProducts] = useState([]);
    
      useEffect(() => {
    
        fetch('http://localhost:8000/products')  
        .then(resp => resp.json())
        .then(products => {
        setProducts (products)
    
        console.log (products)
        
        
      });
      }, [products]);


    return (
       <>
        <div className = {styles.parent}>
          <div className = {styles.container}>
              <h3>Produkter</h3>
              <button className={styles.button}><Link to="/admin/products/new">Ny produkt</Link></button>
          </div>       
        </div>       

        <div style ={{justifyItems : "center"}}>
          <table>
              <thead>
              <tr>
                  <th>Namn</th>
                  <th>SKU</th>
                  <th>Pris</th>
                  <th>Antal sålda</th>
              </tr>
              </thead> 
              <tbody>
              {products.map((product) => (
                  <tr key={product.id}>
                  <td>{product.Name}</td>
                  <td>{product.SKU}</td>
                  <td>{product.Price}</td>
                  <td>{product.totalSales}</td>
                  </tr>
                  ))}
              </tbody>
          </table>  
        </div>
       </> 
    );
}

export default ProductsTable;