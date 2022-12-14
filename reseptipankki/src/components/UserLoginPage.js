/* eslint-disable operator-linebreak */
import { React, useState } from 'react';
import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
} from 'amazon-cognito-identity-js';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';
import '../styles/UserRegisterLoginPage.css';
import { Link, useNavigate } from 'react-router-dom';

/*
Aws cognitosta löytyvät avaimet userPoolid ja ClientId liitetään
muuttujaan poolData.
*/
const poolData = {
  UserPoolId: 'eu-west-1_oa2A5XgI9',
  ClientId: '2cboqa7m7hiuihabauuoca2stt',
};

const UserLoginPage = () => {
  const navigate = useNavigate();

  const UserPool = new CognitoUserPool(poolData);

  /*
  importoitu funktio usestate otetaan käyttöön jokaisessa muuttujassa
  joita käytetään tietojen syöttöön. Set -alkuista funktiota
  käytetään tiedon syöttämiseen. Alkuarvot ovat oletuksena tyhjiä.
  */
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Käyttäjälle näkyvä validointivirheilmoituksen tila:
  const [errorMessage, setErrorMessage] = useState('');

  // Funktio joka lähettää lomakkeen käyttäjätiedot.
  // event.preventDefault() estää sivun uudelleenlatautumisen.
  const onSubmit = (event) => {
    event.preventDefault();

    const user = new CognitoUser({
      Username: email,
      Pool: UserPool,
    });

    /* attribuutit joilla käyttäjä kirjautuu selaimesta. Syötteitä verrataan
    cognitosta löytyviin käyttäjätietoihin */
    const authDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    });

    user.authenticateUser(authDetails, {
      onSuccess: (cognData) => {
        // Laitetaan kirjautumistiedot localStorageen:
        localStorage.setItem('user', JSON.stringify(cognData));

        // Onnistuneesti kirjautunut käyttäjä ohjataan etusivulle:
        navigate('/');
      },

      onFailure: (err) => {
        console.error('err: ', err);

        // Jos kirjautuminen epäonnistuu, näytetään tämä virheilmoitus:
        setErrorMessage(
          err.code !== 'UserNotConfirmedException'
            ? 'Sähköpostiosoite tai salasana on virheellinen!'
            : 'Tunnuksen sähköpostiosoitetta ei ole vahvistettu!'
        );

        setTimeout(() => {
          setErrorMessage('');
        }, 4000);
      },

      newPasswordRequired: (data) => {
        console.log('newPasswordRequired:', data);
      },
    });
  };

  return (
    <div className="accountFormContainer">
      <div>
        <h1 className="formHeader">Kirjautuminen</h1>
      </div>

      <div>
        <form onSubmit={onSubmit}>
          <div className="accountFormRow">
            <p>Sähköposti</p>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="text"
            />
          </div>

          <div className="accountFormRow">
            <p>Salasana</p>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              autoComplete="on"
            />
          </div>

          <div className="accountFormSubmitButton">
            <Button color="primary" text="Kirjaudu sisään" type="submit" />
          </div>

          <div className="loginPageLinkContainer">
            <Link className="loginPageLink" to="/rekisteroidy">
              Tee uusi käyttäjätunnus
            </Link>
          </div>

          <div className="loginPageLinkContainer">
            <Link className="loginPageLink" to="/uusi_salasana">
              Unohditko salasanasi?
            </Link>
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

export default UserLoginPage;
