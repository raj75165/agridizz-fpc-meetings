# 🌾 Agridizz FPC Meetings

A simple, **offline-first** meeting management web app for Farmer Producer Companies (FPCs).  
No server required — everything runs in the browser using LocalStorage.

---

## ✨ Features

- 📊 **Dashboard** — instant stats (total meetings, upcoming, completed, member count) and recent meetings at a glance
- 📅 **Meetings** — create, edit, delete meetings with title, date, time, location, agenda, status and attendee tracking
- 👥 **Members** — manage your member list (name, phone, email, role, village)
- ⚙️ **Settings** — export data as JSON, import a backup, clear all data
- ⬇ **Download Setup File** — one-click download of the right launcher script for your OS (Windows `.bat` / Mac/Linux `.sh`)
- 🔍 Search & filter meetings and members in real time
- 🔔 Toast notifications for every action
- 📱 Fully responsive / mobile-friendly — no external dependencies, pure HTML + CSS + JS

---

## 🚀 Getting Started

### Option 1 — Double-click the setup file (recommended)

1. Download or clone this repository to your computer.
2. Open the app by running the appropriate setup file for your OS:

**Windows**

```
Double-click  setup.bat
```

Or from the command prompt:
```bat
setup.bat
```

**Mac / Linux**

```bash
chmod +x setup.sh   # only needed once
./setup.sh
```

Both scripts check that `index.html` is present in the same folder and open it in your default browser.

---

### Option 2 — Open directly in a browser

Simply open `index.html` in any modern browser (Chrome, Firefox, Edge, Safari).

> **Tip:** You can also use the **⬇ Download Setup File** button inside the app (Settings page or the sidebar footer) to download the correct launcher for your OS at any time.

---

## ⬇ Download Setup File Button

The **⬇ Download Setup File** button is available in:
- The **sidebar footer** (always visible)
- The **Settings → Setup Files** section

Clicking it auto-detects your operating system:
- **Windows** → downloads `setup.bat`
- **Mac / Linux** → downloads `setup.sh`

You can also force a specific platform using the dedicated buttons in Settings.  
The file content is generated dynamically in the browser as a Blob — no network request needed.

---

## 📂 Project Structure

```
agridizz-fpc-meetings/
├── index.html        ← Main single-page application
├── css/
│   └── style.css     ← Mobile-first responsive stylesheet
├── js/
│   └── app.js        ← All application logic (vanilla JS)
├── setup.bat         ← Windows launcher
├── setup.sh          ← Mac/Linux launcher
└── README.md
```

---

## 💾 Data Storage

All data is stored in the browser's **LocalStorage** under the keys `fpc_meetings` and `fpc_members`.  
Data persists across browser sessions on the same device and browser profile.

### Export / Import

- **Export** — saves a timestamped `.json` file to your Downloads folder.
- **Import** — loads a previously exported JSON file, **replacing** current data (a confirmation prompt is shown first).

---

## 🛠 Technical Details

| Detail | Value |
|---|---|
| Dependencies | None (vanilla HTML/CSS/JS) |
| Storage | `window.localStorage` |
| Offline support | ✅ Full offline, no network needed |
| Browser support | All modern browsers (ES2015+) |

---

## 📝 License

MIT — free to use and modify.
