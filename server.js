const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const app = express();
app.use(express.json());
app.use(cors());

app.post('/alerta-desvio', async (req, res) => {
  const { emailDestino, emailOrigen, ubicacionActual } = req.body;

  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // Variable de entorno
      pass: process.env.EMAIL_PASS  // Variable de entorno
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: emailOrigen,
    subject: '¡Alerta de desvío!',
    text: `El usuario ${emailDestino} se ha desviado de la ruta. Última ubicación: ${JSON.stringify(ubicacionActual)}`
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send({ ok: true });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));