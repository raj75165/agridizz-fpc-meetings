import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Member } from '../db/db';
import { useLangContext } from '../components/Layout';

const emptyMember = (): Omit<Member, 'id' | 'createdAt'> => ({
  name: '',
  role: 'Member',
  active: true,
  mobile: '',
});

export default function MembersPage() {
  const { t } = useLangContext();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Member | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(emptyMember());

  const members = useLiveQuery(
    () => db.members.orderBy('name').toArray(),
    []
  );

  const filtered = (members ?? []).filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setForm(emptyMember());
    setAdding(true);
    setEditing(null);
  };

  const openEdit = (m: Member) => {
    setForm({ name: m.name, role: m.role, active: m.active, mobile: m.mobile ?? '' });
    setEditing(m);
    setAdding(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (adding) {
      await db.members.add({ ...form, createdAt: Date.now() });
    } else if (editing?.id) {
      await db.members.update(editing.id, form);
    }
    setAdding(false);
    setEditing(null);
  };

  const handleDelete = async (m: Member) => {
    if (!confirm(t('confirmDelete'))) return;
    await db.members.delete(m.id!);
  };

  const toggleActive = async (m: Member) => {
    await db.members.update(m.id!, { active: !m.active });
  };

  const showForm = adding || editing !== null;

  return (
    <div className="page">
      <div className="page-header">
        <h2>{t('members')}</h2>
        <button className="btn btn-primary" onClick={openAdd}>{t('addMember')}</button>
      </div>

      <input
        type="text"
        placeholder={t('search')}
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="search-input"
      />

      {showForm && (
        <form onSubmit={handleSave} className="card form-card">
          <h3>{adding ? t('addMember') : t('editMember')}</h3>
          <div className="form-group">
            <label>{t('name')} *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label>{t('role')}</label>
            <select
              value={form.role}
              onChange={e => setForm(f => ({ ...f, role: e.target.value as 'Director' | 'Member' }))}
              className="form-input"
            >
              <option value="Director">{t('director')}</option>
              <option value="Member">{t('member')}</option>
            </select>
          </div>
          <div className="form-group">
            <label>{t('mobile')}</label>
            <input
              type="tel"
              value={form.mobile}
              onChange={e => setForm(f => ({ ...f, mobile: e.target.value }))}
              className="form-input"
            />
          </div>
          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={form.active}
                onChange={e => setForm(f => ({ ...f, active: e.target.checked }))}
              />
              {' '}{t('active')}
            </label>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => { setAdding(false); setEditing(null); }}>{t('cancel')}</button>
            <button type="submit" className="btn btn-primary">{t('save')}</button>
          </div>
        </form>
      )}

      <div className="list">
        {filtered.length === 0 && <p className="empty-msg">{t('noData')}</p>}
        {filtered.map(m => (
          <div key={m.id} className="list-item">
            <div className="list-item-info">
              <span className="member-name">{m.name}</span>
              <span className={`badge ${m.role === 'Director' ? 'badge-blue' : 'badge-gray'}`}>{m.role}</span>
              <span className={`badge ${m.active ? 'badge-green' : 'badge-red'}`}>
                {m.active ? t('active') : t('inactive')}
              </span>
              {m.mobile && <span className="mobile-num">📱 {m.mobile}</span>}
            </div>
            <div className="list-item-actions">
              <button className="btn btn-sm btn-secondary" onClick={() => toggleActive(m)}>
                {m.active ? t('inactive') : t('active')}
              </button>
              <button className="btn btn-sm btn-secondary" onClick={() => openEdit(m)}>{t('edit')}</button>
              <button className="btn btn-sm btn-danger" onClick={() => handleDelete(m)}>{t('delete')}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
