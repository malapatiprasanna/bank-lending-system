import React, { useState } from 'react';
import { recordPayment } from '../api/api';

const PaymentForm = ({ onPaymentRecorded }) => {
  const [loanId, setLoanId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentType, setPaymentType] = useState('EMI');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    const paymentData = {
      amount: parseFloat(amount),
      payment_type: paymentType,
    };

    // Basic client-side validation
    if (!loanId || isNaN(paymentData.amount) || paymentData.amount <= 0) {
      setIsError(true);
      setMessage('Please provide a valid Loan ID and positive Amount.');
      return;
    }

    try {
      const result = await recordPayment(loanId, paymentData);
      setMessage(`Payment recorded successfully! Remaining Balance: ${result.remaining_balance.toFixed(2)}, EMIs Left: ${result.emis_left}`);
      setIsError(false);
      // Clear form
      setLoanId('');
      setAmount('');
      setPaymentType('EMI');
      if (onPaymentRecorded) {
        onPaymentRecorded(loanId); // Notify parent to refresh ledger/overview
      }
    } catch (error) {
      setIsError(true);
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Record Payment</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="loanId" className="block text-sm font-medium text-gray-700">Loan ID</label>
          <input
            type="text"
            id="loanId"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={loanId}
            onChange={(e) => setLoanId(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount</label>
          <input
            type="number"
            id="amount"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0.01"
            step="0.01"
            required
          />
        </div>
        <div>
          <label htmlFor="paymentType" className="block text-sm font-medium text-gray-700">Payment Type</label>
          <select
            id="paymentType"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={paymentType}
            onChange={(e) => setPaymentType(e.target.value)}
            required
          >
            <option value="EMI">EMI</option>
            <option value="LUMP_SUM">Lump Sum</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Record Payment
        </button>
      </form>
      {message && (
        <div className={`mt-4 p-3 rounded-md ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default PaymentForm;