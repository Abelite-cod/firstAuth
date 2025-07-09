const Car = require("../models/car.schema");
const User = require("../models/user.schema");


// Add a new car
const addCar = async (req, res) => {
    const { make, model, year, price, description, color, brand } = req.body;
    const id = req.user.id; // Assuming user ID is available in req.user

    // Validate input
    if (!make || !model || !year || !price ) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {

    const user = await User.findById(id);
        if (user.isAdmin !== true){
            return res.status(403).json({ message: 'Access denied: Only admins can add cars' });
        }
        // Create new car
        const newCar = new Car({
            make,
            model,
            year,
            price,
            description,
            brand,
            color
        });

        await newCar.save();
        return res.status(201).json({ message: 'Car added successfully', car: newCar });
    } catch (error) {
        console.error('Error adding car:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

// edit a car
const editCar = async (req, res) => {
    const { carID } = req.params;
    const { make, model, year, price, brand, color, description } = req.body;

    // Validate input
    if (!make && !model && !year && !price && !brand && !color && !description) {
        return res.status(400).json({ message: 'At least one field is required to update' });
    }

    try {
        const car = await Car.findById(carID);
        if (!car) {
            return res.status(404).json({ message: 'Car not found' });
        }

        // Update car details
        if (make) car.make = make;
        if (model) car.model = model;
        if (description) car.description = description;
        if (year) car.year = year;
        if (price) car.price = price;
        if (brand) car.brand = brand;
        if (color) car.color = color;

        await car.save();
        return res.status(200).json({ message: 'Car updated successfully', car });
    } catch (error) {
        console.error('Error updating car:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

// delete a car
const deleteCar = async (req, res) => {
    const { carID } = req.params;

    try {
        const car = await Car.findByIdAndDelete(carID);
        if (!car) {
            return res.status(404).json({ message: 'Car not found' });
        }

        return res.status(200).json({ message: 'Car deleted successfully' });
    } catch (error) {
        console.error('Error deleting car:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};
    
// get all cars
const getAllCars = async (req, res) => {
    try {
        const cars = await Car.find();
        return res.status(200).json({ message: 'Cars Aavailable', count: cars.length, cars });
    } catch (error) {
        console.error('Error retrieving cars:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

//endpoint to search for cars by make
const searchCars = async (req, res) => {
    const { make, model, brand } = req.query;

    if (!make && !model && !brand) {
        return res.status(400).json({ message: 'make, model, or brand is required for search' });
    }
    try {
        const cars = await Car.find({ 
            make: new RegExp(make, 'i'),
            model: new RegExp(model, 'i'),
            brand: new RegExp(brand, 'i')
        });
        if (!cars || cars.length === 0) {
            return res.status(404).json({ message: 'No car found for the specified criteria' });
        }
        return res.status(200).json({ message: 'Car retrieved successfully', count: cars.length, cars });
    } catch (error) {
        console.error('Error searching cars:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = {
    addCar,
    editCar,
    deleteCar,
    getAllCars,
    searchCars
};