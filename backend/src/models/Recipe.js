const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    ingredients_needed: [{
        type: String,
        required: true
    }],
    ingredients_to_buy: [{
        type: String
    }],
    instructions: [{
        type: String,
        required: true
    }],
    prep_time: {
        type: String,
        required: true
    },
    servings: {
        type: Number,
        required: true,
        default: 4
    },
    difficulty: {
        type: String,
        enum: ['Fácil', 'Intermedio', 'Difícil'],
        default: 'Fácil'
    },
    description: {
        type: String,
        default: ''
    },
    cuisine_type: {
        type: String,
        default: 'General'
    },
    meal_type: {
        type: String,
        enum: ['Desayuno', 'Almuerzo', 'Cena', 'Merienda', 'General'],
        default: 'General'
    },
    nutritional_info: {
        calories: {
            type: Number,
            default: 0
        },
        proteins: {
            type: Number, // gramos
            default: 0
        },
        carbohydrates: {
            type: Number, // gramos
            default: 0
        },
        fats: {
            type: Number, // gramos
            default: 0
        },
        fiber: {
            type: Number, // gramos
            default: 0
        },
        sugars: {
            type: Number, // gramos
            default: 0
        },
        vitamins: {
            vitamin_a: { type: Number, default: 0 }, // microgramos
            vitamin_c: { type: Number, default: 0 }, // miligramos
            vitamin_d: { type: Number, default: 0 }, // microgramos
            vitamin_e: { type: Number, default: 0 }, // miligramos
            vitamin_k: { type: Number, default: 0 }, // microgramos
            vitamin_b1: { type: Number, default: 0 }, // miligramos
            vitamin_b2: { type: Number, default: 0 }, // miligramos
            vitamin_b3: { type: Number, default: 0 }, // miligramos
            vitamin_b6: { type: Number, default: 0 }, // miligramos
            vitamin_b12: { type: Number, default: 0 }, // microgramos
            folate: { type: Number, default: 0 } // microgramos
        },
        minerals: {
            calcium: { type: Number, default: 0 }, // miligramos
            iron: { type: Number, default: 0 }, // miligramos
            magnesium: { type: Number, default: 0 }, // miligramos
            phosphorus: { type: Number, default: 0 }, // miligramos
            potassium: { type: Number, default: 0 }, // miligramos
            sodium: { type: Number, default: 0 }, // miligramos
            zinc: { type: Number, default: 0 }, // miligramos
            copper: { type: Number, default: 0 }, // miligramos
            manganese: { type: Number, default: 0 }, // miligramos
            selenium: { type: Number, default: 0 } // microgramos
        }
    },
    is_favorite: {
        type: Boolean,
        default: false
    },
    generated_from_ingredients: [{
        type: String
    }],
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
});

// Middleware para actualizar updated_at en cada modificación
recipeSchema.pre('save', function(next) {
    this.updated_at = Date.now();
    next();
});

// Índices para mejorar el rendimiento
recipeSchema.index({ user: 1 });
recipeSchema.index({ created_at: -1 });
recipeSchema.index({ is_favorite: 1 });

module.exports = mongoose.model('Recipe', recipeSchema);