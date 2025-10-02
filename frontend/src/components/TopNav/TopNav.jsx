import {useState, useEffect} from 'react';
import styles from './TopNav.module.css';
import {Link} from "react-router";


const TopNav = () => {
    
    const [categories, setCategories] = useState([]);
    
        useEffect(() => {
                fetch('http://localhost:8000/categories')
                .then(response => response.json())
                .then(data => setCategories(data))
                .catch(error => console.error('Error fetching categories:', error));
            }, [categories]);

    return (
      <>
        <section>
          <div>
            <ul className={styles.topnav}>
              <li><Link to="/recent">Nyheter</Link></li>
              {categories.map((category) => (
                <li key={category.id}>
                    <Link to={`/categories/${category.name}`}state={{ categoryId: category.id }}>
                    {category.name}
                    </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </>
    );
}

export default TopNav;
