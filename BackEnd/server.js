require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const courseRoutes = require('./routes');

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

app.use('/api', courseRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});