import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { useLangContext } from '../context/LangContext';

export default function AudioPage() {
  const { id } = useParams<{ id: string }>();
  const meetingId = Number(id);
  const { t } = useLangContext();
  const navigate = useNavigate();

  const [recording, setRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioUrls, setAudioUrls] = useState<Map<number, string>>(new Map());
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const meeting = useLiveQuery(() => db.meetings.get(meetingId), [meetingId]);
  const recordings = useLiveQuery(
    () => db.audioRecordings.where('meetingId').equals(meetingId).toArray(),
    [meetingId]
  );

  const locked = meeting?.locked ?? false;

  // Build object URL map whenever recordings change; revoke stale URLs on cleanup
  useEffect(() => {
    const newMap = new Map<number, string>();
    for (const rec of recordings ?? []) {
      if (rec.id != null) {
        newMap.set(rec.id, URL.createObjectURL(rec.blob));
      }
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAudioUrls(newMap);
    return () => {
      newMap.forEach(url => URL.revokeObjectURL(url));
    };
  }, [recordings]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = e => chunksRef.current.push(e.data);
      mr.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const now = Date.now();
        await db.audioRecordings.add({
          meetingId,
          blob,
          recordedAt: now,
          durationMs: duration * 1000,
        });
        stream.getTracks().forEach(track => track.stop());
      };
      mr.start();
      mediaRecorderRef.current = mr;
      setDuration(0);
      timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
      setRecording(true);
    } catch (err) {
      alert('Microphone access denied: ' + (err as Error).message);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    if (timerRef.current) clearInterval(timerRef.current);
    setRecording(false);
  };

  const deleteRecording = async (recId: number) => {
    if (!confirm(t('confirmDelete'))) return;
    await db.audioRecordings.delete(recId);
  };

  const formatDur = (ms?: number) => {
    if (!ms) return '';
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  };

  return (
    <div className="page">
      <div className="page-header">
        <button className="btn btn-secondary" onClick={() => navigate(`/meetings/${meetingId}`)}>← {t('back')}</button>
        <h2>{t('audio')}</h2>
      </div>

      {locked && <div className="info-banner">🔒 {t('locked')} - new recordings disabled.</div>}

      {!locked && (
        <div className="card audio-controls">
          {recording ? (
            <>
              <div className="recording-indicator">🔴 Recording... {duration}s</div>
              <button className="btn btn-danger" onClick={stopRecording}>{t('stop')}</button>
            </>
          ) : (
            <button className="btn btn-primary" onClick={startRecording}>🎙️ {t('record')}</button>
          )}
        </div>
      )}

      <div className="list">
        {(recordings ?? []).length === 0 && <p className="empty-msg">{t('noData')}</p>}
        {(recordings ?? []).map(rec => (
          <div key={rec.id} className="card audio-item">
            <div className="audio-info">
              <span>🎵 {new Date(rec.recordedAt).toLocaleString('en-IN')}</span>
              {rec.durationMs && <span className="duration">{formatDur(rec.durationMs)}</span>}
            </div>
            <audio controls src={rec.id != null ? (audioUrls.get(rec.id) ?? '') : ''} className="audio-player" />
            {!locked && (
              <button className="btn btn-sm btn-danger mt-4" onClick={() => deleteRecording(rec.id!)}>
                {t('delete')}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
