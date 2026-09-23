const path = require('path');
const { Sequelize } = require('sequelize');

const isProd = process.env.NODE_ENV === 'production';
const dialect = (process.env.DB_DIALECT || 'mysql').toLowerCase();

// SQLite needs no database server, which keeps a single small (free tier) host simple.
// MySQL remains supported for anyone running the original setup.
const sequelize = dialect === 'sqlite'
  ? new Sequelize({
      dialect: 'sqlite',
      storage: process.env.DB_STORAGE || path.join(__dirname, '..', 'data', 'gym.sqlite'),
      logging: false,
    })
  : new Sequelize(
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
    if (dialect === 'sqlite') {
      const fs = require('fs');
      fs.mkdirSync(path.dirname(sequelize.options.storage), { recursive: true });
    }
    await sequelize.authenticate();
    if (dialect === 'sqlite') {
      // WAL lets reads continue while a write is in progress
      await sequelize.query('PRAGMA journal_mode = WAL;');
    }
    if (!isProd) console.log(`Database connected (${dialect})`);
    await sequelize.sync({ alter: false });
    if (!isProd) console.log('Tables synced');
  } catch (error) {
    console.error('DB Connection Error:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB, dialect };
