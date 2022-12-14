/* eslint-disable no-unused-vars */
/* eslint-disable operator-linebreak */
/* eslint-disable camelcase */
import { React, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';
import UserAgreement from './UserAgreement';
import UserWelcomePage from './UserWelcomePage';
import '../styles/UserRegisterLoginPage.css';
import { useNavigate } from 'react-router';

/*
UserRegisterPage on tämän tiedoston varsinainen pääkomponentti.
Se sisältää lomakkeen, jolla käyttäjä voi rekisteröityä.
*/
const UserRegisterPage = () => {
  const navigate = useNavigate();

  // Lomakkeen tekstikenttien arvojen tilat:
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [given_name, setGivenname] = useState('');
  const [family_name, setFamilyname] = useState('');
  // Onko käyttäjä hyväksynyt käyttöehdot:
  const [agreement, toggleAgreement] = useState(false);
  // Onko käyttöehdot näyttävä sivu auki:
  const [agreementPage, toggleAgreementPage] = useState(false);

  // Käyttäjälle näkyvä validointivirheilmoituksen tila:
  const [errorMessage, setErrorMessage] = useState('');
  // Tieto siitä mikä lomakkeen tila ei läpäise validointia:
  const [errorHighlight, setErrorHighlight] = useState('');

  const validationError = (msg) => {
    setErrorMessage(msg);
    setTimeout(() => {
      setErrorMessage('');
    }, 4000);
  };

  /* rekisteröi käyttäjän ensin RDS:n,
  ja sen onnistuttua rekisteröi käyttäjän Cognitoon */
  const registerUser = () => {
    // Käyttäjälle laitetaan oletuksena kaikki erikoisruokavaliot falseina.
    const dietsObject = {
      kasvis: false,
      maidoton: false,
      vegaaninen: false,
      gluteeniton: false,
      laktoositon: false,
      kananmunaton: false,
    };

    // luodaan käyttäjäobjekti, joka liitetään post-pyyntöön.
    const userObject = {
      enimi: given_name, // saadaan lomakkeesta
      snimi: family_name, // saadaan lomakkeesta
      email: email.toLowerCase(), // saadaan lomakkeesta
      password: password,
      cognito_id: null, // saadaan Cognitosta, updatetaan myöhemmin
      isAdmin: 0, // oletuksena ei ole admin
      erikoisruokavaliot: JSON.stringify(dietsObject), // erikoisruokavaliot
    };
    // RDS-tietokantaan lisäys
    axios
      .post(`${process.env.REACT_APP_BACKEND_URL}/api/kayttaja/`, userObject)
      .then(() => {
        navigate('/tervetuloa');
      })
      .catch((err) => {
        if (err.code === 'ERR_BAD_RESPONSE') {
          validationError('Sähköposti on jo käytössä!');
        } else {
          console.error('Adding user to RDS failed: ', err);
        }
      });
  };

  // Funktio, joka tarkistaa, onko lomakkeen tiedot oikein.
  // Jos on, palauttaa true, muuten false.
  const validate = () => {
    if (!given_name || given_name.length < 2) {
      setErrorHighlight('given_name');
      validationError('Lisää kelvollinen etunimi!');
      return false;
    }

    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      setErrorHighlight('email');
      validationError('Lisää kelvollinen sähköpostiosoite!');
      return false;
    }

    if (!password || password.length < 8) {
      setErrorHighlight('password');
      validationError('Salasanassa on oltava vähintään kahdeksan merkkiä!');
      return false;
    }

    if (password !== passwordConfirm) {
      setErrorHighlight('passwordConfirm');
      validationError('Salasanat eivät täsmää!');
      return false;
    }

    if (!agreement) {
      validationError('Käyttöehdot on hyväksyttävä!');
      return false;
    }

    return true;
  };

  // Funktio joka lähettää lomakkeen käyttäjätiedot.
  // event.preventDefault() estää sivun uudelleenlatautumisen.
  const onSubmit = (event) => {
    event.preventDefault();

    if (validate()) {
      /*
      Kutsuu registerUser-funktiota, joka lisää käyttäjän
      RDS-tietokantaan ja Cognitoon
      */
      registerUser();
    }
  };

  return (
    <div className="accountFormContainer">
      <div>
        <h1 className="formHeader">Rekisteröidy</h1>
        <p className="formInfoText">Pakolliset kentät merkitty *</p>
      </div>

      <div>
        <form onSubmit={onSubmit}>
          <div className="accountFormRow">
            <p
              className={
                errorHighlight === 'given_name' ? 'inputLabelError' : null
              }
            >
              Etunimi <span className="asterix">*</span>
            </p>

            <input
              value={given_name}
              onChange={(event) => setGivenname(event.target.value)}
              type="text"
              className={errorHighlight === 'given_name' ? 'inputError' : null}
              onClick={() => {
                if (errorHighlight === 'given_name') setErrorHighlight('');
              }}
            />
          </div>

          <div className="accountFormRow">
            <p
              className={
                errorHighlight === 'family_name' ? 'inputLabelError' : null
              }
            >
              Sukunimi
            </p>
            <input
              value={family_name}
              onChange={(event) => setFamilyname(event.target.value)}
              type="text"
              className={errorHighlight === 'family_name' ? 'inputError' : null}
              onClick={() => {
                if (errorHighlight === 'family_name') setErrorHighlight('');
              }}
            />
          </div>

          <div className="invisibleDivider" />

          <div className="accountFormRow">
            <p
              className={errorHighlight === 'email' ? 'inputLabelError' : null}
            >
              Sähköposti <span className="asterix">*</span>
            </p>

            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="text"
              className={errorHighlight === 'email' ? 'inputError' : null}
              onClick={() => {
                if (errorHighlight === 'email') setErrorHighlight('');
              }}
            />
          </div>

          <div className="invisibleDivider" />

          <div className="accountFormRow">
            <p
              className={
                errorHighlight === 'password' ||
                errorHighlight === 'passwordConfirm'
                  ? 'inputLabelError'
                  : null
              }
            >
              Salasana (vähintään 8 merkkiä) <span className="asterix">*</span>
            </p>

            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              autoComplete="on"
              className={
                errorHighlight === 'password' ||
                errorHighlight === 'passwordConfirm'
                  ? 'inputError'
                  : null
              }
              onClick={() => {
                if (
                  errorHighlight === 'password' ||
                  errorHighlight === 'passwordConfirm'
                ) {
                  setErrorHighlight('');
                }
              }}
            />
          </div>

          <div className="accountFormRow">
            <p
              className={
                errorHighlight === 'passwordConfirm' ? 'inputLabelError' : null
              }
            >
              Salasana uudelleen <span className="asterix">*</span>
            </p>

            <input
              value={passwordConfirm}
              onChange={(event) => setPasswordConfirm(event.target.value)}
              type="password"
              autoComplete="on"
              className={
                errorHighlight === 'passwordConfirm' ? 'inputError' : null
              }
              onClick={() => {
                if (errorHighlight === 'passwordConfirm') setErrorHighlight('');
              }}
            />
          </div>

          <div className="userAgreementContainer">
            <input
              onChange={() => toggleAgreement(!agreement)}
              type="checkbox"
              id="userAgreement"
              name="userAgreement"
            />
            <div className="agreementText">
              <label htmlFor="userAgreement">Hyväksyn sovelluksen </label>
              <span
                onClick={() => toggleAgreementPage(true)}
                className="agreementLink"
              >
                käyttöehdot
              </span>
            </div>
          </div>

          {agreementPage && <UserAgreement togglePage={toggleAgreementPage} />}

          <div className="accountFormSubmitButton">
            <Button color="primary" text="Rekisteröidy" type="submit" />
          </div>

          <AnimatePresence>
            {errorMessage ? (
              <motion.div
                key="validationErrorMessage"
                transition={{ duration: 0.5 }}
                exit={{ opacity: 0 }}
              >
                <p className="errorMessage">{errorMessage}</p>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </form>
      </div>
    </div>
  );
};

export default UserRegisterPage;
