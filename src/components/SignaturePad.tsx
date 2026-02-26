import { useRef, useEffect, useCallback } from 'react';
import SignaturePadLib from 'signature_pad';
import { useLangContext } from './Layout';

interface SignaturePadProps {
  onSave: (dataUrl: string) => void;
  existingDataUrl?: string;
  disabled?: boolean;
}

export default function SignaturePad({ onSave, existingDataUrl, disabled = false }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const padRef = useRef<SignaturePadLib | null>(null);
  const { t } = useLangContext();

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ratio = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.scale(ratio, ratio);

    padRef.current = new SignaturePadLib(canvas, {
      backgroundColor: 'rgb(255,255,255)',
      penColor: '#1a3a6b',
    });

    if (disabled) padRef.current.off();

    return () => {
      padRef.current?.off();
    };
  }, [disabled]);

  useEffect(() => {
    if (existingDataUrl && canvasRef.current && padRef.current) {
      padRef.current.fromDataURL(existingDataUrl);
    }
  }, [existingDataUrl]);

  const handleClear = useCallback(() => {
    padRef.current?.clear();
  }, []);

  const handleSave = useCallback(() => {
    if (!padRef.current || padRef.current.isEmpty()) {
      alert('Please draw your signature first.');
      return;
    }
    onSave(padRef.current.toDataURL('image/png'));
  }, [onSave]);

  return (
    <div className="signature-pad-wrapper">
      <canvas
        ref={canvasRef}
        className="signature-canvas"
        style={{ border: '1px solid #ccc', width: '100%', height: '150px', borderRadius: '4px', background: '#fff' }}
      />
      {!disabled && (
        <div className="sig-actions">
          <button type="button" className="btn btn-secondary" onClick={handleClear}>{t('clear')}</button>
          <button type="button" className="btn btn-primary" onClick={handleSave}>{t('save')}</button>
        </div>
      )}
    </div>
  );
}
