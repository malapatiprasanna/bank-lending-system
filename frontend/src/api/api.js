const API_BASE_URL = 'https://bank-lending-system-ngye.onrender.com/api/v1';
 // Backend URL

export const createLoan = async (loanData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/loans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loanData),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create loan');
    }
    return data;
  } catch (error) {
    console.error('Error creating loan:', error);
    throw error;
  }
};

export const recordPayment = async (loanId, paymentData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/loans/${loanId}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to record payment');
    }
    return data;
  } catch (error) {
    console.error('Error recording payment:', error);
    throw error;
  }
};

export const getLoanLedger = async (loanId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/loans/${loanId}/ledger`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch loan ledger');
    }
    return data;
  } catch (error) {
    console.error('Error fetching loan ledger:', error);
    throw error;
  }
};

export const getCustomerOverview = async (customerId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/customers/${customerId}/overview`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch customer overview');
    }
    return data;
  } catch (error) {
    console.error('Error fetching customer overview:', error);
    throw error;
  }
};
