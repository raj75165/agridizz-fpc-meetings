# Agridizz FPO Accounting Software

A web-based accounting and management solution for Farmer Producer Organizations (FPO/FPC).

---

## ▶️ How to Open

### 🖥️ Opening on a Windows Machine

**Yes — it works perfectly on Windows!** No installation, no administrator rights needed.

#### Method A: One-click launcher (easiest)

1. Click the green **Code** button at the top of this GitHub page.
2. Choose **Download ZIP** and save the file somewhere (e.g., `Downloads`).
3. Right-click the ZIP → **Extract All…** → choose a destination → click **Extract**.
4. Open the extracted folder.
5. **Double-click `open.bat`** — the app opens in your default browser immediately.

> 💡 `open.bat` is a small Windows launcher included in this repo.  
> It automatically finds `index.html` and opens it in your browser.

#### Method B: Open `index.html` directly

1. Download and extract the ZIP as described above (steps 1–4).
2. Inside the extracted folder, **double-click `index.html`**.
3. The app opens in your default web browser (Edge, Chrome, Firefox, etc.).

#### Method C: Drag-and-drop into browser

1. Download and extract the ZIP as described above.
2. Open your browser (e.g., Microsoft Edge or Chrome).
3. **Drag `index.html` from File Explorer** and drop it into the browser window.
4. The app loads immediately.

> ✅ No internet connection is needed after the files are downloaded.  
> ✅ No installation, no server, no administrator rights required.  
> ✅ Works on Windows 7, 8, 10, and 11.

---

### Option 1 — Download and open directly (all operating systems)

1. Click the green **Code** button at the top of this GitHub page.
2. Choose **Download ZIP** and save the file to your computer.
3. **Extract / Unzip** the downloaded file (right-click → *Extract All* on Windows; double-click on Mac).
4. Open the extracted folder and **double-click `index.html`** (or `open.bat` on Windows).
5. The application opens instantly in your default web browser (Chrome, Firefox, Edge, etc.).

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

Then open the app:

- **Windows**: Double-click `open.bat`, or double-click `index.html`, or drag it into your browser.
- **Mac**: Run `open index.html` in the terminal, or double-click `index.html` in Finder.
- **Linux**: Run `xdg-open index.html` in the terminal.

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

## 📦 Where Is Data Stored?

All data is stored **inside your web browser** using the browser's built-in **`localStorage`** mechanism.  
There is **no server, no database file, and no cloud** — everything lives locally on your device.

### What gets stored

| localStorage key | Contents |
|-----------------|----------|
| `fpo_members` | Registered farmer members |
| `fpo_procurement` | Commodity purchase records |
| `fpo_sales` | Sales records |
| `fpo_expenses` | Expense vouchers |
| `fpo_income` | Other income entries |
| `fpo_info` | FPO organisation settings |

### Physical location on your device

Browser localStorage is stored in a folder managed by your browser — you do not normally need to access it directly. The exact path is shown below for reference:

#### 🖥️ Windows

| Browser | Path |
|---------|------|
| **Google Chrome** | `%LOCALAPPDATA%\Google\Chrome\User Data\Default\Local Storage\leveldb\` |
| **Microsoft Edge** | `%LOCALAPPDATA%\Microsoft\Edge\User Data\Default\Local Storage\leveldb\` |
| **Mozilla Firefox** | `%APPDATA%\Mozilla\Firefox\Profiles\<profile>\storage\default\` |

> 💡 Paste the path into the Windows File Explorer address bar (replace `<profile>` with your actual Firefox profile folder name).

#### 🍎 Mac

| Browser | Path |
|---------|------|
| **Google Chrome** | `~/Library/Application Support/Google/Chrome/Default/Local Storage/leveldb/` |
| **Safari** | `~/Library/Safari/LocalStorage/` |
| **Firefox** | `~/Library/Application Support/Firefox/Profiles/<profile>/storage/default/` |

#### 🐧 Linux

| Browser | Path |
|---------|------|
| **Google Chrome** | `~/.config/google-chrome/Default/Local Storage/leveldb/` |
| **Firefox** | `~/.mozilla/firefox/<profile>/storage/default/` |

### ⚠️ Important — data loss warning

> **Clearing your browser's cache/cookies/site data will permanently delete all app data.**  
> Always export a backup before clearing browser data or switching to a different browser.

### 🔄 Backup and restore your data

The app includes a built-in export/import tool so you never lose your data.

#### To back up (export)

1. Open the app and go to **Settings** (gear icon in the sidebar).
2. Click **Export Data**.
3. A file named `fpo-accounting-backup-YYYY-MM-DD.json` is downloaded to your computer.
4. Keep this file safe — it contains all your records.

#### To restore (import)

1. Open the app and go to **Settings**.
2. Click **Import Data** and select a previously exported `.json` backup file.
3. All records are restored and the app reloads automatically.

> ✅ You can also use Export/Import to **move data between browsers or computers**.

---

## File Structure

```
├── index.html          # Main application — open this file to start
├── open.bat            # Windows launcher — double-click to open in browser
├── css/
│   └── style.css       # Stylesheet
└── js/
    ├── storage.js      # Data storage layer (localStorage)
    └── app.js          # Application logic and UI rendering
```

## Usage Notes

- Works entirely in the browser; no internet connection required after first load.
- Data is stored in the browser's **localStorage** on your device (see [Where Is Data Stored?](#-where-is-data-stored) above).
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
