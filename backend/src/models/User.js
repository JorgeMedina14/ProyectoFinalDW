const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'El nombre es obligatorio']
    },
    email: {
        type: String,
        required: [true, 'El correo es obligatorio'],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'La contraseña es obligatoria'],
        minlength: 6
    },
    ingredients: [{
        name: String,
        quantity: Number,
        unit: String,
        dateAdded: Date
    }],
    savedRecipes: [{
        title: String,
        ingredients: Array,
        instructions: Array,
        dateAdded: Date
    }],
    weeklyMenu: {
        type: Map,
        of: {
            breakfast: Object,
            lunch: Object,
            dinner: Object
        }
    },
    profileImage: {
        type: String,
        default: 'default-profile.jpg'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Middleware para encriptar la contraseña antes de guardar
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Método para comparar contraseñas
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};

const User = mongoose.model('User', userSchema);

module.exports = User;