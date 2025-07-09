const express = require('express');
const router = express.Router();
const {addCar, searchCars, getAllCars, editCar, deleteCar} = require('../controller/admin.controller');
const isAuthenticated = require('../middlewares/isAuth');

router.post('/add-car', isAuthenticated, addCar);
router.get('/search-cars', searchCars);
router.get('/get-cars', getAllCars);
router.put('/edit-car/:carID', isAuthenticated, editCar);
router.delete('/delete-car/:carID', isAuthenticated, deleteCar);

module.exports = router;