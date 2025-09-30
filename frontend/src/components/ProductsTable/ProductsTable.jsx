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
      });
      }, [products]);

    const deleteProduct = (id) => {
      fetch(`http://localhost:8000/admin/products/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      .then(resp => {
        if (resp.ok) {
          setProducts(products.filter(product => product.id !== id));
        } else {
          console.error('Failed to delete product');
        }
      })
      .catch(error => console.error('Error deleting product:', error));
    }

    return (
      <>
        <div className={styles.parent}>
          <div className={styles.container}>
            <h3>Produkter</h3>
            <button className={styles.button}>
              <Link to="/admin/products/new">Ny produkt</Link>
            </button>
          </div>
        </div>

        <div style={{ justifyItems: "center" }}>
          <table>
            <thead>
              <tr>
                <th>Namn</th>
                <th>SKU</th>
                <th>Pris</th>
                <th>Antal sålda</th>
                <th style={{ textAlign: "center" }}>Radera</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <Link
                      to={`/products/${product.Name}`}
                      state={{ productId: product.id }}
                    >
                      {product.Name}
                    </Link>
                  </td>
                  <td>{product.SKU}</td>
                  <td>{product.Price}</td>
                  <td>{product.totalSales}</td>
                  <td style={{ textAlign: "center" }}>
                    {/* Radera with confirmation as a button */}
                    <button
                      style={{ textAlign: "center" }}
                      className={styles.deleteButton}
                      type="button"
                      title="Radera produkt"
                      onClick={() => {
                        const confirmed = window.confirm(
                          `Är du säker på att du vill radera ${product.Name}?`
                        );
                        if (confirmed) {
                          deleteProduct(product.id);
                        }
                      }}
                    >
                      &nbsp;&nbsp;&#x1F5D1;&nbsp;&nbsp;
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
}

export default ProductsTable;