/* eslint-disable operator-linebreak */
import { React } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import '../styles/RecipeCard.css';
import useLongPress from '../hooks/useLongPress';

/*
RecipeCard on komponentti reseptien pienemmille näkymille, eli niille joita
on esimerkiksi hakusivulla ja omissa resepteissä. RecipeCard toimii myös
linkkinä kyseisen reseptin täydelle reseptisivulle.
*/
const RecipeCard = ({
  data,
  deletingMode,
  toggleDeletingMode,
  editRecipesToDelete,
  recipesToDelete,
}) => {
  const recipe = JSON.parse(data);
  // Pohjassa painamisen mahdollistavan hookin käyttöönotto:
  const onLongPress = useLongPress();
  // Navigointifunktion käyttöönotto:
  const navigate = useNavigate();

  /*
  Tieto siitä, onko kortin resepti listaltapoistamistaulukolla.
  Jos on, selected on true, ja sitä käytetään lisäämään kortille
  punainen reuna.
  */
  const selected = recipesToDelete?.includes(recipe.r_id);

  /*
  Funktio, joka ajetaan kun reseptikorttia painetaan pohjassa.
  Tarkistaa ensin, ollaanko listanäkymässä (eli tuleeko
  deletingMode parametrina), sitten tarkistetaan, onko deletingMode
  jo päällä. Jos ei ole, laitetaan se päälle ja lisätään painettu
  resepti poistettaviin.
  */
  const longPressCard = () => {
    if (deletingMode !== undefined) {
      if (deletingMode === false) {
        toggleDeletingMode(true);
        editRecipesToDelete(recipe.r_id);
      }
    }
  };

  // Kortin klikkauksen käsittelevä funktio.
  const cardClicked = () => {
    if (deletingMode) {
      /*
      Jos on käynnissä deleing-moodi, eli listanäkymässä oleva
      tila, jossa voidaan poistaa reseptejä listalta, kutsutaan
      parametrina saatua funktiota jossa käsitellään taulukkoa
      joka sisältää poistettavat listat.
      */
      editRecipesToDelete(recipe.r_id);
    } else {
      /*
      Jos poistomoodi ei ole päällä, listakorttia käytetään
      reseptisivulle navigointiin.
      */
      navigate(`/reseptit/${recipe.r_id}`);
    }
  };

  return (
    <div
      onClick={cardClicked}
      {...onLongPress(() => longPressCard())}
      className={`backgroundSecondaryColor cardContainer ${
        selected ? 'cardSelected' : ''
      }`}
    >
      <div className="cardTexts">
        <h3>{recipe.nimi}</h3>
        <p>{recipe.valmistusaika}</p>
      </div>
      <div className="cardImageDiv">
        <img
          src={recipe.kuva ? recipe.kuva : require('../assets/placeholder.png')}
        />
      </div>
    </div>
  );
};

RecipeCard.propTypes = {
  data: PropTypes.any,
  deletingMode: PropTypes.bool,
  toggleDeletingMode: PropTypes.func,
  editRecipesToDelete: PropTypes.func,
  recipesToDelete: PropTypes.any,
};

export default RecipeCard;
