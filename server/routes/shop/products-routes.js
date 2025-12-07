const express = require('express');
const router = express.Router(); 
const { getFilterProducts, getProductDetails, getBrands, getPriceRange, getTopSoldProducts, getGroups } = require('../../controllers/shop/products-controller');

router.get('/get', getFilterProducts);
router.get('/get/:id', getProductDetails);
router.get('/brands', getBrands);
router.get('/price-range', getPriceRange);
router.get('/top-sold', getTopSoldProducts);
router.get('/groups', getGroups);

module.exports = router;


// ******************    lol Error XD *********/
// const express = require('express');
// const router = require('../admin/products-routes');  <<=====
// const { getFilterProducts} = require('../../controllers/shop/products-controller');

// router.get('/get', getFilterProducts);

// module.exports = router;