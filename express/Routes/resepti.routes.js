/*
Route hallitsee sitä mitä metodeja käytetään controllereissa URL osoitteen perusteella.
esimerkki URL GET http://localhost:3000/api/resepti/ hakee kaikki reseptit
*/

module.exports = (app) => {
  const resepti = require('../controllers/resepti.controller.js');

  const router = require('express').Router();

  // Luo uusi resepti
  router.post('/', resepti.create);

  // hae kaikki reseptit
  router.get('/', resepti.findAll);

  // hae kriteerien perusteella
  router.get('/search', resepti.findByCriteria);

  // Hae kaikki julkiset reseptit
  router.get('/public', resepti.findAllPublic);

  // Hae resepti id:n perusteella
  router.get('/:id', resepti.findOne);

  // Päivitä resepti ID:n perusteella
  router.put('/:id', resepti.update);

  // Poista resepti ID:n perusteella
  router.delete('/:id', resepti.delete);

  //Tämä tulee kaikkien muiden muuttujien eteen
  app.use('/api/resepti', router);
};