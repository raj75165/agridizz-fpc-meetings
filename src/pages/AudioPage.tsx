import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { useLangContext } from '../components/Layout';

export default function AudioPage() {
  const { id } = useParams<{ id: string }>();
  const meetingId = Number(id);
  const { t } = useLangContext();
  const navigate = useNavigate();

  const [recording, setRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioUrlsRef = useRef<Map<number, string>>(new Map());

  const meeting = useLiveQuery(() => db.meetings.get(meetingId), [meetingId]);
  const recordings = useLiveQuery(
    () => db.audioRecordings.where('meetingId').equals(meetingId).toArray(),
    [meetingId]
  );

  const locked = meeting?.locked ?? false;

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      // Revoke object URLs
      audioUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
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
        await db.audioRecordings.add({
          meetingId,
          blob,
          recordedAt: Date.now(),
          durationMs: duration * 1000,
        });
        stream.getTracks().forEach(t => t.stop());
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

  const getAudioUrl = (rec: { id?: number; blob: Blob }) => {
    if (!rec.id) return '';
    if (!audioUrlsRef.current.has(rec.id)) {
      audioUrlsRef.current.set(rec.id, URL.createObjectURL(rec.blob));
    }
    return audioUrlsRef.current.get(rec.id)!;
  };

  const deleteRecording = async (recId: number) => {
    if (!confirm(t('confirmDelete'))) return;
    const url = audioUrlsRef.current.get(recId);
    if (url) { URL.revokeObjectURL(url); audioUrlsRef.current.delete(recId); }
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
            <audio controls src={getAudioUrl(rec)} className="audio-player" />
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
