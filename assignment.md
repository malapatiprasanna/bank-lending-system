# app.py
from flask import Flask, request, jsonify
import uuid
import datetime

app = Flask(__name__)

# --- In-memory data store ---
# This data will reset if the server restarts.
# For persistence, you would integrate a database (e.g., SQLite, PostgreSQL, MongoDB).
customers = {} # Stores customer details: {customer_id: {"name": "Customer Name"}}
loans = {}     # Stores loan details: {loan_id: {...loan_details...}}

# --- Helper Functions ---

def calculate_loan_details(principal_amount, loan_period_years, interest_rate):
    """
    Calculates total interest, total amount to pay, total EMI count, and monthly EMI.
    Assumes simple interest and annual interest rate.
    """
    if principal_amount <= 0 or loan_period_years <= 0 or interest_rate < 0:
        raise ValueError("Invalid input for loan calculation.")

    # I(Interest) = P (Principal) * N (No of Years) * R (Rate of interest)
    total_interest = principal_amount * loan_period_years * interest_rate
    # A(Total Amount) = P + I
    total_amount_to_pay = principal_amount + total_interest

    total_emi_count = loan_period_years * 12 # Convert years to months for EMI count
    
    # Avoid division by zero if loan_period_years is effectively zero or very small
    if total_emi_count == 0:
        monthly_emi = total_amount_to_pay # If period is less than a month, pay full amount
    else:
        monthly_emi = round(total_amount_to_pay / total_emi_count, 2) # Round to 2 decimal places for currency

    return total_interest, total_amount_to_pay, total_emi_count, monthly_emi

# --- API Endpoints ---

@app.route('/loans', methods=['POST'])
def lend_money():
    """
    LEND: Allows the bank to give loans to customers.
    Input: customer_id, loan_amount(P), loan_period(N), rate_of_interest(I)
    Returns: Total amount(A) to be paid and the monthly EMI.
    """
    data = request.json
    customer_id = data.get('customer_id')
    principal_amount = data.get('principal_amount')
    loan_period_years = data.get('loan_period_years')
    interest_rate = data.get('interest_rate')

    # Basic input validation
    if not all([customer_id, principal_amount is not None, loan_period_years is not None, interest_rate is not None]):
        return jsonify({"error": "Missing required loan details (customer_id, principal_amount, loan_period_years, interest_rate)"}), 400
    
    if not isinstance(principal_amount, (int, float)) or principal_amount <= 0:
        return jsonify({"error": "principal_amount must be a positive number"}), 400
    if not isinstance(loan_period_years, (int, float)) or loan_period_years <= 0:
        return jsonify({"error": "loan_period_years must be a positive number"}), 400
    if not isinstance(interest_rate, (int, float)) or interest_rate < 0:
        return jsonify({"error": "interest_rate must be a non-negative number"}), 400

    try:
        total_interest, total_amount_to_pay, total_emi_count, monthly_emi = \
            calculate_loan_details(principal_amount, loan_period_years, interest_rate)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    # If customer doesn't exist in our simple in-memory store, add them
    if customer_id not in customers:
        customers[customer_id] = {"name": f"Customer {customer_id}"} # Dummy name

    loan_id = str(uuid.uuid4()) # Generate a unique loan ID

    loan = {
        "loan_id": loan_id,
        "customer_id": customer_id,
        "principal_amount": round(principal_amount, 2),
        "loan_period_years": loan_period_years,
        "interest_rate": interest_rate,
        "total_interest": round(total_interest, 2),
        "total_amount_to_pay": round(total_amount_to_pay, 2),
        "monthly_emi": monthly_emi,
        "total_emi_count": total_emi_count,
        "outstanding_balance": round(total_amount_to_pay, 2), # Initially, outstanding is total amount
        "emi_paid_count": 0,
        "loan_status": "ACTIVE",
        "transactions": [] # List to store payment transactions
    }
    loans[loan_id] = loan # Store the new loan

    return jsonify({
        "loan_id": loan["loan_id"],
        "customer_id": loan["customer_id"],
        "principal_amount": loan["principal_amount"],
        "loan_period_years": loan["loan_period_years"],
        "interest_rate": loan["interest_rate"],
        "total_interest": loan["total_interest"],
        "total_amount_to_pay": loan["total_amount_to_pay"],
        "monthly_emi": loan["monthly_emi"],
        "total_emi_count": loan["total_emi_count"],
        "outstanding_balance": loan["outstanding_balance"],
        "loan_status": loan["loan_status"]
    }), 201 # 201 Created status code

