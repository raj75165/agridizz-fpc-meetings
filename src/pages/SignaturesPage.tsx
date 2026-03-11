import { useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { useLangContext } from '../context/LangContext';
import SignaturePad from '../components/SignaturePad';

export default function SignaturesPage() {
  const { id } = useParams<{ id: string }>();
  const meetingId = Number(id);
  const { t } = useLangContext();
  const navigate = useNavigate();

  const meeting = useLiveQuery(() => db.meetings.get(meetingId), [meetingId]);
  const allMembers = useLiveQuery(() => db.members.toArray(), []);
  const signatures = useLiveQuery(
    () => db.signatures.where('meetingId').equals(meetingId).toArray(),
    [meetingId]
  );

  if (!meeting || !allMembers) return <div className="page"><p>{t('loading')}</p></div>;

  const locked = meeting.locked;

  // Directors who attended
  const directors = allMembers.filter(m =>
    m.role === 'Director' && meeting.attendeeIds.includes(m.id!)
  );
  // Selected members for signatures
  const sigMembers = allMembers.filter(m =>
    meeting.signatureMemberIds.includes(m.id!)
  );

  const signatories = [...directors, ...sigMembers];

  const getSignature = (memberId: number) =>
    (signatures ?? []).find(s => s.memberId === memberId);

  const handleSave = async (memberId: number, dataUrl: string) => {
    const existing = getSignature(memberId);
    // eslint-disable-next-line react-hooks/purity
    const signedAt = Date.now();
    if (existing?.id) {
      await db.signatures.update(existing.id, { dataUrl, signedAt });
    } else {
      await db.signatures.add({ meetingId, memberId, dataUrl, signedAt });
    }
  };

  const handleClear = async (memberId: number) => {
    const existing = getSignature(memberId);
    if (existing?.id) {
      await db.signatures.delete(existing.id);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <button className="btn btn-secondary" onClick={() => navigate(`/meetings/${meetingId}`)}>← {t('back')}</button>
        <h2>{t('signatures')}</h2>
      </div>

      {locked && <div className="info-banner">🔒 {t('locked')} - {t('signatures')} cannot be changed.</div>}

      {signatories.length === 0 && (
        <div className="card">
          <p className="empty-msg">No signatories. Assign attendees and signature members in the meeting.</p>
        </div>
      )}

      {signatories.map(member => {
        const sig = getSignature(member.id!);
        return (
          <div key={member.id} className="card signature-card">
            <div className="signature-member-info">
              <strong>{member.name}</strong>
              <span className={`badge ${member.role === 'Director' ? 'badge-blue' : 'badge-gray'}`}>{member.role}</span>
              {sig && <span className="badge badge-green">✓ Signed</span>}
            </div>
            {sig && <p className="sig-date">Signed: {new Date(sig.signedAt).toLocaleString('en-IN')}</p>}
            <SignaturePad
              onSave={(dataUrl) => handleSave(member.id!, dataUrl)}
              existingDataUrl={sig?.dataUrl}
              disabled={locked}
            />
            {!locked && sig && (
              <button className="btn btn-sm btn-danger mt-4" onClick={() => handleClear(member.id!)}>
                {t('clear')}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
