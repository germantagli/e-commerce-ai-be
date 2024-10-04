// services/mailer.js
const nodemailer = require('nodemailer');



const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendOTP = async (email, otp) => {
    const mailOptions = {
        from: 'ingles04102024@gmail.com',
        to: email,
        subject: 'Tu código OTP',
        text: `Tu código OTP es: ${otp}`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('OTP enviado');
    } catch (error) {
        console.error('Error al enviar el OTP:', error);
        throw new Error('Error al enviar el OTP'); // Agrega esto para manejar el error en auth.js
    }
};

module.exports = { sendOTP };
