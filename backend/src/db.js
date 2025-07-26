const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Define the database file path
const DB_PATH = path.resolve(__dirname, 'bank_lending.db');

// Create a new database connection
let db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    // Run migrations to create tables if they don't exist
    db.serialize(() => {
      db.run(`CREATE TABLE IF NOT EXISTS Customers (
        customer_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS Loans (
        loan_id TEXT PRIMARY KEY,
        customer_id TEXT NOT NULL,
        principal_amount REAL NOT NULL,
        total_amount REAL NOT NULL,
        interest_rate REAL NOT NULL,
        loan_period_years INTEGER NOT NULL,
        monthly_emi REAL NOT NULL,
        amount_paid REAL DEFAULT 0,
        balance_amount REAL NOT NULL,
        emis_left INTEGER NOT NULL,
        status TEXT DEFAULT 'ACTIVE',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES Customers(customer_id)
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS Payments (
        payment_id TEXT PRIMARY KEY,
        loan_id TEXT NOT NULL,
        amount REAL NOT NULL,
        payment_type TEXT NOT NULL, -- 'EMI' or 'LUMP_SUM'
        payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (loan_id) REFERENCES Loans(loan_id)
      )`);

      console.log('Database tables checked/created.');
    });
  }
});

module.exports = db;