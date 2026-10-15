const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const errorHandler = require('./middlewares/error.middleware');

const authRoutes = require('./routes/auth.routes');
const otpRoutes = require('./routes/otp.routes');
const visitorRoutes = require('./routes/visitor.routes');
const approvalRoutes = require('./routes/approval.routes');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date() });
});

app.use('/api/auth', authRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/visitors', visitorRoutes);
app.use('/api/approvals', approvalRoutes);

app.use(errorHandler);

module.exports = app;
