require('dotenv').config();

const express              = require('express');
const cors                 = require('cors');
const authRoutes           = require('./routes/authRoutes');
const theaterRoutes        = require('./routes/theaterRoutes');
const showsRoutes          = require('./routes/showsRoutes');
const reservationsRoutes   = require('./routes/reservationsRoutes');

const app  = express();
const port = process.env.PORT || 3000;

// MIDDLEWARE BEGIN

app.use(cors());
app.use(express.json());

// MIDDLEWARE END

// ROUTES BEGIN

app.use('/auth',         authRoutes);
app.use('/theaters',     theaterRoutes);
app.use('/shows',        showsRoutes);
app.use('/reservations', reservationsRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

// ROUTES END

// SERVER BEGIN

app.listen(port, () => console.log(`Server running on port ${port}`));

// SERVER END