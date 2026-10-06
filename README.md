# StockPilot – Smart Product Management Dashboard

> A modern full-stack inventory management dashboard for managing products, monitoring stock levels, analyzing inventory health, and generating reports.

---

## 📌 Overview

**StockPilot** is a full-stack Product Management and Inventory Dashboard designed to simplify product administration and inventory monitoring.

The application provides a centralized dashboard where users can:

- Add, view, edit, and delete products
- Search products instantly
- Filter products by category
- Sort products by price and other criteria
- Monitor stock availability
- Identify low-stock and out-of-stock products
- View inventory statistics and analytics
- Track overall inventory health
- Export product data as CSV
- Authenticate securely using JWT
- Manage products through RESTful APIs

The project focuses on combining a clean user interface with a structured Flask backend and secure API architecture.

---

## 🎯 Key Features

### 🔐 Authentication

- JWT-based authentication
- Secure login system
- Password hashing
- Protected product APIs
- Token-based API authorization
- User information stored securely in the frontend session

### 📦 Product Management

Complete CRUD functionality:

- Create products
- View products
- View individual product details
- Update products
- Delete products

Each product contains:

- Product name
- Category
- Price
- Stock quantity
- Description
- Creation date
- Last updated date

### 🔎 Search & Filtering

Users can efficiently find products using:

- Product name search
- Category filtering
- Sorting
- Pagination

### 📊 Inventory Analytics

The dashboard provides real-time inventory statistics:

- Total Products
- In Stock
- Low Stock
- Out of Stock
- Total Stock Units
- Inventory Health Score

### 🚨 Stock Monitoring

Stock status is automatically determined based on quantity:

| Stock Quantity | Status |
|---|---|
| `0` | Out of Stock |
| `1 – 10` | Low Stock |
| `> 10` | In Stock |

The dashboard also provides a **Needs Attention** section for products requiring inventory attention.

### 📈 Data Visualization

The dashboard includes visual analytics using **Chart.js**, allowing users to understand inventory distribution quickly.

### 📄 CSV Export

Product data can be exported into CSV format for:

- Reporting
- Analysis
- Record keeping
- Business operations

### 📱 Responsive UI

The interface is designed to work across:

- Desktop
- Laptop
- Tablet
- Mobile devices

---

# 🛠️ Technology Stack

## Frontend

- HTML5
- CSS3
- JavaScript
- Bootstrap 5
- Chart.js

## Backend

- Python
- Flask
- Flask-CORS
- Flask-JWT-Extended

## Database

- SQLite
- SQLAlchemy
- Flask-SQLAlchemy

## Security

- JWT Authentication
- Password Hashing
- Protected REST APIs
- Environment-based configuration

## Development Tools

- Visual Studio Code
- Git
- GitHub
- Python Virtual Environment                     
