import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

/*
Tämä komponentti pimentää koko näkymän taustaa hieman. Laita näkyviin
esim. sivuvalikon tai ikkunoiden tullessa näkyviin. ToggleMenu-parametri
on funktio, joka sulkee pimennyksen päällä olevan sivuvalikon tai ikkunan.
Sitä tarvitaan tässä komponentissa, jotta valikko/ikkuna sulkeutuu kun sen
vierestä painaa (eli käytännössä painaa pimennettyä kohtaa näytöstä).
*/
const DarkBG = ({ toggleMenu }) => {
  return (
    /*
    Diviin lisätään "motion", jonka avulla Framer-motionin animaatiot
    voidaan ottaa käyttöön.
    */
    <motion.div
      key="overlay"
      initial={{ opacity: 0 }} // Näkymän ennen animaatiota (läpinäkyvä)
      animate={{ opacity: 1 }} // Näkymän animaation jälkeen (näkyvä)
      transition={{ duration: 0.25 }} // Animaation kesto.
      exit={{ opacity: 0 }} // Tila johon näkymä animoituu sen kadotessa.
      onClick={() => toggleMenu()}
      onTouchEnd={() => toggleMenu()}
      className="overlay"
    ></motion.div>
  );
};

// toggleMenun tyypin määritys (funktio).
DarkBG.propTypes = {
  toggleMenu: PropTypes.func,
};

export default DarkBG;
