# Bank Lending System
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


# Setup Instructions

  ## How to Run the Application
  ```bash
# backend
      cd bank-lending-system/backend
      npm install
      npm start
# frontend
      cd bank-lending-system/frontend
      npm install
      npm start
