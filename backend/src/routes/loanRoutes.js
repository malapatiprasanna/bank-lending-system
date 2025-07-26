const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');

const router = express.Router();

/**
 * LEND: Create a new loan
 * Endpoint: POST /api/v1/loans
 * Description: Creates a new loan for a customer.
 * Request Body: { "customer_id": "string", "loan_amount": "number", "loan_period_years": "number", "interest_rate_yearly": "number" }
 */
router.post('/loans', (req, res) => {
  const { customer_id, loan_amount, loan_period_years, interest_rate_yearly } = req.body;

  // Basic validation
  if (!customer_id || typeof loan_amount !== 'number' || typeof loan_period_years !== 'number' || typeof interest_rate_yearly !== 'number' || loan_amount <= 0 || loan_period_years <= 0 || interest_rate_yearly < 0) {
    return res.status(400).json({ message: 'Invalid input data.' });
  }

  // Check if customer exists, if not, create a dummy one for simplicity
  db.get('SELECT customer_id FROM Customers WHERE customer_id = ?', [customer_id], (err, row) => {
    if (err) {
      console.error('Database error checking customer:', err.message);
      return res.status(500).json({ message: 'Internal server error.' });
    }

    if (!row) {
      // Customer does not exist, create a new one (simple approach for assignment)
      db.run('INSERT INTO Customers (customer_id, name) VALUES (?, ?)', [customer_id, `Customer ${customer_id}`], (err) => {
        if (err) {
          console.error('Database error creating customer:', err.message);
          return res.status(500).json({ message: 'Internal server error.' });
        }
        console.log(`Customer ${customer_id} created.`);
        createLoan();
      });
    } else {
      createLoan();
    }
  });

  const createLoan = () => {
    try {
      // Calculations as per document:
      // Total Interest (I) = P * N * (R / 100)
      const total_interest = loan_amount * loan_period_years * (interest_rate_yearly / 100);
      // Total Amount (A) = P + I
      const total_amount_payable = loan_amount + total_interest;
      // Monthly EMI = A / (N * 12)
      const monthly_emi = total_amount_payable / (loan_period_years * 12);

      const loan_id = uuidv4();
      const balance_amount = total_amount_payable;
      const emis_left = loan_period_years * 12;

      const stmt = db.prepare(`INSERT INTO Loans (loan_id, customer_id, principal_amount, total_amount, interest_rate, loan_period_years, monthly_emi, amount_paid, balance_amount, emis_left, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
      stmt.run(
        [
          loan_id,
          customer_id,
          loan_amount,
          total_amount_payable,
          interest_rate_yearly,
          loan_period_years,
          parseFloat(monthly_emi.toFixed(2)), // Store EMI with 2 decimal places
          0, // amount_paid starts at 0
          parseFloat(balance_amount.toFixed(2)), // Store balance with 2 decimal places
          emis_left,
          'ACTIVE'
        ],
        function (err) {
          if (err) {
            console.error('Database error creating loan:', err.message);
            return res.status(500).json({ message: 'Internal server error.' });
          }
          res.status(201).json({
            loan_id: loan_id,
            customer_id: customer_id,
            total_amount_payable: parseFloat(total_amount_payable.toFixed(2)),
            monthly_emi: parseFloat(monthly_emi.toFixed(2))
          });
        }
      );
      stmt.finalize();
    } catch (error) {
      console.error('Error during loan creation calculation:', error);
      res.status(500).json({ message: 'Error processing loan creation.' });
    }
  };
});

/**
 * PAYMENT: Record a payment for a loan
 * Endpoint: POST /api/v1/loans/{loan_id}/payments
 * Description: Records a payment (EMI or lump sum) against a specific loan.
 * Request Body: { "amount": "number", "payment_type": "enum" }
 */
router.post('/loans/:loan_id/payments', (req, res) => {
  const { loan_id } = req.params;
  const { amount, payment_type } = req.body;

  // Basic validation
  if (typeof amount !== 'number' || amount <= 0 || !['EMI', 'LUMP_SUM'].includes(payment_type)) {
    return res.status(400).json({ message: 'Invalid payment data.' });
  }

  db.get('SELECT * FROM Loans WHERE loan_id = ?', [loan_id], (err, loan) => {
    if (err) {
      console.error('Database error fetching loan for payment:', err.message);
      return res.status(500).json({ message: 'Internal server error.' });
    }
    if (!loan) {
      return res.status(404).json({ message: 'Loan not found.' });
    }
    if (loan.status === 'PAID_OFF') {
      return res.status(400).json({ message: 'Loan is already paid off.' });
    }

    let newBalance = loan.balance_amount - amount;
    let newAmountPaid = loan.amount_paid + amount;
    let newEmisLeft = loan.emis_left;
    let status = loan.status;

    if (newBalance <= 0) {
      newBalance = 0;
      newEmisLeft = 0;
      status = 'PAID_OFF';
    } else if (payment_type === 'LUMP_SUM') {
      // Recalculate EMIs left for lump-sum payments
      newEmisLeft = Math.ceil(newBalance / loan.monthly_emi);
    } else if (payment_type === 'EMI') {
      // For EMI payments, simply decrement EMI count if balance allows
      if (amount >= loan.monthly_emi) { // Assuming full EMI is paid or more
          newEmisLeft = Math.max(0, newEmisLeft - 1);
      }
    }


    db.serialize(() => {
      // Start a transaction for atomicity (important for financial operations)
      db.run('BEGIN TRANSACTION;');

      // Update the loan
      db.run(
        'UPDATE Loans SET amount_paid = ?, balance_amount = ?, emis_left = ?, status = ? WHERE loan_id = ?',
        [parseFloat(newAmountPaid.toFixed(2)), parseFloat(newBalance.toFixed(2)), newEmisLeft, status, loan_id],
        function (err) {
          if (err) {
            console.error('Database error updating loan for payment:', err.message);
            db.run('ROLLBACK;');
            return res.status(500).json({ message: 'Internal server error.' });
          }

          // Record the payment
          const payment_id = uuidv4();
          db.run(
            'INSERT INTO Payments (payment_id, loan_id, amount, payment_type) VALUES (?, ?, ?, ?)',
            [payment_id, loan_id, amount, payment_type],
            function (err) {
              if (err) {
                console.error('Database error recording payment:', err.message);
                db.run('ROLLBACK;');
                return res.status(500).json({ message: 'Internal server error.' });
              }

              db.run('COMMIT;', (commitErr) => {
                if (commitErr) {
                  console.error('Database commit error:', commitErr.message);
                  return res.status(500).json({ message: 'Internal server error.' });
                }
                res.status(200).json({
                  payment_id: payment_id,
                  loan_id: loan_id,
                  message: 'Payment recorded successfully.',
                  remaining_balance: parseFloat(newBalance.toFixed(2)),
                  emis_left: newEmisLeft,
                  status: status
                });
              });
            }
          );
        }
      );
    });
  });
});

/**
 * LEDGER: View loan details and transaction history
 * Endpoint: GET /api/v1/loans/{loan_id}/ledger
 * Description: Retrieves the complete transaction history and current status of a loan.
 */
router.get('/loans/:loan_id/ledger', (req, res) => {
  const { loan_id } = req.params;

  db.get('SELECT * FROM Loans WHERE loan_id = ?', [loan_id], (err, loan) => {
    if (err) {
      console.error('Database error fetching loan for ledger:', err.message);
      return res.status(500).json({ message: 'Internal server error.' });
    }
    if (!loan) {
      return res.status(404).json({ message: 'Loan not found.' });
    }

    db.all('SELECT * FROM Payments WHERE loan_id = ? ORDER BY payment_date ASC', [loan_id], (err, payments) => {
      if (err) {
        console.error('Database error fetching payments for ledger:', err.message);
        return res.status(500).json({ message: 'Internal server error.' });
      }

      const transactions = payments.map(p => ({
        transaction_id: p.payment_id,
        date: p.payment_date,
        amount: parseFloat(p.amount.toFixed(2)),
        type: p.payment_type
      }));

      res.status(200).json({
        loan_id: loan.loan_id,
        customer_id: loan.customer_id,
        principal: parseFloat(loan.principal_amount.toFixed(2)),
        total_amount: parseFloat(loan.total_amount.toFixed(2)),
        monthly_emi: parseFloat(loan.monthly_emi.toFixed(2)),
        amount_paid: parseFloat(loan.amount_paid.toFixed(2)),
        balance_amount: parseFloat(loan.balance_amount.toFixed(2)),
        emis_left: loan.emis_left,
        status: loan.status,
        transactions: transactions
      });
    });
  });
});

/**
 * ACCOUNT OVERVIEW: View all loans for a customer
 * Endpoint: GET /api/v1/customers/{customer_id}/overview
 * Description: Provides a summary of all loans associated with a customer.
 */
router.get('/customers/:customer_id/overview', (req, res) => {
  const { customer_id } = req.params;

  db.all('SELECT * FROM Loans WHERE customer_id = ?', [customer_id], (err, loans) => {
    if (err) {
      console.error('Database error fetching loans for customer overview:', err.message);
      return res.status(500).json({ message: 'Internal server error.' });
    }
    if (!loans || loans.length === 0) {
      return res.status(404).json({ message: 'No loans found for this customer or customer does not exist.' });
    }

    const customerLoans = loans.map(loan => ({
      loan_id: loan.loan_id,
      principal: parseFloat(loan.principal_amount.toFixed(2)),
      total_amount: parseFloat(loan.total_amount.toFixed(2)),
      total_interest: parseFloat((loan.total_amount - loan.principal_amount).toFixed(2)),
      emi_amount: parseFloat(loan.monthly_emi.toFixed(2)),
      amount_paid: parseFloat(loan.amount_paid.toFixed(2)),
      emis_left: loan.emis_left,
      status: loan.status
    }));

    res.status(200).json({
      customer_id: customer_id,
      total_loans: loans.length,
      loans: customerLoans
    });
  });
});

module.exports = router;