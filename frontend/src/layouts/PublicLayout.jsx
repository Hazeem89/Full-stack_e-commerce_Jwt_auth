import { Outlet } from 'react-router';

import Header from '../components/Header/Header.jsx';
import TopNav from '../components/TopNav/TopNav';
import IconsBar from '../components/IconsBar/IconsBar';
import FooterNav from '../components/FooterNav/FooterNav';


function PublicLayout() {
  return (
    <>
      <Header />
      <TopNav />
      <main style={{ minHeight: '80vh', padding: '0px 100px', backgroundColor: '#a0a0a0' }}>
        <Outlet />
      </main>
      <IconsBar/>
      <FooterNav />
    </>
  );
}

export default PublicLayout;
