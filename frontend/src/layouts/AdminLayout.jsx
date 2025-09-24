import { Outlet } from 'react-router';
import {Link} from "react-router";
import '../App.css'


function AdminLayout() {
  return (
    
    <>
      <div className = "AdminHeader">Administration</div>

      <div style={{ display: 'flex' }}>
          <div className = "AdminSide">
            <Link to = "/admin/products" >Produkter</Link>
            <Link to = "/admin/categories" >Kategorier</Link>
          </div>
          <main style={{ padding: '1rem', flex: 1 }}>
              <Outlet />
          </main>
      </div>
    </>
  );
}

export default AdminLayout;
