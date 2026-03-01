const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const materialService = require('./services/materialService');
const { onSchedule } = require('firebase-functions/scheduler');
const { generalLimiter } = require('./middleware/securityMiddleware');
const app = express();

app.set('trust proxy', 1);

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(generalLimiter);

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const productRoutes = require('./routes/productRoutes');
const rawQCRoutes = require('./routes/rawQCRoutes');
const rawBatchRoutes = require('./routes/rawBatchRoutes');
const cookedBatchRoutes = require('./routes/cookedBatchRoutes');
const cookedQCRoutes = require('./routes/cookedQCRoutes');
const disputeRoutes = require('./routes/disputeRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/product', productRoutes);
app.use('/api/raw-qc', rawQCRoutes);
app.use('/api/raw-batch', rawBatchRoutes);
app.use('/api/cooked-batch', cookedBatchRoutes);
app.use('/api/cooked-qc', cookedQCRoutes);
app.use('/api/dispute', disputeRoutes);
app.use('/api/inventory', inventoryRoutes);

app.post('/test/daily', (req, res) => {
  console.log('Received test request with body:', req.body);
  materialService.createMaterialSupplyOrders()
    .then(result => {
      console.log('Material calculation complete:', result);
      res.status(200).json({ message: 'Daily material calculation executed successfully', result });
    })
    .catch(error => {
      console.error('Error in daily material calculation:', error);
      res.status(500).json({ message: 'Error executing daily material calculation', error: error.toString() });
    });
});

app.get('/', (req, res) => {
  res.send("Hey there. We've been trying to reach you concerning your vehicle's extended warranty.");
});

exports.app = functions.https.onRequest(app);

exports.dailyMaterialCalculation = onSchedule({
  schedule: '0 19 * * *',
  timeZone: 'Asia/Bangkok'
}, async (context) => {
  try {
    console.log('Running daily material calculation at 7PM');
    const result = await materialService.createMaterialSupplyOrders();
    console.log('Material calculation complete:', result);
    return result;
  } catch (error) {
    console.error('Error in daily material calculation:', error);
    throw error;
  }
})


