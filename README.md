# SalesForce

A full-stack application for managing inventory, purchase orders, employees, and organizations. Built with React, Node.js, Express, and MySQL using Sequelize ORM, this system provides a secure and scalable solution for business operations. Screenshots are available in the Product Images/ folder.
## Overview
This application provides a user-friendly interface and RESTful API for managing employees, organizations, inventory products, and purchase orders. Sample screenshots showcasing key features are in the `Product Images/` folder.

## Features
- **User Authentication**: Secure signup and login with JWT and bcrypt.
- **Employee Management**: Create, read, update, and delete employee records with hierarchical support.
- **Organization Management**: Manage organizations with parent-child relationships and search functionality.
- **Inventory Management**: Track products with details like serials and categories, including search.
- **Purchase Orders**: Create and manage orders with line items, discounts, taxes, pagination, and search.

## Tech Stack
- **Frontend**: React
- **Backend**: Node.js, Express.js
- **Database**: MySQL, Sequelize ORM
- **Authentication**: JWT, bcrypt

## Installation & Usage
```bash
# Clone repository
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name

# Install and run frontend
cd frontend
npm install
npm start

# Install and run backend
cd backend
npm install
npm start

```
## Open in Browser

- Frontend: [http://localhost:3000](http://localhost:3000)  
- Backend API: [http://localhost:5000](http://localhost:5000)

## API Endpoints

### 🔐 Auth

| Method | Endpoint         | Description                       |
|--------|------------------|-----------------------------------|
| POST   | `/api/signup`    | Register a user                   |
| POST   | `/api/login`     | Login and get JWT                 |
| GET    | `/api/user`      | Get authenticated user (JWT required) |

### 👥 Employee

| Method | Endpoint                | Description                          |
|--------|-------------------------|--------------------------------------|
| POST   | `/api/employee`         | Create employee (JWT required)       |
| GET    | `/api/employee`         | List all employees (JWT required)    |
| GET    | `/api/employee/:id`     | Get employee by ID (JWT required)    |
| PUT    | `/api/employee/:id`     | Update employee (JWT required)       |
| DELETE | `/api/employee/:id`     | Delete employee (JWT required)       |

### 🏢 Organization

| Method | Endpoint                                     | Description                              |
|--------|----------------------------------------------|------------------------------------------|
| POST   | `/api/organization`                          | Create organization (JWT required)       |
| GET    | `/api/organization`                          | List all organizations (JWT required)    |
| GET    | `/api/organization/search?query=term`        | Search organizations (JWT required)      |
| GET    | `/api/organization/:id`                      | Get organization by ID (JWT required)    |
| PUT    | `/api/organization/:id`                      | Update organization (JWT required)       |
| DELETE | `/api/organization/:id`                      | Delete organization (JWT required)       |

### 📦 Inventory Product

| Method | Endpoint                                     | Description                              |
|--------|----------------------------------------------|------------------------------------------|
| POST   | `/api/invproduct`                            | Create product (JWT required)            |
| GET    | `/api/invproduct`                            | List all products (JWT required)         |
| GET    | `/api/invproduct/search?query=term`          | Search products (JWT required)           |
| GET    | `/api/invproduct/:id`                        | Get product by ID (JWT required)         |
| PUT    | `/api/invproduct/:id`                        | Update product (JWT required)            |
| DELETE | `/api/invproduct/:id`                        | Delete product (JWT required)            |

### 📑 Purchase Order

| Method | Endpoint                                              | Description                              |
|--------|-------------------------------------------------------|------------------------------------------|
| POST   | `/api/purchaseorder`                                  | Create purchase order (JWT required)     |
| GET    | `/api/purchaseorder?page=1&limit=25`                  | List purchase orders (JWT required)      |
| GET    | `/api/purchaseorder/search?query=term`                | Search purchase orders (JWT required)    |
| GET    | `/api/purchaseorder/:id`                              | Get purchase order by ID (JWT required)  |
| PUT    | `/api/purchaseorder/:id`                              | Update purchase order (JWT required)     |
| DELETE | `/api/purchaseorder/:id`                              | Delete purchase order (JWT required)     |

### 🧾 Purchase Order Detail

| Method | Endpoint                              | Description                              |
|--------|---------------------------------------|------------------------------------------|
| POST   | `/api/purchaseorderdetail`           | Create order detail (JWT required)       |
| GET    | `/api/purchaseorderdetail`           | List all order details (JWT required)    |
| GET    | `/api/purchaseorderdetail/:id`       | Get order detail by ID (JWT required)    |
| PUT    | `/api/purchaseorderdetail/:id`       | Update order detail (JWT required)       |
| DELETE | `/api/purchaseorderdetail/:id`       | Delete order detail (JWT required)       |
