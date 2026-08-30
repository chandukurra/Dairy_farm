# 🐄 Kurra's Dairy Management System

A complete MERN Stack web application for managing a dairy farm, including animals, milk production, sales, expenses, income, inventory, users, verification, and analytics.

## Farm weather setup

The dashboard uses the free Open-Meteo weather API through the server, so no API key is needed. Add the following values to `server/.env`, then restart the server:

```env
FARM_LOCATION_NAME=Kurra Dairy Farm
FARM_LATITUDE=17.3850
FARM_LONGITUDE=78.4867
```

Use your farm's own decimal latitude and longitude. In Google Maps, right-click the farm's exact point and choose the coordinates to copy them. The first number is latitude; the second is longitude. For deployment, set the same three variables in your hosting provider's server environment settings and redeploy/restart the server.

---

## 🌟 Features

### 👥 Role-Based Access

The system supports three user roles:

- **ADMIN** – Full system control
- **FARM_MANAGER** – Daily farm operations
- **CUSTOMER** – Customer access

Each role has access only to the features permitted for that role.

---

### 🐄 Animal Management

Manage the dairy farm's animals.

Features include:

- Add animals
- View animals
- Edit animal information
- View individual animal profiles
- Track cows, buffaloes, and bulls
- Track animal health information
- Track vaccination information
- Upload animal images

---

### 🥛 Milk Production Management

Manage daily milk production records.

Features include:

- Record daily milk production
- Select animal
- Record morning/evening production
- Calculate total production
- View milk production history
- Admin verification workflow

---

### 🧾 Milk Sales

Manage milk sales and customer transactions.

Features include:

- Record milk sales
- Track quantity
- Track selling price
- Calculate total sale amount
- View sales history
- Verification workflow

---

### 💸 Financial Management

The system manages both income and expenses.

#### Expenses

Track:

- Feed
- Fodder
- Medicine
- Vaccination
- Salary
- Electricity
- Water
- Transportation
- Equipment
- Maintenance
- Animal purchases
- Other expenses

#### Income

Track additional income sources apart from milk sales.

Verified financial records are used for financial reports.

---

### 📦 Inventory Management

Manage farm inventory and stock.

Features include:

- Add inventory items
- View current stock
- Minimum stock levels
- Low-stock alerts
- Record purchases
- Record usage
- Record adjustments
- Inventory transaction history

Inventory quantities are changed through transactions instead of silently overwriting stock values.

---

### ✅ Verification System

Important operational records can require Admin verification.

Example workflow:

```text
Record Created
      ↓
Pending Verification
      ↓
Admin Reviews
   ↙       ↘
Verify     Reject
   ↓          ↓
Official    Rejected
Data        Record
