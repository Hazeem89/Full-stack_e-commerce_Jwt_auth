import styles from './TopNav.module.css';
import {Link} from "react-router";




const TopNav = () => {


    return (
       <> 
       <section >
                    <div >
                        <ul className = {styles.topnav}>
                            <li><Link to ={'/'}>Nyheter</Link></li>
                            <li><Link to ={'/'}>Topplistan</Link></li>
                            <li><Link to ={'/'}>Rea</Link></li>
                            <li><Link to ={'/'}>Kampanjer</Link></li>
                        </ul>
                    </div>
                </section>
       </> 
    );
}

export default TopNav;
