/**
 * Agridizz FPC Meetings — app.js
 * Vanilla JS, LocalStorage-based, no external dependencies.
 */

'use strict';

// ============================================================
// Storage Helpers
// ============================================================

const KEYS = { meetings: 'fpc_meetings', members: 'fpc_members' };

function loadData(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch (_) {
    return [];
  }
}

function saveData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function getMeetings() { return loadData(KEYS.meetings); }
function getMembers()  { return loadData(KEYS.members); }
function saveMeetings(d) { saveData(KEYS.meetings, d); }
function saveMembers(d)  { saveData(KEYS.members, d); }

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ============================================================
// Toast Notifications
// ============================================================

function showToast(message, type = 'success', duration = 3000) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast' + (type !== 'success' ? ' ' + type : '');
  toast.textContent = message;
  container.appendChild(toast);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('show'));
  });
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ============================================================
// Modal Helpers
// ============================================================

function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) { modal.classList.add('open'); trapFocus(modal); }
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('open');
}

function trapFocus(modal) {
  const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  if (focusable.length) focusable[0].focus();
}

// Close modal on backdrop click
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal')) closeModal(e.target.id);
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal.open').forEach(m => closeModal(m.id));
  }
});

// ============================================================
// Confirm Dialog
// ============================================================

function showConfirm(title, message, onConfirm) {
  document.getElementById('confirmTitle').textContent   = title;
  document.getElementById('confirmMessage').textContent = message;
  const btn = document.getElementById('confirmOkBtn');
  const newBtn = btn.cloneNode(true);
  btn.parentNode.replaceChild(newBtn, btn);
  newBtn.addEventListener('click', () => { closeModal('confirmModal'); onConfirm(); });
  openModal('confirmModal');
}

// ============================================================
// Navigation / Pages
// ============================================================

function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

  const page = document.getElementById('page-' + pageId);
  if (page) page.classList.add('active');

  const link = document.querySelector(`.nav-link[data-page="${pageId}"]`);
  if (link) link.classList.add('active');

  if (pageId === 'dashboard') renderDashboard();
  if (pageId === 'meetings')  renderMeetings();
  if (pageId === 'members')   renderMembers();

  // Close sidebar on mobile after navigation
  if (window.innerWidth < 768) closeSidebar();
}

document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    showPage(link.dataset.page);
  });
});

// Also catch [data-page] links in content areas (e.g. empty state prompts)
document.addEventListener('click', (e) => {
  const target = e.target.closest('[data-page]');
  if (target && !target.classList.contains('nav-link')) {
    e.preventDefault();
    showPage(target.dataset.page);
  }
});

// ============================================================
// Sidebar Toggle (mobile)
// ============================================================

function openSidebar() {
  document.getElementById('sidebar').classList.add('open');
  document.getElementById('overlay').classList.add('visible');
}

function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('overlay').classList.remove('visible');
}

document.getElementById('menuToggle').addEventListener('click', () => {
  document.getElementById('sidebar').classList.contains('open') ? closeSidebar() : openSidebar();
});

document.getElementById('overlay').addEventListener('click', closeSidebar);

// ============================================================
// Dashboard
// ============================================================

function renderDashboard() {
  const meetings = getMeetings();
  const members  = getMembers();
  const today    = new Date().toISOString().slice(0, 10);

  const total     = meetings.length;
  const completed = meetings.filter(m => m.status === 'completed').length;
  const upcoming  = meetings.filter(m => m.status === 'upcoming' && m.date >= today).length;

  document.getElementById('statTotalMeetings').textContent    = total;
  document.getElementById('statCompletedMeetings').textContent = completed;
  document.getElementById('statUpcomingMeetings').textContent  = upcoming;
  document.getElementById('statTotalMembers').textContent      = members.length;

  const recentList = document.getElementById('recentMeetingsList');
  const sorted = [...meetings].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  if (sorted.length === 0) {
    recentList.innerHTML = '<p class="empty-msg">No meetings yet. <a href="#" data-page="meetings">Create one →</a></p>';
  } else {
    recentList.innerHTML = sorted.map(m => meetingCardHTML(m)).join('');
  }
}

// ============================================================
// Meetings
// ============================================================

