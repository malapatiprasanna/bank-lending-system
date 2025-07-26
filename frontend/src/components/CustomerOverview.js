import React, { useState } from 'react';
import { getCustomerOverview } from '../api/api';

const CustomerOverview = () => {
  const [customerId, setCustomerId] = useState('');
  const [overviewData, setOverviewData] = useState(null);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchOverview = async () => {
    setMessage('');
    setIsError(false);
    setOverviewData(null);
    if (!customerId) {
      setIsError(true);
      setMessage('Please enter a Customer ID.');
      return;
    }

    setIsLoading(true);
    try {
      const data = await getCustomerOverview(customerId);
      setOverviewData(data);
      setMessage('Customer overview fetched successfully.');
      setIsError(false);
    } catch (error) {
      setIsError(true);
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Customer Account Overview</h2>
      <div className="flex space-x-2 mb-4">
        <input
          type="text"
          placeholder="Enter Customer ID"
          className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
        />
        <button
          onClick={fetchOverview}
          className="flex-shrink-0 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Fetch Overview'}
        </button>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-md ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}

      {overviewData && (
        <div className="space-y-4">
          <p className="text-gray-700"><strong>Customer ID:</strong> {overviewData.customer_id}</p>
          <p className="text-gray-700"><strong>Total Loans:</strong> {overviewData.total_loans}</p>

          <h3 className="text-xl font-bold mt-6 mb-4 text-gray-800">Loans Summary</h3>
          {overviewData.loans.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg">
                      Loan ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Principal
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Interest
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      EMI Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount Paid
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      EMIs Left
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-lg">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {overviewData.loans.map((loan) => (
                    <tr key={loan.loan_id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {loan.loan_id.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${loan.principal.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${loan.total_amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${loan.total_interest.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${loan.emi_amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${loan.amount_paid.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {loan.emis_left}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${loan.status === 'PAID_OFF' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                          {loan.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600">No loans found for this customer.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerOverview;