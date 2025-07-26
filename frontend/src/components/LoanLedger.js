import React, { useState, useEffect } from 'react';
import { getLoanLedger } from '../api/api';

const LoanLedger = ({ initialLoanId }) => {
  const [loanId, setLoanId] = useState(initialLoanId || '');
  const [ledgerData, setLedgerData] = useState(null);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialLoanId) {
      setLoanId(initialLoanId);
      fetchLedger(initialLoanId);
    }
  }, [initialLoanId]);

  const fetchLedger = async (idToFetch = loanId) => {
    setMessage('');
    setIsError(false);
    setLedgerData(null);
    if (!idToFetch) {
      setIsError(true);
      setMessage('Please enter a Loan ID.');
      return;
    }

    setIsLoading(true);
    try {
      const data = await getLoanLedger(idToFetch);
      setLedgerData(data);
      setMessage('Loan ledger fetched successfully.');
      setIsError(false);
    } catch (error) {
      setIsError(true);
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">View Loan Ledger</h2>
      <div className="flex space-x-2 mb-4">
        <input
          type="text"
          placeholder="Enter Loan ID"
          className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          value={loanId}
          onChange={(e) => setLoanId(e.target.value)}
        />
        <button
          onClick={() => fetchLedger()}
          className="flex-shrink-0 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Fetch Ledger'}
        </button>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-md ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}

      {ledgerData && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-gray-700">
            <p><strong>Loan ID:</strong> {ledgerData.loan_id}</p>
            <p><strong>Customer ID:</strong> {ledgerData.customer_id}</p>
            <p><strong>Principal Amount:</strong> ${ledgerData.principal.toFixed(2)}</p>
            <p><strong>Total Payable:</strong> ${ledgerData.total_amount.toFixed(2)}</p>
            <p><strong>Monthly EMI:</strong> ${ledgerData.monthly_emi.toFixed(2)}</p>
            <p><strong>Amount Paid:</strong> ${ledgerData.amount_paid.toFixed(2)}</p>
            <p><strong>Balance Amount:</strong> ${ledgerData.balance_amount.toFixed(2)}</p>
            <p><strong>EMIs Left:</strong> {ledgerData.emis_left}</p>
            <p><strong>Status:</strong> <span className={`font-semibold ${ledgerData.status === 'PAID_OFF' ? 'text-green-600' : 'text-blue-600'}`}>{ledgerData.status}</span></p>
          </div>

          <h3 className="text-xl font-bold mt-6 mb-4 text-gray-800">Transaction History</h3>
          {ledgerData.transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg">
                      Transaction ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-lg">
                      Type
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {ledgerData.transactions.map((transaction) => (
                    <tr key={transaction.transaction_id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {transaction.transaction_id.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(transaction.date).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${transaction.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.type}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600">No transactions recorded for this loan yet.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default LoanLedger;