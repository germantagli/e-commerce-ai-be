// routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const otpGenerator = require('otp-generator');
const { sendOTP } = require('../services/mailer'); 
const tempOTPs = {}; // Asegúrate de que esta línea esté presente

// Inicio de sesión
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Credenciales inválidas' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Credenciales inválidas' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Error al iniciar sesión' });
    }
});

// Cierre de sesión
router.post('/logout', (req, res) => {
    // Aquí podrías manejar la lógica de cierre de sesión
    res.json({ message: 'Sesión cerrada' });
});

// Ruta de registro
router.post('/register', async (req, res) => {
    const { email } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'El usuario ya está registrado' });
        }

        // Genera un OTP
        const otp = otpGenerator.generate(6, { upperCase: false, specialChars: false });

        // Envía el OTP al correo electrónico
        await sendOTP(email, otp);
        
        // Guarda el OTP temporalmente
        tempOTPs[email] = otp;

        // Crea el usuario en la base de datos
        const newUser = new User({ email });
        await newUser.save();

        res.status(201).json({ message: 'OTP enviado, verifica tu correo electrónico' });

    } catch (error) {
        console.error('Error al registrar usuario:', error);
        res.status(500).json({ message: 'Error al registrar usuario' });
    }
});

// Ruta para verificar el OTP
router.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;

    // Verifica si el OTP es correcto
    if (tempOTPs[email] && tempOTPs[email] === otp) {
        // Marca el usuario como verificado
        await User.updateOne({ email }, { isVerified: true });
        delete tempOTPs[email]; // Elimina el OTP una vez verificado
        res.status(200).json({ message: 'Registro completado con éxito' });
    } else {
        res.status(400).json({ message: 'OTP inválido' });
    }
});

module.exports = router;