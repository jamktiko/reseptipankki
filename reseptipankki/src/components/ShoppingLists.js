import { React, useState, useEffect } from 'react';
import '../styles/ShoppingLists.css';
import PropTypes from 'prop-types';
import ShopModal from './ShopModal.js';
import { AnimatePresence } from 'framer-motion';
import axios from 'axios';
import ShoppingCard from './ShoppingCard';
import Loading from './Loading';

/*
Näkymä käyttäjän ostoslistoille. Sisältää painikkee, josta uusi
ostoslista voidaan luoda, sekä kaikki käyttäjän ostoslistat.
*/
const ShoppingLists = ({}) => {
  // Tieto, onko lisäysikkuna näkyvissä
  const [openModal, setOpenModal] = useState(false);

  // Tila johon laitetaan näytettävät listat:
  const [shopLists, setShopLists] = useState([]);

  // Tila siitä onko lataus vielä käynnissä:
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ladataan käyttäjätiedot localStoragesta...
    const userData = localStorage.getItem('user');
    // ...ja muunnetaan ne takaisin objektiksi...
    const parsedData = JSON.parse(userData);

    // Haetaan käyttäjän tiedot tietokannasta.
    axios
      .get(
        // eslint-disable-next-line max-len
        `${process.env.REACT_APP_BACKEND_URL}/api/kayttaja/cid/"${parsedData?.idToken.payload['cognito:username']}"`
      )
      .then((res) => {
        // Hae käyttäjän ostoslistat tietokannasta:
        axios
          .get(
            // eslint-disable-next-line max-len
            `${process.env.REACT_APP_BACKEND_URL}/api/ostoslista/kayttaja/${res.data[0].k_id}`
          )
          .then((res) => {
            setShopLists(res.data);
          })
          .catch((error) => {
            console.error('Fetching shopping lists failed: ', error.message);
          })
          .finally(() => {
            setLoading(false);
          });
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  return (
    <div className="shoppingContainer">
      <div className="headLine">
        <h2 className="header">Ostoslistat</h2>
        <div className="shopListModalButton">
          <button
            onClick={() => setOpenModal(true)}
            className="buttonInvisible"
          >
            + UUSI
          </button>
        </div>
      </div>

      <AnimatePresence>
        {openModal && (
          <ShopModal
            setOpenModal={setOpenModal}
            shopLists={shopLists}
            setShopLists={setShopLists}
            editMode={false}
          />
        )}
      </AnimatePresence>

      {!loading ? (
        <div>
          {shopLists.length > 0 ? (
            <div>
              {shopLists.map((item, index) => {
                return (
                  <ShoppingCard
                    key={index}
                    shopList={item}
                    shopLists={shopLists}
                    setShopLists={setShopLists}
                  />
                );
              })}
            </div>
          ) : (
            <div>
              <p className="greyText centerText">
                Et ole lisännyt yhtään ostoslistaa.
              </p>
            </div>
          )}
        </div>
      ) : (
        <Loading />
      )}
    </div>
  );
};

ShoppingLists.propTypes = {
  shoplist: PropTypes.any,
  setshoplist: PropTypes.any,
};

export default ShoppingLists;
