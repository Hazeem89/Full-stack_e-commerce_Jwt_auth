import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Accordion, Nav } from 'react-bootstrap';
import styles from './FooterNav.module.css';

const FooterNav = () => {
  

  return (
    <nav >
      <Accordion defaultActiveKey={window.innerWidth < 640 ? [] : ['0', '1', '2']} alwaysOpen className={styles.footNav}>
        <Accordion.Item eventKey="0" className={styles.panel1Default}>
          <Accordion.Header className={styles.panelHeading} >
            <span>Shopping</span>
          </Accordion.Header>
          <Accordion.Body className={styles.accordionBody}>
            <Nav className="flex-column">
              <Nav.Item>
                <Link to="/vinterjackor" className={styles.accordionText}>Vinterjackor</Link>
              </Nav.Item>
              <Nav.Item>
                <Link to="/pufferjackor" className={styles.accordionText}>Pufferjackor</Link>
              </Nav.Item>
              <Nav.Item>
                <Link to="/kappa" className={styles.accordionText}>Kappa</Link>
              </Nav.Item>
              <Nav.Item>
                <Link to="/trenchcoats" className={styles.accordionText}>Trenchcoats</Link>
              </Nav.Item>
            </Nav>
          </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="1" className={styles.panel1Default}>
          <Accordion.Header className={styles.panelHeading}>
            <span>Mina Sidor</span>
          </Accordion.Header>
          <Accordion.Body className={styles.accordionBody}>
            <Nav className="flex-column">
              <Nav.Item>
                <Link to="/mina-ordrar" className={styles.accordionText}>Mina Ordrar</Link>
              </Nav.Item>
              <Nav.Item>
                <Link to="/mitt-konto" className={styles.accordionText}>Mitt Konto</Link>
              </Nav.Item>
            </Nav>
          </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="2" className={styles.panel1Default}>
          <Accordion.Header className={styles.panelHeading}>
            <span>Kundtjänst</span>
          </Accordion.Header>
          <Accordion.Body className={styles.accordionBody}>
            <Nav className="flex-column">
              <Nav.Item>
                <Link to="/returnpolicy" className={styles.accordionText}>Returnpolicy</Link>
              </Nav.Item>
              <Nav.Item>
                <Link to="/integritetspolicy" className={styles.accordionText}>Integritetspolicy</Link>
              </Nav.Item>
            </Nav>
          </Accordion.Body>
        </Accordion.Item>
      <div className={styles.CMark}>
        <span style={{fontSize: "15px"}}>
          <span style={{fontSize: "x-large", fontFamily: "Arial, Helvetica, sans-serif", verticalAlign: "middle", marginRight: "2px"}}>©</span>
          Freaky Fashion
        </span>
      </div>
      </Accordion>
      
    </nav>
  );
};

export default FooterNav;