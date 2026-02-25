
---

# 📚 BuscaLibro | Order & Inventory Management System

**BuscaLibro** is a specialized web solution designed to optimize the workflow of bookstores and reading centers. The system centralizes inventory control, order tracking, and business intelligence through statistical reporting, effectively solving common issues such as visibility gaps in delivery dates and stock availability.

---

## 📋 Context & Problem Statement

Manual and decentralized management in bookstores often leads to critical stock errors and delivery delays. **BuscaLibro** was developed to:

* **Eliminate Uncertainty:** Provide real-time visibility into book availability.
* **Automate Workflow:** Synchronize inventory updates instantly with every transaction.
* **Interoperability:** Connect with external business models via JSON data exchange.
* **Data-Driven Decisions:** Offer quantifiable data for strategic growth.

---

## 🚀 Functional Requirements (FR)

### Inventory & Order Management

* **FR-01 & FR-03 (Order Processing):** Create and edit orders by linking users and books with automated check-out/return dates.
* **FR-02 & FR-04 (Stock Logic):** Pre-confirmation stock validation and automatic unit increment/decrement.
* **FR-09 & FR-10 (System Cleanup):** Logical deletion of orders and full CRUD management for books and authors, ensuring no active loans exist before removal.

### Search & Visualization

* **FR-05 (Individual Query):** Real-time status check (Available, Loaned, or Reserved) via ISBN or internal code.
* **FR-06 (Global Inventory):** Comprehensive catalog with advanced filtering by author, category, or availability.
* **FR-07 (User History):** Detailed tracking of loan behavior and return patterns per user.

### Business Intelligence (FR-08)

The system generates tabular and statistical reports including:

* 📈 **Top Demand:** Most requested book titles.
* 📊 **Category Analytics:** Loan frequency grouped by genre/category.
* ✅ **Reliability Rate:** Percentage of on-time returns vs. delays.

---

## 🛠️ Tech Stack

| Layer | Technology |
| --- | --- |
| **Frontend** | React.js |
| **Backend** | Node.js |
| **Database** | PostgreSQL |
| **Data Format** | JSON (Inbound/Outbound) |

---

ntegration?
