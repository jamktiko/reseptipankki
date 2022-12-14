/* eslint-disable operator-linebreak */
/* eslint-disable max-len */
/* eslint-disable indent */
import { React, useState, useEffect } from 'react';
import Button from './Button';
import ListRecipeAdd from './ListRecipeAdd';
import PropTypes from 'prop-types';
import { useNavigate, Link } from 'react-router-dom';
import getUserRefresh from '../hooks/getUserRefresh';
import { AnimatePresence } from 'framer-motion';
import '../styles/ActionMenuContent.css';
import axios from 'axios';
import fetchIngredients from '../hooks/fetchIngredients';
import Loading from './Loading';
import SocialModal from './SocialModal';
import RecipeReportModal from './RecipeReportModal';
import Message from './Message';
import ShoppingListAddModal from './ShoppingListAddModal';

const RecipeActionMenuContent = ({
  recipeData,
  ingredients,
  toggleMenuOpen,
  openedFromCard,
  recipes,
  setRecipes,
}) => {
  // Luodaan funktio, jolla voidaan navigoida eri sivuille.
  // Tässä tapauksessa hakuun reseptin poistamisen jälkeen.
  const navigate = useNavigate();

  // Tila siitä onko reseptin poistamisvalikko auki.
  const [deleteOptionOpen, toggleOpen] = useState(false);
  // Onko pieni viesti-ikkuna näkyvissä:
  const [showMessage, toggleMessage] = useState(false);

  // Käyttäjän RDS-tietokannasta saatavat tiedot laitetaan tähän tilaan:
  const [rdsAccount, setRdsAccount] = useState();

  // Onko mahdollisen vanhan arvostelun lataus jo suoritettu
  const [reviewLoaded, setReviewLoaded] = useState();
  const [previousReviewId, setPreviousReviewId] = useState();

  // Tieto siitä, onko ListRecipeAdd-komponentti näkyvissä:
  const [LRAOpen, setLRAOpen] = useState(false);
  // Tieto siitä, onko SocialModal-komponentti näkyvissä:
  const [SMOpen, setSMOpen] = useState(false);
  // Tieto siitä, onko RecipeReportModal-komponentti näkyvissä:
  const [RROpen, setRROpen] = useState(false);
  // Tieto siitä, onko ShoppingListAddModal-komponentti näkyvissä:
  const [SLOpen, setSLOpen] = useState(false);

  const [starArray, setStarArray] = useState([
    false,
    false,
    false,
    false,
    false,
  ]);

  if (!ingredients) {
    const { ingredientsData } = fetchIngredients(recipeData.r_id);
    ingredients = ingredientsData;
  }

  const addToOwnRecipes = async () => {
    // Uudisteaan käyttäjän token tällä importoidulla funktiolla.
    // Funktio myös palauttaa käyttäjän tokenit..
    const parsedData = await getUserRefresh();
    const token = parsedData.accessToken.jwtToken;
    const cognitoId = parsedData.idToken.payload.sub;

    // Luodaan reseptiobjekti, joka liitetään post-pyyntöön.
    const recipeObject = {
      nimi: recipeData.nimi,
      ohjeet: recipeData.ohjeet,
      erikoisruokavaliot: recipeData.erikoisruokavaliot,
      kategoriat: recipeData.kategoriat,
      valmistusaika: recipeData.valmistusaika,
      annosten_maara: recipeData.annosten_maara,
      kuva: recipeData.kuva,
      julkinen: 0,
      uusi: 0,
      kayttaja_k_id: rdsAccount[0].k_id,
      ainekset: ingredients,
    };

    axios
      .post(`${process.env.REACT_APP_BACKEND_URL}/api/resepti`, recipeObject, {
        headers: { Authorization: `Bearer ${token}`, cognitoId: cognitoId },
      })
      .then((res) => {
        toggleMessage(true);
        setTimeout(() => {
          toggleMenuOpen(false);
        }, 2000);
      })
      .catch((error) => {
        console.error('Adding recipe failed: ', error);
      });
  };

  // Funktio joka poistaa reseptin.
  const deleteRecipe = async () => {
    // Uudisteaan käyttäjän token tällä importoidulla funktiolla.
    // Funktio myös palauttaa käyttäjän tokenit..
    const parsedData = await getUserRefresh();
    const token = parsedData.accessToken.jwtToken;
    const cognitoId = parsedData.idToken.payload.sub;

    axios
      .delete(
        `${process.env.REACT_APP_BACKEND_URL}/api/resepti/${recipeData.r_id}`,
        {
          headers: { Authorization: `Bearer ${token}`, cognitoId: cognitoId },
        }
      )
      .then((res) => {
        if (openedFromCard) {
          /*
          Jos valikko avattiin reseptikortin kautta, poistetaan kyseinen kortti
          recipes-taulukosta, jossa on kaikki sillä hetkellä näytettävät reseptit.
          */
          const copy = [...recipes].filter((r) => r.r_id !== recipeData.r_id);
          setRecipes([...copy]);
          toggleMenuOpen(false);
        } else {
          /*
          Jos valikkoa ei avattu reseptikortista, se avattiin reseptisivulta,
          jolloin navigoidaan käyttäjä edelliselle sivulle.
          */
          navigate(-1, { state: { formMode: null } });
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  // Funktio jolla adminit voivat lisätä reseptin suositeltuihin.
  const recommend = async () => {
    // Uudisteaan käyttäjän token tällä importoidulla funktiolla.
    // Funktio myös palauttaa käyttäjän tokenit..
    const parsedData = await getUserRefresh();
    const token = parsedData.accessToken.jwtToken;
    const cognitoId = parsedData.idToken.payload.sub;

    // Pyyntö, joka lähettää reseptin tietokantaan:
    axios
      .post(
        `${process.env.REACT_APP_BACKEND_URL}/api/resepti/recommend/${recipeData.r_id}`,
        [],
        {
          headers: {
            authorization: `Bearer ${token}`,
            cognitoId: `"${cognitoId}"`,
          },
        }
      )
      .then((res) => {
        console.log('Recommending was successful: ', res);
        navigate('/');
      })
      .catch((error) => {
        console.error('Recommending failed: ', error);
      });
  };

  /*
  Vaihtaa valikossa näkyvät tähdet siten, että index-luvun määrittämä
  määrä niistä muuttuu keltaisiksi.
  */
  const changeStars = (index) => {
    const copy = [false, false, false, false, false];

    for (let i = 0; i <= index; i++) {
      copy[i] = true;
    }

    setStarArray([...copy]);
  };

  // UseEffectissä ladataan käyttäjän k_id, jotta voidaan
  // tarkistaa onko resepti käyttäjän oma vai jonkun muun.
  useEffect(() => {
    // Ladataan käyttäjätiedot localStoragesta...
    const userData = localStorage.getItem('user');
    // ...ja muunnetaan ne takaisin objektiksi...
    const parsedData = JSON.parse(userData);
    // ...josta saadaan cognito_id, millä voidaan hakea
    // käyttäjän ID rds-tietokannassa.
    axios
      .get(
        // eslint-disable-next-line max-len
        `${process.env.REACT_APP_BACKEND_URL}/api/kayttaja/cid/"${parsedData?.idToken.payload['cognito:username']}"`
      )
      .then((res) => {
        setRdsAccount(res.data);

        /*
        Tarkistetaan onko kirjautunut käyttäjä sama kuin katsotun reseptin
        omistaja. Jos EI ole, katsotaan, onko käyttäjä arvostellut reseptin
        aiemmin. Tämä siitä syystä että omia reseptejä ei voi arvostella,
        joten näin voidaan välttyä turhilta queryiltä.
        */
        if (res.data[0]?.k_id !== recipeData.Kayttaja_k_id) {
          axios
            .post(
              `${process.env.REACT_APP_BACKEND_URL}/api/arvostelu/userrecipe`,
              {
                Kayttaja_k_id: res.data[0].k_id,
                Resepti_r_id: recipeData.r_id,
              }
            )
            .then((res) => {
              // Lataus on valmis, joten muutetaan tätä tilaa:
              setReviewLoaded(true);

              // Jos vanhempi arvostelu löytyi, laitetaan sen tiedot tiloihin:
              if (res.data) {
                setPreviousReviewId(res.data.a_id);
                changeStars(res.data.arvostelu - 1);
              }
            })
            .catch((error) => {
              console.error('Error fetching reviews: ', error);
            });
        } else {
          setReviewLoaded(true);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  if (!rdsAccount) return <Loading />;

  // Muuttaa keltaisten tähtien määrän ja lähettää arvostelun tietokantaan.
  const changeRating = async (index) => {
    /*
    Ensin tarkistetaan kuitenkin, että lataus, jossa haetaan mahdollinen
    aiempi arvostelu, on jo suoritettu.
    */
    if (reviewLoaded) {
      changeStars(index);

      const ratingObject = {
        arvostelu: index + 1,
        Resepti_r_id: recipeData.r_id,
        Kayttaja_k_id: rdsAccount[0].k_id,
      };

      // Uudisteaan käyttäjän token tällä importoidulla funktiolla.
      // Funktio myös palauttaa käyttäjän tokenit..
      const parsedData = await getUserRefresh();
      const token = parsedData.accessToken.jwtToken;
      const cognitoId = parsedData.idToken.payload.sub;

      if (previousReviewId) {
        axios
          .put(
            `${process.env.REACT_APP_BACKEND_URL}/api/arvostelu/${previousReviewId}`,
            ratingObject,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                cognitoId: cognitoId,
              },
            }
          )
          .then((res) => {})
          .catch((error) => {
            console.error('Adding rating failed: ', error);
          });
      } else {
        axios
          .post(
            `${process.env.REACT_APP_BACKEND_URL}/api/arvostelu`,
            ratingObject,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                cognitoId: cognitoId,
              },
            }
          )
          .then((res) => {})
          .catch((error) => {
            console.error('Adding rating failed: ', error);
          });
      }
    }
  };

  return (
    <div className="actionMenuContent">
      {/*
      - Jos reseptin lisännyt käyttäjä on sama kuin joka on kirjautunut
      sovellukseen, näytetään reseptin poistamisnappi.
      - Jos resepti ei ole kirjautuneen käyttäjän lisäämä, näytetään sen
      paikalla "Lisää omiin resepteihin" -nappi. Sitä ei tarvitse näyttää
      käyttäjän omissa resepteissä, sillä käyttäjän itse lisäämät reseptit
      löytyvät aina hänen Omista Resepteistään.
      */}
      {rdsAccount !== undefined &&
      rdsAccount.length !== 0 &&
      rdsAccount[0]?.k_id === recipeData?.Kayttaja_k_id ? (
        <div>
          <button className="buttonInvisible width100">
            <Link
              className="actionMenuLink"
              to={'/muokkaa'}
              state={{
                recipeData: recipeData,
                ingredientsData: ingredients,
                formMode: 'edit',
              }}
            >
              <p className="editButton">Muokkaa</p>
            </Link>
          </button>

          <div className="divider" />

          {deleteOptionOpen ? (
            <div>
              <p>Haluatko varmasti poistaa reseptin?</p>
              <div className="twoButtonsDiv">
                <div onClick={() => toggleOpen(!deleteOptionOpen)}>
                  <Button color={'secondary'} text={'Peruuta'} />
                </div>

                <div onClick={() => deleteRecipe()}>
                  <Button color={'warning'} text={'Poista'} />
                </div>
              </div>
            </div>
          ) : (
            <button
              className="buttonInvisible width100"
              onClick={() => toggleOpen(!deleteOptionOpen)}
            >
              <p>Poista</p>
            </button>
          )}

          <div className="divider" />
        </div>
      ) : (
        <div>
          <p>Arvostele resepti</p>

          <div className="starReviewContainer">
            {starArray.map((item, index) => {
              return (
                <div
                  className="starContainer"
                  onClick={() => changeRating(index)}
                  key={index}
                >
                  <img
                    src={
                      starArray[index]
                        ? require('../assets/starFull.png')
                        : require('../assets/star.png')
                    }
                    alt={starArray[index] ? '' : ''}
                  />
                </div>
              );
            })}
          </div>

          <div className="divider" />

          <button
            className="buttonInvisible width100"
            onClick={() => addToOwnRecipes()}
          >
            <p>Lisää omiin resepteihin</p>
          </button>

          <div className="divider" />
        </div>
      )}

      {/* Omiin resepteihin lisäämisen onnistumisesta kertova viesti: */}
      <AnimatePresence>
        {showMessage && (
          <Message
            text="Lisätty omiin resepteihisi!"
            toggle={toggleMessage}
            seconds={1.5}
          />
        )}
      </AnimatePresence>

      <button
        className="buttonInvisible width100"
        onClick={() => setLRAOpen(!LRAOpen)}
      >
        <p>Lisää listalle</p>
      </button>

      {/* Listallelisäysikkuna */}
      <AnimatePresence>
        {LRAOpen && (
          <ListRecipeAdd
            recipeId={recipeData.r_id}
            toggleMenu={setLRAOpen}
            toggleMenuOpen={toggleMenuOpen}
          />
        )}
      </AnimatePresence>

      <div className="divider" />

      <button
        className="buttonInvisible width100"
        onClick={() => setSLOpen(!SLOpen)}
      >
        <p>Lisää ostoslistalle</p>
      </button>

      {/* Listallelisäysikkuna */}
      <AnimatePresence>
        {SLOpen && (
          <ShoppingListAddModal
            setOpenModal={setSLOpen}
            rdsAccount={rdsAccount}
            ingredients={ingredients}
            toggleMenuOpen={toggleMenuOpen}
          />
        )}
      </AnimatePresence>

      <div className="divider" />

      <button
        className="buttonInvisible width100"
        onClick={() => setSMOpen(!SMOpen)}
      >
        <p>Jaa</p>
      </button>

      <AnimatePresence>
        {SMOpen && (
          <SocialModal
            item="resepti"
            toggleMenu={setSMOpen}
            url={
              openedFromCard
                ? `${window.location.href.substring(
                    0,
                    window.location.href.lastIndexOf('/')
                  )}/reseptit/${recipeData.r_id}`
                : window.location.href
            }
          />
        )}
      </AnimatePresence>

      <div className="divider" />

      <button
        className="buttonInvisible width100"
        onClick={() => setRROpen(!RROpen)}
      >
        <p>Ilmianna</p>
      </button>

      <AnimatePresence>
        {RROpen && (
          <RecipeReportModal toggleMenu={setRROpen} recipeData={recipeData} />
        )}
      </AnimatePresence>

      {rdsAccount !== undefined &&
      rdsAccount.length !== 0 &&
      rdsAccount[0]?.isAdmin === 1 ? (
        <div>
          <div className="divider" />

          <button onClick={recommend} className="buttonInvisible width100">
            <p>Lisää suositeltuihin</p>
          </button>
        </div>
      ) : null}
    </div>
  );
};

// parametrin tyypitys
RecipeActionMenuContent.propTypes = {
  recipeData: PropTypes.object,
  ingredients: PropTypes.array,
  toggleMenuOpen: PropTypes.func,
  openedFromCard: PropTypes.bool,
  recipes: PropTypes.any,
  setRecipes: PropTypes.func,
};

export default RecipeActionMenuContent;
