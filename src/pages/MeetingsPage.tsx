import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Meeting } from '../db/db';
import { useLangContext } from '../context/LangContext';

const emptyMeeting = (): Omit<Meeting, 'id' | 'createdAt'> => ({
  type: 'Board',
  date: new Date().toISOString().slice(0, 10),
  time: '10:00',
  venue: '',
  notes: '',
  attendeeIds: [],
  signatureMemberIds: [],
  locked: false,
});

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function MeetingsPage() {
  const { t } = useLangContext();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(emptyMeeting());

  const meetings = useLiveQuery(
    () => db.meetings.orderBy('date').reverse().toArray(),
    []
  );

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.venue.trim()) return;
    const id = await db.meetings.add({ ...form, createdAt: Date.now() });
    setAdding(false);
    setForm(emptyMeeting());
    navigate(`/meetings/${id}`);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2>{t('meetings')}</h2>
        <button className="btn btn-primary" onClick={() => setAdding(v => !v)}>{t('addMeeting')}</button>
      </div>

      {adding && (
        <form onSubmit={handleAdd} className="card form-card">
          <h3>{t('addMeeting')}</h3>
          <div className="form-group">
            <label>{t('meetingType')}</label>
            <select
              value={form.type}
              onChange={e => setForm(f => ({ ...f, type: e.target.value as Meeting['type'] }))}
              className="form-input"
            >
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
            <label>{t('venue')} *</label>
            <input type="text" value={form.venue} onChange={e => setForm(f => ({ ...f, venue: e.target.value }))} className="form-input" required />
          </div>
          <div className="form-group">
            <label>{t('notes')}</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="form-input" rows={2} />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setAdding(false)}>{t('cancel')}</button>
            <button type="submit" className="btn btn-primary">{t('save')}</button>
          </div>
        </form>
      )}

      <div className="list">
        {(meetings ?? []).length === 0 && <p className="empty-msg">{t('noData')}</p>}
        {(meetings ?? []).map(m => (
          <div key={m.id} className="list-item clickable" onClick={() => navigate(`/meetings/${m.id}`)}>
            <div className="list-item-info">
              <span className="meeting-type-label">{m.type}</span>
              <span className="meeting-date">{formatDate(m.date)} {m.time}</span>
              <span className="meeting-venue">📍 {m.venue}</span>
            </div>
            <div className="list-item-actions">
              <span className={`badge ${m.locked ? 'badge-red' : 'badge-green'}`}>
                {m.locked ? t('locked') : t('unlocked')}
              </span>
              <span className="chevron">›</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
