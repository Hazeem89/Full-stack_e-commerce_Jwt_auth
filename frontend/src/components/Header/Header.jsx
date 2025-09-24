import { useState } from 'react'
import { useNavigate } from "react-router"
import {Link} from "react-router";
import styles from './Header.module.css';
import { BsHeartFill, BsBasket2Fill, BsSearch } from "react-icons/bs";


const Header = () => {

    const [query, setQuery] = useState("");
    const navigate = useNavigate();

    const handleSearch = (e) => {
        if (e.key === "Enter" && query.trim() !== "") {
        navigate(`/search?q=${query}`);
        }
    };


    return (

       <> 

        <div className = {styles.header}>
            <span className = {styles.logo}>
                <Link to ={'/'} >
                <img src="/assets/logo.png" alt="logo" />
                </Link>
            </span>
            
            

            <div className = {styles.headerRight}>

                <span className={styles.searchBox}>
                    <input
                        name="search"
                        type="text"
                        placeholder="Sök produkt..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleSearch} // Detect "Enter" key
                    />
                    
                    <span
                        className={styles.searchIcon}
                        onClick={() => {
                        if (query.trim() !== "") {
                            navigate(`/search?q=${query}`);
                        }
                        }}>
                        <BsSearch />
                    </span>
                </span>

                <span className = {styles.heartIcon}>
                    <Link to = {'/'} >
                        <BsHeartFill/>
                    </Link>
                </span>    
                <span className = {styles.cartIcon}>
                    <Link to = {'/'} >
                            <BsBasket2Fill/>
                    </Link>
                </span>
                
            </div>
                
        </div>

       </> 
       ); 
}

export default Header;



