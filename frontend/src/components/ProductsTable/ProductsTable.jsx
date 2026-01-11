import { useEffect, useState } from 'react'
import {Link} from "react-router";
import api from '../../services/api';
import styles from './ProductsTable.module.css';


const ProductsTable = () => {
  const [products, setProducts] = useState([]);

    useEffect(() => {
      const loadProducts = async () => {
        try {
          const response = await api.get('/products');
          setProducts(response.data);
        } catch (error) {
          console.error('Error loading products:', error);
        }
      };
      loadProducts();
    }, []);

    const deleteProduct = async (id) => {
      try {
        await api.delete(`/admin/products/${id}`);
        setProducts(products.filter(product => product.id !== id));
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product');
      }
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
                <th  style={{ textAlign: "center" }}>Namn</th>
                <th  style={{ textAlign: "center" }}>SKU</th>
                <th  style={{ textAlign: "center" }}>Pris</th>
                <th  style={{ textAlign: "center" }}>Publiceringsdatum</th>
                <th  style={{ textAlign: "center" }}>Antal sålda</th>
                <th  style={{ textAlign: "center" }}>Radera</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td style={{ textAlign: "center" }}> 
                    <Link
                      to={`/products/${product.Name}`}
                      state={{ productId: product.id }}
                    >
                      {product.Name}
                    </Link>
                  </td>
                  <td  style={{ textAlign: "center" }}>{product.SKU}</td>
                  <td  style={{ textAlign: "center" }}>{product.Price}</td>
                  <td  style={{ textAlign: "center" }}>{product.PublicationDate}</td>
                  <td  style={{ textAlign: "center" }}>{product.totalSales}</td>
                  <td  style={{ textAlign: "center" }}>
                    {/* Radera with confirmation as a button */}
                    <button
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