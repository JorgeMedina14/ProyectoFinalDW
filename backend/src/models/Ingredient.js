const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        default: 1
    },
    unit: {
        type: String,
        default: 'unidad'
    },
    imageUrl: {
        type: String
    },
    detectedAt: {
        type: Date,
        default: Date.now
    },
    confidence: {
        type: Number,
        min: 0,
        max: 1
    },
    verified: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('Ingredient', ingredientSchema);