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
      <main>
        <Outlet />
      </main>
      <IconsBar/>
      <FooterNav />
    </>
  );
}

export default PublicLayout;