function openMeetingModal(id = null) {
  const form = document.getElementById('meetingForm');
  form.reset();
  document.getElementById('meetingId').value = '';

  buildAttendeeCheckboxes();

  if (id) {
    const meeting = getMeetings().find(m => m.id === id);
    if (!meeting) return;
    document.getElementById('meetingModalTitle').textContent = 'Edit Meeting';
    document.getElementById('meetingId').value       = meeting.id;
    document.getElementById('meetingTitle').value    = meeting.title;
    document.getElementById('meetingDate').value     = meeting.date;
    document.getElementById('meetingTime').value     = meeting.time     || '';
    document.getElementById('meetingLocation').value = meeting.location || '';
    document.getElementById('meetingAgenda').value   = meeting.agenda   || '';
    document.getElementById('meetingStatus').value   = meeting.status   || 'upcoming';

    const attendees = meeting.attendees || [];
    document.querySelectorAll('#attendeeCheckboxes input[type="checkbox"]').forEach(cb => {
      cb.checked = attendees.includes(cb.value);
    });
  } else {
    document.getElementById('meetingModalTitle').textContent = 'New Meeting';
    document.getElementById('meetingDate').value = new Date().toISOString().slice(0, 10);
  }

  openModal('meetingModal');
}

function buildAttendeeCheckboxes() {
  const container = document.getElementById('attendeeCheckboxes');
  const members = getMembers();
  if (members.length === 0) {
    container.innerHTML = '<span style="font-size:.82rem;color:var(--text-muted)">No members yet. Add members first.</span>';
    return;
  }
  container.innerHTML = members.map(m =>
    `<label>
      <input type="checkbox" value="${escHtml(m.id)}" />
      ${escHtml(m.name)}${m.role ? ' <em style="color:var(--text-muted)">(' + escHtml(m.role) + ')</em>' : ''}
    </label>`
  ).join('');
}

function saveMeeting(e) {
  e.preventDefault();
  const id = document.getElementById('meetingId').value;
  const meetings = getMeetings();

  const attendees = Array.from(
    document.querySelectorAll('#attendeeCheckboxes input[type="checkbox"]:checked')
  ).map(cb => cb.value);

  const data = {
    id:       id || generateId(),
    title:    document.getElementById('meetingTitle').value.trim(),
    date:     document.getElementById('meetingDate').value,
    time:     document.getElementById('meetingTime').value,
    location: document.getElementById('meetingLocation').value.trim(),
    agenda:   document.getElementById('meetingAgenda').value.trim(),
    status:   document.getElementById('meetingStatus').value,
    attendees,
    updatedAt: new Date().toISOString(),
  };

  if (id) {
    const idx = meetings.findIndex(m => m.id === id);
    if (idx !== -1) {
      data.createdAt = meetings[idx].createdAt;
      meetings[idx] = data;
    }
  } else {
    data.createdAt = new Date().toISOString();
    meetings.push(data);
  }

  saveMeetings(meetings);
  closeModal('meetingModal');
  renderMeetings();
  showToast(id ? 'Meeting updated.' : 'Meeting created.');
}

function deleteMeeting(id) {
  const meeting = getMeetings().find(m => m.id === id);
  if (!meeting) return;
  showConfirm('Delete Meeting', `Delete "${meeting.title}"? This cannot be undone.`, () => {
    saveMeetings(getMeetings().filter(m => m.id !== id));
    renderMeetings();
    showToast('Meeting deleted.', 'warning');
  });
}

function renderMeetings() {
  const meetings = getMeetings();
  const search   = (document.getElementById('meetingSearch')?.value || '').toLowerCase();
  const filter   = document.getElementById('meetingFilter')?.value || 'all';
  const today    = new Date().toISOString().slice(0, 10);

  let filtered = meetings.filter(m => {
    const matchSearch = m.title.toLowerCase().includes(search) || (m.location || '').toLowerCase().includes(search);
    const matchFilter = filter === 'all'
      || (filter === 'upcoming'  && m.status === 'upcoming')
      || (filter === 'completed' && m.status === 'completed');
    return matchSearch && matchFilter;
  });

  filtered.sort((a, b) => b.date.localeCompare(a.date));

  const list = document.getElementById('meetingsList');
  if (filtered.length === 0) {
    list.innerHTML = '<p class="empty-msg">No meetings found.</p>';
    return;
  }
  list.innerHTML = filtered.map(m => meetingCardHTML(m, true)).join('');
}