@app.route('/loans/<loan_id>/payments', methods=['POST'])
def make_payment(loan_id):
    """
    PAYMENT: Customers can pay back loans either in EMI or LUMP SUM.
    Input: payment_type (EMI_PAYMENT/LUMP_SUM), amount
    Deducts from total amount, can reduce number of EMIs.
    """
    data = request.json
    payment_type = data.get('payment_type')
    amount = data.get('amount')

    loan = loans.get(loan_id)
    if not loan:
        return jsonify({"error": "Loan not found"}), 404
    
    if not all([payment_type, amount is not None]):
        return jsonify({"error": "Missing payment type or amount"}), 400
    
    if payment_type not in ["EMI_PAYMENT", "LUMP_SUM"]:
        return jsonify({"error": "Invalid payment_type. Must be 'EMI_PAYMENT' or 'LUMP_SUM'"}), 400
    
    if not isinstance(amount, (int, float)) or amount <= 0:
        return jsonify({"error": "Payment amount must be a positive number"}), 400

    if loan["loan_status"] == "PAID_OFF":
        return jsonify({"error": "Loan is already paid off. No further payments required."}), 400
    
    # Deduct payment amount from outstanding balance
    loan["outstanding_balance"] -= amount
    
    # Record the transaction
    transaction = {
        "transaction_id": str(uuid.uuid4()),
        "type": payment_type,
        "amount": round(amount, 2),
        "date": datetime.datetime.now().isoformat() # ISO format for consistent date string
    }
    loan["transactions"].append(transaction)

    # Update EMI paid count if it's an EMI payment
    if payment_type == "EMI_PAYMENT":
        loan["emi_paid_count"] += 1
    
    # Check if loan is paid off
    if loan["outstanding_balance"] <= 0:
        loan["loan_status"] = "PAID_OFF"
        loan["outstanding_balance"] = 0.0 # Ensure outstanding balance is exactly zero
        remaining_emi_count = 0.0
    else:
        # Recalculate remaining EMIs based on the new outstanding balance
        # This can be fractional, especially after lump sum payments
        if loan["monthly_emi"] > 0:
            remaining_emi_count = loan["outstanding_balance"] / loan["monthly_emi"]
        else: # Handle case where monthly_emi is 0 (e.g., 0 interest loan paid in one go)
            remaining_emi_count = 0.0

    return jsonify({
        "loan_id": loan_id,
        "message": "Payment processed successfully.",
        "updated_outstanding_balance": round(loan["outstanding_balance"], 2),
        "emi_paid_count": loan["emi_paid_count"],
        "remaining_emi_count": round(remaining_emi_count, 2),
        "loan_status": loan["loan_status"]
    }), 200

@app.route('/loans/<loan_id>/ledger', methods=['GET'])
def get_ledger(loan_id):
    """
    LEDGER: Customers can check all transactions for a loan ID.
    Returns: All transactions, balance amount, monthly EMI, and number of EMIs left.
    """
    loan = loans.get(loan_id)
    if not loan:
        return jsonify({"error": "Loan not found"}), 404

    # Calculate remaining EMIs
    if loan["monthly_emi"] > 0:
        remaining_emi_count = max(0, loan["outstanding_balance"] / loan["monthly_emi"])
    else:
        remaining_emi_count = 0 # If EMI is 0, no EMIs left if balance is 0 or less

    return jsonify({
        "loan_id": loan_id,
        "outstanding_balance": round(loan["outstanding_balance"], 2),
        "monthly_emi": loan["monthly_emi"],
        "remaining_emi_count": round(remaining_emi_count, 2),
        "transactions": loan["transactions"],
        "loan_status": loan["loan_status"]
    }), 200

@app.route('/customers/<customer_id>/loans', methods=['GET'])
def get_account_overview(customer_id):
    """
    ACCOUNT OVERVIEW: Lists all loans a customer has taken.
    For each loan: loan amount(P), Total amount(A), EMI amount, Total Interest(I),
    amount paid till date, number of EMIs left.
    """
    customer_loans_summary = []
    found_loans = False

    for loan_id, loan in loans.items():
        if loan["customer_id"] == customer_id:
            found_loans = True
            # Calculate amount paid till date
            amount_paid_till_date = loan["total_amount_to_pay"] - loan["outstanding_balance"]
            
            # Calculate remaining EMIs
            if loan["monthly_emi"] > 0:
                remaining_emi_count = max(0, loan["outstanding_balance"] / loan["monthly_emi"])
            else:
                remaining_emi_count = 0

            customer_loans_summary.append({
                "loan_id": loan_id,
                "principal_amount": loan["principal_amount"],
                "total_amount_to_pay": loan["total_amount_to_pay"],
                "monthly_emi": loan["monthly_emi"],
                "total_interest": loan["total_interest"],
                "amount_paid_till_date": round(amount_paid_till_date, 2),
                "remaining_emi_count": round(remaining_emi_count, 2),
                "loan_status": loan["loan_status"]
            })
    
    if not found_loans:
        return jsonify({"message": f"No loans found for customer_id: {customer_id}"}), 404

    return jsonify(customer_loans_summary), 200

# --- Run the Flask app ---
if __name__ == '__main__':
    # To run: python app.py
    # This will start a development server.
    # Access it at http://127.0.0.1:5000/
    app.run(debug=True) # debug=True provides helpful error messages during development
I will provide the solutions for the Bank System assignment and the problems from problems.md in separate, self-contained code blocks. Each block will represent a complete file, as if it were in its own GitHub repository.

Assignment: Bank System (assignments.md)
Here is the Python Flask application for the Bank System, using in-memory data storage for simplicity as requested.
Bank System Backend (Flask)
26 Jul, 22:08

Open

To run this Bank System:

Save the code above as app.py.

Make sure you have Flask installed (pip install Flask).

Run the file from your terminal: python app.py

The server will start, usually on http://127.0.0.1:5000/. You can then use tools like Postman, curl, or a simple Python script to send requests to these endpoints.

# Example Usage (using curl):

# 1. LEND a loan:
```bash
curl -X POST -H "Content-Type: application/json" -d '{
    "customer_id": "CUST001",
    "principal_amount": 500000,
    "loan_period_years": 5,
    "interest_rate": 0.10
}' http://127.0.0.1:5000/loans
