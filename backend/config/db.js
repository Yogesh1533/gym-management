const { Sequelize } = require('sequelize');

const isProd = process.env.NODE_ENV === 'production';

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    dialectOptions: {
      connectTimeout: 10000,
    },
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    if (!isProd) console.log('MySQL Connected');
    await sequelize.sync({ alter: false });
    if (!isProd) console.log('Tables synced');
  } catch (error) {
    console.error('DB Connection Error:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
