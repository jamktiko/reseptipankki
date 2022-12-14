/*
Route hallitsee sitä mitä metodeja käytetään controllereissa URL osoitteen perusteella.
esimerkki URL GET http://localhost:3000/api/lista/ hakee kaikki listat
*/
const { validateAuth } = require('../auth');
module.exports = (app) => {
  const lista = require('../Controllers/lista.controller.js');

  const router = require('express').Router();

  // Luo uusi lista
  router.post('/', validateAuth, lista.create);

  // Hae kaikki listat
  router.get('/', lista.findAll);

  // Hae lista id:n perusteella
  router.get('/:id', lista.findOne);

  // Hae käyttäjän perusteella
  router.get('/kayttaja/:id', lista.findByUser);

  // Päivitä lista id:n perusteella
  router.put('/:id', validateAuth, lista.update);

  // Poista lista id:n perusteella
  router.delete('/:id', validateAuth, lista.delete);

  // Tämä tulee kaikkien muiden muuttujien eteen
  app.use('/api/lista', router);
};
