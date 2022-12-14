/* eslint-disable indent */
/* eslint-disable operator-linebreak */
import { React, useState } from 'react';
import '../styles/DownloadRecipe.css';
import Button from './Button';
import Loading from './Loading';
import { BiPaste } from 'react-icons/bi';
import getUserRefresh from '../hooks/getUserRefresh';
import axios from 'axios';
import { useNavigate } from 'react-router';
import covertIngredients from '../hooks/ingredientsConverter';
import { AnimatePresence, motion } from 'framer-motion';

/*
Komponentti näkymälle, jossa käyttäjä voi liittää kopioimansa linkin
tekstikenttään, sekä napin jonka painamisen jälkeen linkin takana
oleva resepti latautuu.
*/
const RecipeDownload = () => {
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [shownError, setError] = useState(null);
  const [loading, toggleLoading] = useState(false);

  /*
  Funktio, joka mahdollistaa leikepöydän liittämisen
  yhdellä napinpainalluksella.
  */
  const pasteClipboard = async () => {
    const text = await navigator.clipboard.readText();
    setUrl(text);
  };

  // Validoidaan, että käyttäjän syöttämä merkkijono on URL.
  const validateUrl = (u) => {
    const pattern = new RegExp(
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' +
        '((\\d{1,3}\\.){3}\\d{1,3}))' +
        '(\\:\\d+)?' +
        '(\\/[-a-z\\d%@_.~+&:]*)*' +
        '(\\?[;&a-z\\d%@_.,~+&:=-]*)?' +
        '(\\#[-a-z\\d_]*)?$',
      'i'
    );
    return pattern.test(u);
  };

  const showErrorMessage = (text, duration) => {
    setError(text);

    setTimeout(() => {
      setError(null);
    }, duration);
  };

  // Funktio joka hoitaa reseptin lataamisen.
  const download = async () => {
    if (validateUrl(url)) {
      toggleLoading(true);

      // Uudistetaan käyttäjän token tällä importoidulla funktiolla.
      // Funktio myös palauttaa käyttäjän tokenit.
      const parsedData = await getUserRefresh();
      const token = parsedData.accessToken.jwtToken;

      /*
      Objekti joka lisätään pyyntöön. Varmistetaan myös, että URL
      on varmasti oikeaa muotoa (alkaa merkkijonolla "https://www.")
      */
      const linkObject = {
        link: url.startsWith('https://')
          ? url
          : url.startsWith('www')
          ? `https://${url}`
          : `https://www.${url}`,
      };

      axios
        .post(`${process.env.REACT_APP_BACKEND_URL}/api/link/`, linkObject, {
          headers: {
            Authorization: `Bearer ${token}`,
            cognitoId: parsedData.idToken.payload.sub,
          },
        })
        .then((res) => {
          const data = res.data;

          if (
            !(
              data.directions === '' &&
              data.name === '' &&
              data.ingredients === []
            )
          ) {
            /*
            Korvataan kaikki yksittäiset rivinvaihdot kahdella rivinvaihdolla,
            ja jos rivinvaihtoja on useampi kuin kaksi, nekin korvataan tasan
            kahdella. Myös rivinvaihtojen totaaliset puutteet, eli tapaukset
            joissa lause päättyy pisteeseen, ja seuraava lause alkaa ilman
            välilyöntiäkään, korvataan kahdella rivinvaihdolla.
            */
            data.directions = data.directions
              .replace(/(\n\s*\n)|(\n)/g, '\n\n')
              .replace(/(?<=[a-z].)(?=[A-Z])/gm, '\n\n');

            /*
            Lähetetään saatu ainesosien tekstidata importattuun funktioon,
            joka muuntaa tekstin lomakkeen vaatimaksi objektitaulukoksi.
            */
            const ingredientsData = data.ingredients
              ? covertIngredients(data.ingredients)
              : null;

            /*
            Reseptin erikoisruokavaliot sisältävä objekti, joka lähetetään
            lomakkeeseen tyhjänä.
            */
            const dietsObject = {
              kasvis: 0,
              maidoton: 0,
              vegaaninen: 0,
              gluteeniton: 0,
              laktoositon: 0,
              kananmunaton: 0,
            };

            /*
            Reseptin kategoriat sisältävä objekti, joka lähetetään
            lomakkeeseen tyhjänä.
            */
            const categoriesObj = {
              juomat: 0,
              keitot: 0,
              salaatit: 0,
              alkuruoat: 0,
              lisukkeet: 0,
              pääruoat: 0,
              välipalat: 0,
              jälkiruoat: 0,
              makeat_leivonnaiset: 0,
              suolaiset_leivonnaiset: 0,
            };

            // Luodaan reseptiobjekti, joka lähetetään lisäyslomakkeeseen:
            const recipeData = {
              nimi: data.name,
              annosten_maara: null,
              erikoisruokavaliot: JSON.stringify(dietsObject),
              julkinen: 0,
              kategoriat: JSON.stringify(categoriesObj),
              ohjeet: data.directions,
              uusi: 1,
              valmistusaika: null,
            };

            /*
            Siirrytään lisäyslomakkeen osoitteeseen, ja laitetaan stateksi sen
            tarvitsemat tiedot.
            */
            navigate('/uusi', {
              state: {
                recipeData: recipeData,
                ingredientsData: ingredientsData,
                formMode: 'copy',
              },
            });
          } else {
            setUrl('');
            toggleLoading(false);
            showErrorMessage(
              'Reseptiä ei löytynyt. Kokeile toisella osoitteella.',
              5000
            );
          }
        })
        .catch((error) => {
          console.error('Error getting recipe: ', error);
          setUrl('');
          toggleLoading(false);
          showErrorMessage('Kyseinen verkkosivu ei ole tuettu.', 5000);
        });
    } else {
      showErrorMessage('Syötä kelvollinen osoite.', 3500);
    }
  };

  return (
    <div className="downloadRecipeContainer">
      {!loading ? (
        <div>
          <h2>Lataa resepti netistä</h2>

          <p>Liitä reseptin URL-osoite:</p>

          <div className="searchBarContainer">
            <input
              value={url}
              onChange={({ target }) => setUrl(target.value)}
              className="searchBar"
              type="text"
            />

            <div onClick={pasteClipboard} className="filterButton">
              <BiPaste className="filterIcon" />
            </div>
          </div>

          <div onClick={() => download()}>
            <Button color="primary" text="Lataa" type="button" />
          </div>
          <div className="downloadRecipeInstructions">
            <p>
              Huom! Reseptin lataus toimii luotettavasti vain kotikokki.net ja
              soppa365.fi sivuilta.
            </p>
          </div>
          <AnimatePresence>
            {shownError && (
              <motion.div
                key="validationErrorMessage"
                transition={{ duration: 0.5 }}
                exit={{ opacity: 0 }}
              >
                <p className="errorMessage">{shownError}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <Loading />
      )}
    </div>
  );
};

export default RecipeDownload;
