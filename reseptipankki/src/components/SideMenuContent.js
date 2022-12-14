import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
// Sivuvalikossa näytettävien ikonien importtaus.
import {
  BiHome,
  BiBookmarks,
  BiHeart,
  BiSearchAlt2,
  BiPencil,
  BiCamera,
  BiCloudDownload,
  BiCalendarWeek,
  BiShoppingBag,
  BiLogIn,
  BiUserCircle,
} from 'react-icons/bi';
import '../styles/SideMenuContent.css';

/*
Tässä komponentissa on määritetty sovelluksen sivuvalikossa (SideMenu.js)
näytettävät linkit ikoneineen. ToggleMenu on funktio, joka sulkee sivuvalikon.
Sitä tarvitaan tässä, jotta sivuvalikko sulkeutuisi aina linkkiä painettaessa.
*/
const SideMenuContent = ({ toggleMenu }) => {
  return (
    <div className="sideMenuContent">
      <div className="sideMenuLinksContainer">
        <div className="sideMenuLink" onClick={() => toggleMenu()}>
          <Link className="sideMenuLinkText" to="/">
            <BiHome /> Etusivu
          </Link>
        </div>

        <div className="sideMenuLink" onClick={() => toggleMenu()}>
          <Link className="sideMenuLinkText" to="/reseptit">
            <BiHeart /> Omat reseptit
          </Link>
        </div>

        <div className="sideMenuLink" onClick={() => toggleMenu()}>
          <Link className="sideMenuLinkText" to="/listat">
            <BiBookmarks /> Omat listat
          </Link>
        </div>

        <div className="sideMenuDivider" />

        <div className="sideMenuLink" onClick={() => toggleMenu()}>
          <Link className="sideMenuLinkText" to="/haku">
            <BiSearchAlt2 /> Hae reseptejä
          </Link>
        </div>

        <div className="sideMenuLink" onClick={() => toggleMenu()}>
          <Link
            className="sideMenuLinkText"
            to="/uusi"
            state={{ formMode: 'add' }}
          >
            <BiPencil /> Kirjoita resepti
          </Link>
        </div>

        <div className="sideMenuLink" onClick={() => toggleMenu()}>
          <Link className="sideMenuLinkText" to="/kuvaa">
            <BiCamera /> Kuvaa resepti
          </Link>
        </div>

        <div className="sideMenuLink" onClick={() => toggleMenu()}>
          <Link className="sideMenuLinkText" to="/lataa">
            <BiCloudDownload /> Lataa resepti
          </Link>
        </div>

        <div className="sideMenuDivider" />

        <div className="sideMenuLink" onClick={() => toggleMenu()}>
          <Link className="sideMenuLinkText" to="/ateriat">
            <BiCalendarWeek /> Ateriasuunnittelu
          </Link>
        </div>

        <div className="sideMenuLink" onClick={() => toggleMenu()}>
          <Link className="sideMenuLinkText" to="/ostoslistat">
            <BiShoppingBag /> Ostoslistat
          </Link>
        </div>
      </div>

      <div className="loginContainer">
        {localStorage.getItem('user') === null ? (
          <div>
            <Link
              className="sideMenuLinkText loginLink"
              to="/kirjaudu"
              onClick={() => toggleMenu()}
            >
              <BiLogIn /> Kirjaudu
            </Link>

            <Link
              className="sideMenuLinkText"
              to="/rekisteroidy"
              onClick={() => toggleMenu()}
            >
              <BiUserCircle /> Rekisteröidy
            </Link>
          </div>
        ) : (
          <Link
            className="sideMenuLinkText loginLink userLink"
            to="/kayttaja"
            onClick={() => toggleMenu()}
          >
            <BiUserCircle /> Käyttäjä
          </Link>
        )}
      </div>
    </div>
  );
};

// ToggleMenun tyypin määrittäminen funktioksi.
SideMenuContent.propTypes = {
  toggleMenu: PropTypes.func,
};

export default SideMenuContent;
