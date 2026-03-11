# Agridizz FPO Accounting Software

A web-based accounting and management solution for Farmer Producer Organizations (FPO/FPC).

## Features

- **Dashboard** – Financial summary with revenue, procurement cost, expenses, net profit/loss, member count, and pending payments. Includes a monthly bar chart.
- **Member Management** – Register and manage farmer members with contact details, land holdings, bank account, and Aadhaar information.
- **Procurement** – Record commodity purchases from farmers, track quantities, rates, payment status, and due amounts per farmer.
- **Sales** – Record sales to buyers/mandis, track receivables, payment mode, and invoice details.
- **Expenses** – Categorize and track all operational expenses (salary, transport, packaging, etc.) with voucher references.
- **Other Income** – Record grants, subsidies, membership fees, interest, and other non-sales income.
- **Reports**
  - Profit & Loss Statement
  - Balance Sheet (cash basis)
  - General Ledger (all transactions in chronological order)
  - Member Statements (individual farmer procurement and payment summary)
- **Settings** – Configure FPO details (name, registration number, financial year, address). Export/import data as JSON backup.

## Getting Started

Open `index.html` in any modern web browser. No server or installation required.

All data is stored locally in the browser's `localStorage`. Use the **Export Data** option in Settings to back up your data regularly.

## File Structure

```
├── index.html          # Main application
├── css/
│   └── style.css       # Stylesheet
└── js/
    ├── storage.js      # Data storage layer (localStorage)
    └── app.js          # Application logic and UI rendering
```

## Usage Notes

- Works entirely in the browser; no internet connection required after first load.
- Data persists across browser sessions via localStorage.
- Use **Export Data** to create JSON backups and **Import Data** to restore them.
- The **Print** button on the Reports page prints the currently displayed report.
