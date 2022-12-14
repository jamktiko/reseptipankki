import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import DarkBG from './DarkBG';
import Button from './Button';
import { useNavigate } from 'react-router';
import '../styles/AddModal.css';

/*
Komponentti, joka sisältää modaalin, jossa käyttäjältä kysytään,
haluaako hän etsiä Ateriasuunnittelijaan lisättävän reseptin
Omista Resepteistään vai Hakusivulta.

date: Se päivämäärä, jolle reseptiä ollaan lisäämässä.
setOpenModal: Funktio, joka sulkee modaalin.
rdsAccount: Käyttäjän tunnuksen tiedot kuten ne ovat RDS:ssä.
*/
const MealPlannerAddModal = ({ date, setOpenModal, rdsAccount }) => {
  const navigate = useNavigate();

  return (
    <div>
      <DarkBG toggleMenu={setOpenModal} z={94} />

      <motion.div
        key="mealPlannerAddModal"
        initial={{ y: 700 }} // Näkymän ennen animaatiota (läpinäkyvä)
        animate={{ y: 0 }} // Näkymän animaation jälkeen (näkyvä)
        transition={{ duration: 0.4 }} // Animaation kesto.
        exit={{ y: 700 }} // Tila johon näkymä animoituu sen kadotessa.
        className="addModalContainer"
      >
        <h3>
          Lisää resepti {date.getUTCDate()}.{date.getMonth() + 1}.
        </h3>

        <div
          onClick={() => {
            navigate('/reseptit', {
              state: { mealPlannerDate: date, mealPlannerKId: rdsAccount.k_id },
            });
          }}
        >
          <Button color="secondary" text="Omat reseptit" />
        </div>

        <div
          onClick={() => {
            navigate('/haku', {
              state: { mealPlannerDate: date, mealPlannerKId: rdsAccount.k_id },
            });
          }}
        >
          <Button color="secondary" text="Hae reseptiä" />
        </div>
      </motion.div>
    </div>
  );
};

MealPlannerAddModal.propTypes = {
  date: PropTypes.object,
  setOpenModal: PropTypes.func,
  rdsAccount: PropTypes.any,
};

export default MealPlannerAddModal;