function meetingCardHTML(meeting, showActions = false) {
  const dateStr = formatDate(meeting.date);
  const actions = showActions
    ? `<div class="item-actions">
         <button class="btn btn-icon" onclick="openMeetingModal('${meeting.id}')" title="Edit">✏️</button>
         <button class="btn btn-icon" onclick="deleteMeeting('${meeting.id}')" title="Delete">🗑️</button>
       </div>`
    : '';

  return `<div class="item-card status-${meeting.status}">
    <div class="item-card-body">
      <h3>${escHtml(meeting.title)}</h3>
      <div class="meta">
        <span>${escHtml(dateStr)}</span>
        ${meeting.time     ? `<span>${escHtml(meeting.time)}</span>` : ''}
        ${meeting.location ? `<span>📍 ${escHtml(meeting.location)}</span>` : ''}
        <span><span class="badge badge-${meeting.status}">${escHtml(meeting.status)}</span></span>
      </div>
    </div>
    ${actions}
  </div>`;
}

// ============================================================
// Members
// ============================================================

function openMemberModal(id = null) {
  const form = document.getElementById('memberForm');
  form.reset();
  document.getElementById('memberId').value = '';

  if (id) {
    const member = getMembers().find(m => m.id === id);
    if (!member) return;
    document.getElementById('memberModalTitle').textContent = 'Edit Member';
    document.getElementById('memberId').value      = member.id;
    document.getElementById('memberName').value    = member.name;
    document.getElementById('memberPhone').value   = member.phone   || '';
    document.getElementById('memberEmail').value   = member.email   || '';
    document.getElementById('memberRole').value    = member.role    || '';
    document.getElementById('memberVillage').value = member.village || '';
  } else {
    document.getElementById('memberModalTitle').textContent = 'Add Member';
  }

  openModal('memberModal');
}

function saveMember(e) {
  e.preventDefault();
  const id = document.getElementById('memberId').value;
  const members = getMembers();

  const data = {
    id:      id || generateId(),
    name:    document.getElementById('memberName').value.trim(),
    phone:   document.getElementById('memberPhone').value.trim(),
    email:   document.getElementById('memberEmail').value.trim(),
    role:    document.getElementById('memberRole').value.trim(),
    village: document.getElementById('memberVillage').value.trim(),
    updatedAt: new Date().toISOString(),
  };

  if (id) {
    const idx = members.findIndex(m => m.id === id);
    if (idx !== -1) {
      data.createdAt = members[idx].createdAt;
      members[idx] = data;
    }
  } else {
    data.createdAt = new Date().toISOString();
    members.push(data);
  }

  saveMembers(members);
  closeModal('memberModal');
  renderMembers();
  showToast(id ? 'Member updated.' : 'Member added.');
}

function deleteMember(id) {
  const member = getMembers().find(m => m.id === id);
  if (!member) return;
  showConfirm('Remove Member', `Remove "${member.name}"? This cannot be undone.`, () => {
    saveMembers(getMembers().filter(m => m.id !== id));
    renderMembers();
    showToast('Member removed.', 'warning');
  });
}

function renderMembers() {
  const members = getMembers();
  const search  = (document.getElementById('memberSearch')?.value || '').toLowerCase();

  const filtered = members.filter(m =>
    m.name.toLowerCase().includes(search) ||
    (m.role || '').toLowerCase().includes(search) ||
    (m.village || '').toLowerCase().includes(search)
  ).sort((a, b) => a.name.localeCompare(b.name));

  const list = document.getElementById('membersList');
  if (filtered.length === 0) {
    list.innerHTML = '<p class="empty-msg">No members found.</p>';
    return;
  }

  list.innerHTML = filtered.map(m => `
    <div class="item-card">
      <div class="item-card-body">
        <h3>${escHtml(m.name)}</h3>
        <div class="meta">
          ${m.role    ? `<span>${escHtml(m.role)}</span>` : ''}
          ${m.village ? `<span>📍 ${escHtml(m.village)}</span>` : ''}
          ${m.phone   ? `<span>📞 ${escHtml(m.phone)}</span>` : ''}
        </div>
      </div>
      <div class="item-actions">
        <button class="btn btn-icon" onclick="openMemberModal('${m.id}')" title="Edit">✏️</button>
        <button class="btn btn-icon" onclick="deleteMember('${m.id}')" title="Remove">🗑️</button>
      </div>
    </div>
  `).join('');
}

