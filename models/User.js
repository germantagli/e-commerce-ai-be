const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    isVerified: { type: Boolean, default: false }, // Estado de verificación
});

const User = mongoose.model('User', userSchema);

module.exports = User;