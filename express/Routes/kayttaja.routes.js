/*
Route hallitsee sitä mitä metodeja käytetään controllereissa URL osoitteen perusteella.
esimerkki URL GET http://localhost:3000/api/kayttaja/ hakee kaikki käyttäjät
*/
const { validateAuth } = require('../auth');
module.exports = (app) => {
  const kayttaja = require('../Controllers/kayttaja.controller.js');

  const router = require('express').Router();

  // Luo uusi käyttäjä
  router.post('/', kayttaja.create);

  // hae kaikki käyttäjät
  router.get('/', kayttaja.findAll);

  // hae käyttäjä sähköpostin perusteella
  router.get('/email/:id', kayttaja.findByEmail);

  // Hae kaikki adminit
  router.get('/admins', kayttaja.findAllAdmins);

  // Hae cognito käyttäjänimen perusteella
  router.get('/cid/:id', kayttaja.findByCId);

  // Hae käyttäjä id:n perusteella
  router.get('/:id', kayttaja.findOne);

  // Päivitä käyttäjä ID:n perusteella
  router.put('/:id', validateAuth, kayttaja.update);

  // Poista käyttäjä ID:n perusteella
  router.delete('/:id', validateAuth, kayttaja.delete);

  //Tämä tulee kaikkien muiden muuttujien eteen
  app.use('/api/kayttaja', router);
};