// ============================================================
// Data Export / Import
// ============================================================

function exportData() {
  const payload = {
    exportedAt: new Date().toISOString(),
    version: '1.0',
    meetings: getMeetings(),
    members:  getMembers(),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  triggerDownload(blob, `fpc-meetings-export-${dateSlug()}.json`);
  showToast('Data exported successfully.');
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (!data.meetings || !data.members) throw new Error('Invalid format');

      showConfirm(
        'Import Data',
        'Importing will REPLACE all existing data. Continue?',
        () => {
          saveMeetings(data.meetings);
          saveMembers(data.members);
          showToast('Data imported successfully.');
          renderDashboard();
        }
      );
    } catch (_) {
      showToast('Invalid JSON file. Please export a valid backup first.', 'error');
    } finally {
      event.target.value = '';
    }
  };
  reader.readAsText(file);
}

function clearAllData() {
  showConfirm('Clear All Data', 'This will permanently delete ALL meetings and members. Continue?', () => {
    saveMeetings([]);
    saveMembers([]);
    renderDashboard();
    showToast('All data cleared.', 'warning');
  });
}

// ============================================================
// Download Setup File
// ============================================================

/**
 * Detects the user's OS and downloads the appropriate setup file.
 * Pass 'bat' or 'sh' to force a specific variant.
 * @param {string|null} forceType - 'bat' | 'sh' | null (auto-detect)
 */
function downloadSetupFile(forceType = null) {
  const platform = (navigator.userAgentData?.platform || navigator.platform || '').toLowerCase();
  const ua = navigator.userAgent.toLowerCase();
  const isWindows = forceType === 'bat'
    || (!forceType && platform.includes('win') && !ua.includes('mac'));

  if (isWindows) {
    downloadWindowsSetup();
  } else {
    downloadUnixSetup();
  }
}

function downloadWindowsSetup() {
  const content = [
    '@echo off',
    'setlocal',
    '',
    'REM Agridizz FPC Meetings — Windows Setup',
    'REM Opens the app in the default browser.',
    '',
    'set "SCRIPT_DIR=%~dp0"',
    'set "INDEX=%SCRIPT_DIR%index.html"',
    '',
    'if not exist "%INDEX%" (',
    '    echo ERROR: index.html not found in %SCRIPT_DIR%',
    '    echo Please make sure setup.bat and index.html are in the same folder.',
    '    pause',
    '    exit /b 1',
    ')',
    '',
    'echo Opening Agridizz FPC Meetings...',
    'start "" "%INDEX%"',
    'exit /b 0',
  ].join('\r\n');

  const blob = new Blob([content], { type: 'text/plain' });
  triggerDownload(blob, 'setup.bat');
  showToast('setup.bat downloaded. Run it to open the app.');
}

function downloadUnixSetup() {
  const content = [
    '#!/usr/bin/env bash',
    '# Agridizz FPC Meetings — Mac/Linux Setup',
    '# Opens index.html in the default browser.',
    '',
    'SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"',
    'INDEX="$SCRIPT_DIR/index.html"',
    '',
    'if [ ! -f "$INDEX" ]; then',
    '  echo "ERROR: index.html not found in $SCRIPT_DIR"',
    '  echo "Please make sure setup.sh and index.html are in the same folder."',
    '  exit 1',
    'fi',
    '',
    '# Make this script executable if it is not already (one-time, harmless guard)',
    'if [ ! -x "$0" ]; then',
    '  chmod +x "$0"',
    'fi',
    '',
    'echo "Opening Agridizz FPC Meetings..."',
    '',
    'if command -v xdg-open &>/dev/null; then',
    '  xdg-open "$INDEX"',
    'elif command -v open &>/dev/null; then',
    '  open "$INDEX"',
    'else',
    '  echo "Could not detect a browser opener. Please open index.html manually."',
    '  exit 1',
    'fi',
  ].join('\n');

  const blob = new Blob([content], { type: 'text/plain' });
  triggerDownload(blob, 'setup.sh');
  showToast('setup.sh downloaded. Run it to open the app.');
}

// ============================================================
// Utility Helpers
// ============================================================

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement('a');
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${d} ${months[parseInt(m, 10) - 1]} ${y}`;
}

function dateSlug() {
  return new Date().toISOString().slice(0, 10);
}

// ============================================================
// Init
// ============================================================

(function init() {
  showPage('dashboard');
})();
