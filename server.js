const express = require('express');
const nodemailer = require('nodemailer');
const admin = require('firebase-admin');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

// INICIALIZA FIREBASE ADMIN ANTES DE USAR FIRESTORE
const serviceAccount = require('/etc/secrets/serviceAccountKey.json');
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

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

app.post('/ruta/concluir', async (req, res) => {
  const { id } = req.body;
  console.log('ID recibido:', id); // <-- LOG para ver el ID recibido
  if (!id) return res.status(400).json({ error: 'Falta el id de la ruta' });

  try {
    const ref = db.collection('rutas').doc(id);
    const doc = await ref.get();
    if (!doc.exists) {
      console.log('Documento NO existe:', id); // <-- LOG si no existe
      return res.status(404).json({ error: 'Documento no encontrado' });
    }
    await ref.update({ estado: 'concluido' });
    console.log('Documento actualizado:', id); // <-- LOG si se actualiza
    return res.json({ success: true, message: 'Ruta actualizada a concluido' });
  } catch (err) {
    console.error('Error al actualizar:', err); // <-- LOG del error real
    return res.status(500).json({ error: 'No se pudo actualizar la ruta', details: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));