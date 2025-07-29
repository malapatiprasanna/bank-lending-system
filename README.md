#Bank Lending System
This project implements a simple bank lending system with a Node.js Express backend, a React.js frontend, and an SQLite database, as per the specified assignment requirements. It allows a bank to manage customer loans, process payments, and provide detailed transaction histories and account overviews.

## Table of Contents
Features

System Architecture

Technologies Used

Project Structure

Setup Instructions

Prerequisites

Backend Setup

Frontend Setup

How to Run the Application

API Endpoints

Assumptions and Design Decisions

Deployment Notes

## Features
The system provides the following core functionalities:

### LEND:

Allows the bank to issue new loans to customers.

Takes customer_id, loan_amount, loan_period_years, and interest_rate_yearly as input.

Calculates and returns the total_amount_payable and monthly_emi.

### PAYMENT:

Enables customers to make payments against their loans.

Supports both EMI (regular installment) and LUMP_SUM payments.

Lump sum payments reduce the outstanding balance and recalculate the emis_left.

### LEDGER:

Provides a complete transaction history for a specific loan ID.

Returns current loan status, including balance_amount, monthly_emi, and emis_left.

### ACCOUNT OVERVIEW:

Lists all loans associated with a given customer_id.

For each loan, displays principal, total_amount, emi_amount, total_interest, amount_paid, and emis_left.

# System Architecture
The system follows a simple three-tier architecture:

# Presentation Layer (Frontend): 
A React.js Single-Page Application (SPA) running in the user's web browser. It consumes the backend RESTful API.

# Application Layer (Backend): 
A Node.js with Express.js web server. It exposes the RESTful API endpoints, handles business logic (loan creation, payment processing, ledger generation), and interacts with the database.

# Data Layer (Database): 
A persistent storage system using SQLite. It stores all data related to customers, loans, and payments. SQLite is chosen for its simplicity and file-based nature, suitable for a self-contained project.

# Technologies Used
## Backend:

Node.js

Express.js (Web Framework)

SQLite3 (Database)

uuid (for generating unique IDs)

body-parser (for parsing request bodies)

cors (for Cross-Origin Resource Sharing)

## Frontend:

React.js (UI Library)

Tailwind CSS (for styling)

create-react-app (for project scaffolding)

# Project Structure
bank-lending-system/
├── backend/
│   ├── package.json
│   ├── src/
│   │   ├── db.js
│   │   ├── server.js
│   │   └── routes/
│   │       └── loanRoutes.js
│   └── .gitignore
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js
│   │   ├── index.js
│   │   ├── index.css
│   │   ├── api/
│   │   │   └── api.js
│   │   └── components/
│   │       ├── LoanForm.js
│   │       ├── PaymentForm.js
│   │       ├── LoanLedger.js
│   │       └── CustomerOverview.js
│   ├── package.json
│   ├── tailwind.config.js
│   └── .gitignore
└── .gitignore (root level, if using a monorepo)

# Setup Instructions
Follow these steps to set up and run the application locally.

## Prerequisites
Node.js (LTS version recommended) and npm installed.

Git installed.

## Backend Setup
Navigate to the backend directory:

cd bank-lending-system/backend

## Install dependencies:

npm install

## Create .gitignore:
Create a file named .gitignore in the backend directory with the following content:

node_modules/
bank_lending.db
.env

Frontend Setup
Navigate to the frontend directory:

cd bank-lending-system/frontend

## Install dependencies:

npm install

## Create .gitignore:
Create a file named .gitignore in the frontend directory with the following content:

node_modules/
build/
.env

Ensure tailwind.config.js is correctly configured:
The tailwind.config.js file should be at the root of your frontend directory.

## Verify public/index.html:
Ensure frontend/public/index.html contains <div id="root"></div> inside the <body> tag. This is crucial for React to mount the application.

<!-- ... other head content ... -->
<body>
  <noscript>You need to enable JavaScript to run this app.</noscript>
  <div id="root"></div>
  <!-- ... -->
</body>

## Verify src/index.js:
Ensure frontend/src/index.js is correctly setting up the React root:

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

(Note: reportWebVitals import and call are intentionally removed to avoid common Create React App setup errors if not fully configured.)

## How to Run the Application

cd bank-lending-system/backend
npm start

cd bank-lending-system/frontend
npm start
