import styles from './IconsBar.module.css';
import { BsGlobeAmericas } from "react-icons/bs";
import { FaJetFighter } from "react-icons/fa6";
import { FaShieldAlt, FaRegSmile  } from "react-icons/fa";



const IconsBar = () => {
    return (
       <>
         <div className={styles.icons}>

            <div >
                <BsGlobeAmericas className = {styles.icon}/>
                <span className = {styles.iconText}> Gratis frakt och returer</span>
            </div>

            <div >
                <FaJetFighter className = {styles.icon}/>
                <span className = {styles.iconText}> Expressfrakt</span>
            </div>   

            <div >
            <FaShieldAlt className = {styles.icon}/>
                <span className = {styles.iconText}> Säkra betalningar</span>
            </div>

            <div >
                <FaRegSmile  className = {styles.icon}/>
                <span className = {styles.iconText}> Nyheter varje dag</span>
            </div>
        </div>

       </> 
    );
}

export default IconsBar;







      
