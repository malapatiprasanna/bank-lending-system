import React, { useState } from 'react';
import LoanForm from './components/LoanForm';
import PaymentForm from './components/PaymentForm';
import LoanLedger from './components/LoanLedger';
import CustomerOverview from './components/CustomerOverview';

function App() {
  const [currentView, setCurrentView] = useState('lend'); // 'lend', 'payment', 'ledger', 'overview'
  const [activeLoanId, setActiveLoanId] = useState(''); // To pre-fill loan ID for ledger/payment

  const handleLoanCreated = (loanId) => {
    setActiveLoanId(loanId);
    setCurrentView('ledger'); // Switch to ledger view after loan creation
  };

  const handlePaymentRecorded = (loanId) => {
    setActiveLoanId(loanId);
    setCurrentView('ledger'); // Switch to ledger view after payment
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-6 lg:px-8 font-inter">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-10">
          Bank Lending System
        </h1>

        <nav className="mb-10 flex justify-center space-x-4">
          <button
            onClick={() => setCurrentView('lend')}
            className={`py-2 px-6 rounded-full text-lg font-medium transition duration-300 ${
              currentView === 'lend' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-50'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            Lend
          </button>
          <button
            onClick={() => setCurrentView('payment')}
            className={`py-2 px-6 rounded-full text-lg font-medium transition duration-300 ${
              currentView === 'payment' ? 'bg-green-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-50'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
          >
            Payment
          </button>
          <button
            onClick={() => setCurrentView('ledger')}
            className={`py-2 px-6 rounded-full text-lg font-medium transition duration-300 ${
              currentView === 'ledger' ? 'bg-purple-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-50'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500`}
          >
            Ledger
          </button>
          <button
            onClick={() => setCurrentView('overview')}
            className={`py-2 px-6 rounded-full text-lg font-medium transition duration-300 ${
              currentView === 'overview' ? 'bg-teal-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-50'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500`}
          >
            Account Overview
          </button>
        </nav>

        <div className="mt-8">
          {currentView === 'lend' && <LoanForm onLoanCreated={handleLoanCreated} />}
          {currentView === 'payment' && <PaymentForm onPaymentRecorded={handlePaymentRecorded} />}
          {currentView === 'ledger' && <LoanLedger initialLoanId={activeLoanId} />}
          {currentView === 'overview' && <CustomerOverview />}
        </div>
      </div>
    </div>
  );
}

export default App;
