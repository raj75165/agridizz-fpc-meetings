import React, { useState, useRef } from 'react';
import { useLangContext } from '../components/Layout';
import { useAuth } from '../hooks/useAuth';
import { db } from '../db/db';

const APP_VERSION = '1.0.0';

export default function SettingsPage() {
  const { t } = useLangContext();
  const { changePin } = useAuth();

  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinMsg, setPinMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    setPinMsg('');
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setPinMsg(t('pin4digits'));
      return;
    }
    if (newPin !== confirmPin) {
      setPinMsg(t('pinMismatch'));
      return;
    }
    if (!changePin(oldPin, newPin)) {
      setPinMsg(t('pinWrong'));
      return;
    }
    setPinMsg(t('success') + '!');
    setOldPin(''); setNewPin(''); setConfirmPin('');
  };

  const handleExport = async () => {
    try {
      const [members, meetings, resolutions, signatures] = await Promise.all([
        db.members.toArray(),
        db.meetings.toArray(),
        db.resolutions.toArray(),
        db.signatures.toArray(),
      ]);
      // Audio blobs can't be easily JSON serialised - skip them or convert
      const audioRecordings = await db.audioRecordings.toArray();
      const audioExport = await Promise.all(audioRecordings.map(async r => {
        const ab = await r.blob.arrayBuffer();
        const b64 = btoa(String.fromCharCode(...new Uint8Array(ab)));
        return { ...r, blob: b64, blobType: r.blob.type };
      }));

      const data = { members, meetings, resolutions, signatures, audioRecordings: audioExport, exportedAt: Date.now() };
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fpc-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Export failed: ' + (err as Error).message);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!confirm(t('importWarning'))) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      await db.transaction('rw', [db.members, db.meetings, db.resolutions, db.signatures, db.audioRecordings], async () => {
        await db.members.clear();
        await db.meetings.clear();
        await db.resolutions.clear();
        await db.signatures.clear();
        await db.audioRecordings.clear();

        if (data.members?.length) await db.members.bulkAdd(data.members);
        if (data.meetings?.length) await db.meetings.bulkAdd(data.meetings);
        if (data.resolutions?.length) await db.resolutions.bulkAdd(data.resolutions);
        if (data.signatures?.length) await db.signatures.bulkAdd(data.signatures);
        if (data.audioRecordings?.length) {
          const restored = data.audioRecordings.map((r: { blob: string; blobType: string; [k: string]: unknown }) => {
            const { blob: b64, blobType, ...rest } = r;
            const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
            const blob = new Blob([bytes], { type: blobType || 'audio/webm' });
            return { ...rest, blob };
          });
          await db.audioRecordings.bulkAdd(restored);
        }
      });

      alert(t('success') + '! Data imported.');
    } catch (err) {
      alert('Import failed: ' + (err as Error).message);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="page">
      <h2>{t('settings')}</h2>

      {/* Change PIN */}
      <div className="card">
        <h3>{t('changePin')}</h3>
        <form onSubmit={handleChangePin}>
          <div className="form-group">
            <label>{t('oldPin')}</label>
            <input type="password" inputMode="numeric" maxLength={4} value={oldPin} onChange={e => setOldPin(e.target.value.replace(/\D/g, ''))} className="pin-input" />
          </div>
          <div className="form-group">
            <label>{t('newPin')}</label>
            <input type="password" inputMode="numeric" maxLength={4} value={newPin} onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))} className="pin-input" />
          </div>
          <div className="form-group">
            <label>{t('confirmPin')}</label>
            <input type="password" inputMode="numeric" maxLength={4} value={confirmPin} onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ''))} className="pin-input" />
          </div>
          {pinMsg && <p className={pinMsg.includes(t('success')) ? 'success-msg' : 'error-msg'}>{pinMsg}</p>}
          <button type="submit" className="btn btn-primary">{t('save')}</button>
        </form>
      </div>

      {/* Export / Import */}
      <div className="card">
        <h3>Backup & Restore</h3>
        <button className="btn btn-primary mb-8" onClick={handleExport}>⬇️ {t('exportData')}</button>
        <div>
          <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
            ⬆️ {t('importData')}
            <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
          </label>
        </div>
      </div>

      {/* App Info */}
      <div className="card">
        <h3>{t('appVersion')}</h3>
        <p>Agridizz FPC Meetings v{APP_VERSION}</p>
        <p className="text-muted">Offline-first PWA • All data stored locally</p>
      </div>
    </div>
  );
}
