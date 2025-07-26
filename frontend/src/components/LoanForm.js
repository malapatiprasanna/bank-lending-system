import React, { useState } from 'react';
import { createLoan } from '../api/api';

const LoanForm = ({ onLoanCreated }) => {
  const [customerId, setCustomerId] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [loanPeriodYears, setLoanPeriodYears] = useState('');
  const [interestRateYearly, setInterestRateYearly] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    const loanData = {
      customer_id: customerId,
      loan_amount: parseFloat(loanAmount),
      loan_period_years: parseInt(loanPeriodYears),
      interest_rate_yearly: parseFloat(interestRateYearly),
    };

    // Basic client-side validation
    if (!loanData.customer_id || isNaN(loanData.loan_amount) || isNaN(loanData.loan_period_years) || isNaN(loanData.interest_rate_yearly) ||
        loanData.loan_amount <= 0 || loanData.loan_period_years <= 0 || loanData.interest_rate_yearly < 0) {
      setIsError(true);
      setMessage('Please fill in all fields with valid positive numbers.');
      return;
    }

    try {
      const result = await createLoan(loanData);
      setMessage(`Loan created successfully! Loan ID: ${result.loan_id}, Monthly EMI: ${result.monthly_emi.toFixed(2)}`);
      setIsError(false);
      // Clear form
      setCustomerId('');
      setLoanAmount('');
      setLoanPeriodYears('');
      setInterestRateYearly('');
      if (onLoanCreated) {
        onLoanCreated(result.loan_id); // Pass the new loan ID to parent
      }
    } catch (error) {
      setIsError(true);
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Create New Loan</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="customerId" className="block text-sm font-medium text-gray-700">Customer ID</label>
          <input
            type="text"
            id="customerId"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="loanAmount" className="block text-sm font-medium text-gray-700">Loan Amount</label>
          <input
            type="number"
            id="loanAmount"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={loanAmount}
            onChange={(e) => setLoanAmount(e.target.value)}
            min="0.01"
            step="0.01"
            required
          />
        </div>
        <div>
          <label htmlFor="loanPeriodYears" className="block text-sm font-medium text-gray-700">Loan Period (Years)</label>
          <input
            type="number"
            id="loanPeriodYears"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={loanPeriodYears}
            onChange={(e) => setLoanPeriodYears(e.target.value)}
            min="1"
            step="1"
            required
          />
        </div>
        <div>
          <label htmlFor="interestRateYearly" className="block text-sm font-medium text-gray-700">Interest Rate (Yearly %)</label>
          <input
            type="number"
            id="interestRateYearly"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={interestRateYearly}
            onChange={(e) => setInterestRateYearly(e.target.value)}
            min="0"
            step="0.01"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Lend
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

export default LoanForm;