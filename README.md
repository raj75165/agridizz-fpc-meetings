# Agridizz FPO Accounting Software

A web-based accounting and management solution for Farmer Producer Organizations (FPO/FPC).

---

## ▶️ How to Open

### Option 1 — Download and open directly (easiest, no installation needed)

1. Click the green **Code** button at the top of this GitHub page.
2. Choose **Download ZIP** and save the file to your computer.
3. **Extract / Unzip** the downloaded file (right-click → *Extract All* on Windows; double-click on Mac).
4. Open the extracted folder and **double-click `index.html`**.
5. The application opens instantly in your default web browser (Chrome, Firefox, Edge, etc.).

> ✅ No internet connection is needed after the files are downloaded.  
> ✅ No installation, no setup, no server required.

---

### Option 2 — Open directly from GitHub (online, no download)

If the repository has **GitHub Pages** enabled, you can open the app directly in your browser:

```
https://raj75165.github.io/agridizz-fpc-meetings/
```

---

### Option 3 — Clone with Git and open locally

If you have [Git](https://git-scm.com/) installed:

```bash
git clone https://github.com/raj75165/agridizz-fpc-meetings.git
cd agridizz-fpc-meetings
```

Then open `index.html` in your browser:

- **Windows**: Double-click `index.html`, or drag it into your browser window.
- **Mac / Linux**: Run `open index.html` (Mac) or `xdg-open index.html` (Linux) in the terminal.

---

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

## File Structure

```
├── index.html          # Main application — open this file to start
├── css/
│   └── style.css       # Stylesheet
└── js/
    ├── storage.js      # Data storage layer (localStorage)
    └── app.js          # Application logic and UI rendering
```

## Usage Notes

- Works entirely in the browser; no internet connection required after first load.
- Data persists across browser sessions via localStorage (stored on your device).
- Use **Export Data** in Settings to create JSON backups and **Import Data** to restore them.
- The **Print** button on the Reports page prints the currently displayed report.

## Recommended Browsers

Works in any modern browser:

| Browser | Version |
|---------|---------|
| Google Chrome | 90+ |
| Microsoft Edge | 90+ |
| Mozilla Firefox | 88+ |
| Safari | 14+ |
