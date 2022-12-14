import { React, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import '../styles/ListRecipeAdd.css';
import DarkBG from './DarkBG';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import getUserRefresh from '../hooks/getUserRefresh';
import Button from './Button';
import ListModal from './ListModal';
import Message from './Message';

const ListRecipeAdd = ({ recipeId, toggleMenu, toggleMenuOpen }) => {
  const [lists, setLists] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [userData, setUserData] = useState();
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showMessage, toggleShowMessage] = useState(false);

  // Listalle lisäämisestä vastaava funktio:
  const addToList = async (id) => {
    // Uudistetaan käyttäjän token tällä importoidulla funktiolla.
    // Funktio myös palauttaa käyttäjän tokenit.
    const parsedData = await getUserRefresh();
    const token = parsedData.accessToken.jwtToken;

    const listRecipeObject = {
      Lista_l_id: id,
      Resepti_r_id: recipeId,
    };

    axios
      .post(
        `${process.env.REACT_APP_BACKEND_URL}/api/lista_has_resepti/`,
        listRecipeObject,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            cognitoId: parsedData.idToken.payload.sub,
          },
        }
      )
      .then((res) => {
        toggleShowMessage(true);
        setTimeout(() => {
          toggleMenu(false); // Sulkee listallelisäysikkunan
          toggleMenuOpen(false); // Sulkee reseptitoiminnallisuusvalikon
        }, 2000);
      })
      .catch((error) => {
        console.error('Error adding recipe to list: ', error);
        setErrorMessage('Resepti on jo kyseisellä listalla!');
        setTimeout(() => {
          setErrorMessage('');
        }, 3500);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    // Ladataan käyttäjätiedot localStoragesta...
    const userDataLS = localStorage.getItem('user');
    // ...ja muunnetaan ne takaisin objektiksi...
    const parsedUserData = JSON.parse(userDataLS);
    setUserData(parsedUserData);
    // Otetaan käyttäjän cognito_id talteen.
    const cognitoId = parsedUserData.idToken.payload.sub;

    // Pyyntö, joka hakee käyttäjän listat cognito id:n perusteella.
    axios
      .get(
        `${process.env.REACT_APP_BACKEND_URL}/api/lista/kayttaja/${cognitoId}`
      )
      .then((res) => {
        // Palautuneet listat laitetaan lists-tilaan:
        setLists(res.data);
      })
      .catch((error) => {
        /*
        Virheilmoitus tulostetaan vain jos virhe on muu kuin se, että
        listoja ei ole, eli 404.
        */
        if (error.response?.status !== 404) {
          console.error('Error fetching lists: ', error);
        }
      });
  }, []);

  return (
    <div>
      <DarkBG toggleMenu={toggleMenu} z={94} />
      <motion.div
        key="listRecipeAddMenu"
        initial={{ y: 500 }} // Näkymän sijainti ennen animaatiota
        animate={{ y: 0 }} // Näkymän sijainti animaation jälkeen
        transition={{ duration: 0.3, ease: 'easeOut' }} // Kesto ja pehmennys
        exit={{ y: 500 }} // Sijainti johon näkymää menee kadotessaan.
        className="listRecipeAddContainer"
      >
        <h3>Lisää listalle</h3>

        <div className="addToListsContainer">
          {lists && lists.length > 0 ? (
            <div>
              {lists.map((item, index) => {
                return (
                  <button
                    key={index}
                    onClick={() => addToList(item.l_id)}
                    className="buttonInvisible listRecipeAddButton"
                  >
                    <p>{item.nimi}</p>
                  </button>
                );
              })}
            </div>
          ) : (
            <div>
              {!loading && (
                <p className="centerText">Sinulla ei ole listoja.</p>
              )}
            </div>
          )}
        </div>

        {/* Lisäyksen jälkeen näkyviin laitetaan pieni ilmoitus: */}
        <AnimatePresence>
          {showMessage && (
            <Message
              text="Lisääminen onnistui!"
              toggle={toggleShowMessage}
              seconds={1.5}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {errorMessage ? (
            <motion.div
              key="listErrorMessage"
              transition={{ duration: 0.5 }}
              exit={{ opacity: 0 }}
            >
              <p className="errorMessage">{errorMessage}</p>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div onClick={() => setOpenModal(true)}>
          <Button color="secondary" text="Luo lista" type="button" />
        </div>
      </motion.div>

      <AnimatePresence>
        {openModal && (
          <ListModal
            setOpenModal={setOpenModal}
            parsedUserData={userData}
            lists={lists}
            setLists={setLists}
            editMode={false}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

ListRecipeAdd.propTypes = {
  recipeId: PropTypes.any,
  toggleMenu: PropTypes.func,
  toggleMenuOpen: PropTypes.func,
};

export default ListRecipeAdd;
