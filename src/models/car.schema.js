const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
    make: {
        type: String,
        required: true
    },
    model: {
        type: String,
        required: true
    },
    year: {
        type: Number,
        required: true,
        min: 1886 // The year the first car was invented
    },
    price: {
        type: Number,
        required: true,
        min: 0 // Price cannot be negative
    },
    isAvailable: {
        type: Boolean,
        default: true // Cars are available by default
    },
    description: {
        type: String,
        required: true
    },
    color: {
        type: String,
        required: true
    },
    brand: {
        type: String,
        required: true
    }
}, {
    timestamps: true,
    versionKey: false // Disable versioning
});

const Car = mongoose.model('Car', carSchema);
module.exports = Car;