import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Meeting } from '../db/db';
import { useLangContext } from '../context/LangContext';
import { useAuth } from '../hooks/useAuth';
import { generateMeetingPdf } from '../components/PdfGenerator';

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function MeetingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const meetingId = Number(id);
  const { t } = useLangContext();
  const navigate = useNavigate();
  const { checkPin } = useAuth();

  const [editing, setEditing] = useState(false);
  const [lockPin, setLockPin] = useState('');
  const [showLockModal, setShowLockModal] = useState(false);
  const [lockError, setLockError] = useState('');
  const [form, setForm] = useState<Partial<Meeting>>({});

  const meeting = useLiveQuery(() => db.meetings.get(meetingId), [meetingId]);
  const allMembers = useLiveQuery(() => db.members.toArray(), []);
  const activeMembers = (allMembers ?? []).filter(m => m.active);
  const resolutions = useLiveQuery(() => db.resolutions.where('meetingId').equals(meetingId).toArray(), [meetingId]);
  const signatures = useLiveQuery(() => db.signatures.where('meetingId').equals(meetingId).toArray(), [meetingId]);

  if (!meeting) return <div className="page"><p>{t('loading')}</p></div>;

  const attendees = (allMembers ?? []).filter(m => meeting.attendeeIds.includes(m.id!));
  const signatureMembers = (allMembers ?? []).filter(m => meeting.signatureMemberIds.includes(m.id!));

  const startEdit = () => {
    setForm({
      type: meeting.type,
      date: meeting.date,
      time: meeting.time,
      venue: meeting.venue,
      notes: meeting.notes ?? '',
    });
    setEditing(true);
  };

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    await db.meetings.update(meetingId, form);
    setEditing(false);
  };

  const toggleAttendee = async (memberId: number) => {
    if (meeting.locked) return;
    const ids = meeting.attendeeIds.includes(memberId)
      ? meeting.attendeeIds.filter(i => i !== memberId)
      : [...meeting.attendeeIds, memberId];
    await db.meetings.update(meetingId, { attendeeIds: ids });
  };

  const toggleSignatureMember = async (memberId: number) => {
    if (meeting.locked) return;
    const ids = meeting.signatureMemberIds.includes(memberId)
      ? meeting.signatureMemberIds.filter(i => i !== memberId)
      : meeting.signatureMemberIds.length < 5
        ? [...meeting.signatureMemberIds, memberId]
        : meeting.signatureMemberIds;
    await db.meetings.update(meetingId, { signatureMemberIds: ids });
  };

  const handleLockToggle = () => {
    setLockPin('');
    setLockError('');
    setShowLockModal(true);
  };

  const confirmLock = async () => {
    if (!checkPin(lockPin)) {
      setLockError(t('pinWrong'));
      return;
    }
    if (meeting.locked) {
      await db.meetings.update(meetingId, { locked: false, lockedAt: undefined });
    } else {
      await db.meetings.update(meetingId, { locked: true, lockedAt: Date.now() });
    }
    setShowLockModal(false);
  };

  const handleGeneratePdf = async () => {
    try {
      const pdfBytes = await generateMeetingPdf(
        meeting,
        allMembers ?? [],
        resolutions ?? [],
        signatures ?? []
      );
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `meeting-${meeting.date}-${meeting.type}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('PDF generation failed: ' + (err as Error).message);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <button className="btn btn-secondary" onClick={() => navigate('/meetings')}>← {t('back')}</button>
        <div className="header-actions">
          {!meeting.locked && <button className="btn btn-secondary" onClick={startEdit}>{t('edit')}</button>}
          <button className={`btn ${meeting.locked ? 'btn-secondary' : 'btn-danger'}`} onClick={handleLockToggle}>
            {meeting.locked ? t('unlock') : t('lock')}
          </button>
          <button className="btn btn-primary" onClick={handleGeneratePdf}>{t('generatePdf')}</button>
        </div>
      </div>

      {showLockModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{meeting.locked ? t('unlock') : t('lock')}</h3>
            <p>{t('enterPin')}</p>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={lockPin}
              onChange={e => setLockPin(e.target.value.replace(/\D/g, ''))}
              className="pin-input"
              autoFocus
            />
            {lockError && <p className="error-msg">{lockError}</p>}
            <div className="form-actions">
              <button className="btn btn-secondary" onClick={() => setShowLockModal(false)}>{t('cancel')}</button>
              <button className="btn btn-primary" onClick={confirmLock}>{t('submit')}</button>
            </div>
          </div>
        </div>
      )}

      {editing ? (
        <form onSubmit={saveEdit} className="card form-card">
          <h3>{t('edit')}</h3>
          <div className="form-group">
            <label>{t('meetingType')}</label>
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as Meeting['type'] }))} className="form-input">
              <option value="Annual">{t('annual')}</option>
              <option value="Special">{t('special')}</option>
              <option value="Board">{t('board')}</option>
            </select>
          </div>
          <div className="form-group">
            <label>{t('date')}</label>
            <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="form-input" required />
          </div>
          <div className="form-group">
            <label>{t('time')}</label>
            <input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} className="form-input" required />
          </div>
          <div className="form-group">
            <label>{t('venue')}</label>
            <input type="text" value={form.venue} onChange={e => setForm(f => ({ ...f, venue: e.target.value }))} className="form-input" required />
          </div>
          <div className="form-group">
            <label>{t('notes')}</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="form-input" rows={2} />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)}>{t('cancel')}</button>
            <button type="submit" className="btn btn-primary">{t('save')}</button>
          </div>
        </form>
      ) : (
        <div className="card">
          <div className="meeting-detail-info">
            <h3>{meeting.type} Meeting</h3>
            <p>📅 {formatDate(meeting.date)} at {meeting.time}</p>
            <p>📍 {meeting.venue}</p>
            {meeting.notes && <p className="notes-text">📝 {meeting.notes}</p>}
            <span className={`badge ${meeting.locked ? 'badge-red' : 'badge-green'}`}>
              {meeting.locked ? t('locked') : t('unlocked')}
            </span>
            {meeting.lockedAt && <span className="lock-time"> • Locked {new Date(meeting.lockedAt).toLocaleString('en-IN')}</span>}
          </div>
        </div>
      )}

      {/* Attendance */}
      <div className="card">
        <h3>{t('attendance')}</h3>
        <p className="section-hint">{t('selectAttendees')}</p>
        <div className="member-checklist">
          {activeMembers.map(m => (
            <label key={m.id} className={`member-check-item ${meeting.locked ? 'disabled' : ''}`}>
              <input
                type="checkbox"
                checked={meeting.attendeeIds.includes(m.id!)}
                onChange={() => toggleAttendee(m.id!)}
                disabled={meeting.locked}
              />
              <span>{m.name}</span>
              <span className={`badge ${m.role === 'Director' ? 'badge-blue' : 'badge-gray'}`}>{m.role}</span>
            </label>
          ))}
          {activeMembers.length === 0 && <p className="empty-msg">{t('noData')}</p>}
        </div>

        {attendees.length > 0 && (
          <div className="mt-8">
            <strong>{t('selectMembers')}</strong>
            <div className="member-checklist mt-4">
              {activeMembers.filter(m => m.role === 'Member' && meeting.attendeeIds.includes(m.id!)).map(m => (
                <label key={m.id} className={`member-check-item ${meeting.locked ? 'disabled' : ''}`}>
                  <input
                    type="checkbox"
                    checked={meeting.signatureMemberIds.includes(m.id!)}
                    onChange={() => toggleSignatureMember(m.id!)}
                    disabled={meeting.locked}
                  />
                  <span>{m.name}</span>
                  <span className="badge badge-gray">Sig</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Navigation sections */}
      <div className="section-links">
        <Link to={`/meetings/${meetingId}/resolutions`} className="section-link-card">
          <span className="section-icon">📜</span>
          <span>{t('resolutions')} ({resolutions?.length ?? 0})</span>
          <span className="chevron">›</span>
        </Link>
        <Link to={`/meetings/${meetingId}/signatures`} className="section-link-card">
          <span className="section-icon">✍️</span>
          <span>{t('signatures')} ({signatures?.length ?? 0})</span>
          <span className="chevron">›</span>
        </Link>
        <Link to={`/meetings/${meetingId}/audio`} className="section-link-card">
          <span className="section-icon">🎙️</span>
          <span>{t('audio')}</span>
          <span className="chevron">›</span>
        </Link>
      </div>

      {/* Attendee summary */}
      {attendees.length > 0 && (
        <div className="card">
          <h4>{t('attendance')} ({attendees.length})</h4>
          {attendees.map(a => <span key={a.id} className="attendee-chip">{a.name}</span>)}
        </div>
      )}
      {signatureMembers.length > 0 && (
        <div className="card">
          <h4>{t('signatures')} Members ({signatureMembers.length}/5)</h4>
          {signatureMembers.map(m => <span key={m.id} className="attendee-chip">{m.name}</span>)}
        </div>
      )}
    </div>
  );
}
