const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const connectDB = require('../config/db');

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/records', require('./routes/recordRoutes'));
app.use('/api/audit', require('./routes/auditRoutes'));
// swagger UI (optional)
try{
  const swaggerUi = require('swagger-ui-express');
  const swaggerDoc = require('./swagger.json');
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));
}catch(e){ /* optional */ }

app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`)
);
