import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Resolution } from '../db/db';
import { useLangContext } from '../context/LangContext';

const emptyRes = (): Omit<Resolution, 'id' | 'meetingId' | 'createdAt'> => ({
  order: 0,
  titleHindi: '',
  textHindi: '',
  titleEnglish: '',
  textEnglish: '',
});

export default function ResolutionsPage() {
  const { id } = useParams<{ id: string }>();
  const meetingId = Number(id);
  const { t, currentLang } = useLangContext();
  const navigate = useNavigate();

  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Resolution | null>(null);
  const [form, setForm] = useState(emptyRes());

  const meeting = useLiveQuery(() => db.meetings.get(meetingId), [meetingId]);
  const resolutions = useLiveQuery(
    () => db.resolutions.where('meetingId').equals(meetingId).sortBy('order'),
    [meetingId]
  );

  const sorted = resolutions ?? [];
  const locked = meeting?.locked ?? false;

  const openAdd = () => {
    setForm({ ...emptyRes(), order: sorted.length });
    setEditing(null);
    setAdding(true);
  };

  const openEdit = (r: Resolution) => {
    setForm({ order: r.order, titleHindi: r.titleHindi, textHindi: r.textHindi, titleEnglish: r.titleEnglish, textEnglish: r.textEnglish });
    setEditing(r);
    setAdding(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adding) {
      await db.resolutions.add({ ...form, meetingId, createdAt: Date.now() });
    } else if (editing?.id) {
      await db.resolutions.update(editing.id, form);
    }
    setAdding(false);
    setEditing(null);
  };

  const handleDelete = async (r: Resolution) => {
    if (!confirm(t('confirmDelete'))) return;
    await db.resolutions.delete(r.id!);
    // reorder remaining
    const remaining = sorted.filter(x => x.id !== r.id);
    for (let i = 0; i < remaining.length; i++) {
      await db.resolutions.update(remaining[i].id!, { order: i });
    }
  };

  const moveUp = async (index: number) => {
    if (index === 0) return;
    const a = sorted[index];
    const b = sorted[index - 1];
    await db.resolutions.update(a.id!, { order: b.order });
    await db.resolutions.update(b.id!, { order: a.order });
  };

  const moveDown = async (index: number) => {
    if (index === sorted.length - 1) return;
    const a = sorted[index];
    const b = sorted[index + 1];
    await db.resolutions.update(a.id!, { order: b.order });
    await db.resolutions.update(b.id!, { order: a.order });
  };

  const showForm = adding || editing !== null;

  return (
    <div className="page">
      <div className="page-header">
        <button className="btn btn-secondary" onClick={() => navigate(`/meetings/${meetingId}`)}>← {t('back')}</button>
        <h2>{t('resolutions')}</h2>
        {!locked && <button className="btn btn-primary" onClick={openAdd}>{t('addResolution')}</button>}
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="card form-card">
          <h3>{adding ? t('addResolution') : t('edit')}</h3>
          <div className="form-group">
            <label>{t('titleHindi')} *</label>
            <input type="text" value={form.titleHindi} onChange={e => setForm(f => ({ ...f, titleHindi: e.target.value }))} className="form-input" required />
          </div>
          <div className="form-group">
            <label>{t('textHindi')} *</label>
            <textarea value={form.textHindi} onChange={e => setForm(f => ({ ...f, textHindi: e.target.value }))} className="form-input" rows={3} required />
          </div>
          <div className="form-group">
            <label>{t('titleEnglish')} *</label>
            <input type="text" value={form.titleEnglish} onChange={e => setForm(f => ({ ...f, titleEnglish: e.target.value }))} className="form-input" required />
          </div>
          <div className="form-group">
            <label>{t('textEnglish')} *</label>
            <textarea value={form.textEnglish} onChange={e => setForm(f => ({ ...f, textEnglish: e.target.value }))} className="form-input" rows={3} required />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => { setAdding(false); setEditing(null); }}>{t('cancel')}</button>
            <button type="submit" className="btn btn-primary">{t('save')}</button>
          </div>
        </form>
      )}

      <div className="list">
        {sorted.length === 0 && <p className="empty-msg">{t('noData')}</p>}
        {sorted.map((r, index) => (
          <div key={r.id} className="card resolution-card">
            <div className="resolution-header">
              <span className="resolution-num">#{index + 1}</span>
              <strong>{currentLang === 'hi' ? r.titleHindi : r.titleEnglish}</strong>
              {!locked && (
                <div className="reorder-btns">
                  <button className="btn btn-sm btn-secondary" onClick={() => moveUp(index)} disabled={index === 0}>↑</button>
                  <button className="btn btn-sm btn-secondary" onClick={() => moveDown(index)} disabled={index === sorted.length - 1}>↓</button>
                </div>
              )}
            </div>
            <p className="resolution-text">{currentLang === 'hi' ? r.textHindi : r.textEnglish}</p>
            {!locked && (
              <div className="list-item-actions mt-4">
                <button className="btn btn-sm btn-secondary" onClick={() => openEdit(r)}>{t('edit')}</button>
                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(r)}>{t('delete')}</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
