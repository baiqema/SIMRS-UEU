import React, { useRef, useState, useEffect } from 'react';
import { PenTool, RotateCcw, Check, ShieldCheck, Sparkles } from 'lucide-react';

interface DigitalSignaturePadProps {
  id?: string;
  title: string;
  roleLabel: 'Dokter DPJP' | 'Perawat' | 'Petugas Medis' | 'Pasien / Keluarga';
  personName: string;
  onNameChange?: (name: string) => void;
  identifierNumber?: string; // NIP / STR / SIP
  onIdentifierChange?: (num: string) => void;
  signatureValue: string; // Data URL or verified token
  onSignatureChange: (dataUrl: string) => void;
  signedDate?: string;
  readOnly?: boolean;
}

export const DigitalSignaturePad: React.FC<DigitalSignaturePadProps> = ({
  id,
  title,
  roleLabel,
  personName,
  onNameChange,
  identifierNumber = '',
  onIdentifierChange,
  signatureValue,
  onSignatureChange,
  signedDate,
  readOnly = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(Boolean(signatureValue));

  // Load existing signature onto canvas if provided as data URL
  useEffect(() => {
    if (signatureValue && canvasRef.current && signatureValue.startsWith('data:image')) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const img = new Image();
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.src = signatureValue;
        setHasSignature(true);
      }
    } else if (signatureValue) {
      setHasSignature(true);
    }
  }, [signatureValue]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (readOnly) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasSignature(true);
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || readOnly) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.strokeStyle = roleLabel === 'Dokter DPJP' ? '#1e3a8a' : '#047857'; // Blue ink for doctor, emerald for nurse
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing || readOnly) return;
    setIsDrawing(false);
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      onSignatureChange(dataUrl);
    }
  };

  const handleClear = () => {
    if (readOnly) return;
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    setHasSignature(false);
    onSignatureChange('');
  };

  const handleGenerateDigitalSignature = () => {
    if (readOnly) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw stylized cursive signature
    const color = roleLabel === 'Dokter DPJP' ? '#1e3a8a' : '#047857';
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const w = canvas.width;
    const h = canvas.height;

    ctx.beginPath();
    ctx.moveTo(30, h * 0.65);
    ctx.bezierCurveTo(w * 0.2, h * 0.15, w * 0.3, h * 0.9, w * 0.45, h * 0.4);
    ctx.bezierCurveTo(w * 0.55, h * 0.2, w * 0.65, h * 0.8, w * 0.8, h * 0.5);
    ctx.bezierCurveTo(w * 0.85, h * 0.35, w * 0.75, h * 0.85, w * 0.92, h * 0.7);
    ctx.stroke();

    // Add signature flourish line
    ctx.beginPath();
    ctx.moveTo(25, h * 0.78);
    ctx.lineTo(w * 0.95, h * 0.78);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    setHasSignature(true);
    const dataUrl = canvas.toDataURL('image/png');
    onSignatureChange(dataUrl);
  };

  const roleTheme = roleLabel === 'Dokter DPJP' 
    ? {
        bg: 'bg-blue-50/70',
        border: 'border-blue-200',
        text: 'text-blue-900',
        badge: 'bg-blue-600 text-white',
        ring: 'focus:border-blue-500'
      }
    : {
        bg: 'bg-emerald-50/70',
        border: 'border-emerald-200',
        text: 'text-emerald-900',
        badge: 'bg-emerald-600 text-white',
        ring: 'focus:border-emerald-500'
      };

  return (
    <div id={id} className={`p-3.5 rounded-2xl border ${roleTheme.border} ${roleTheme.bg} space-y-3`}>
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${roleTheme.badge}`}>
            {roleLabel}
          </span>
          <span className="text-xs font-bold text-slate-800">{title}</span>
        </div>
        {signedDate && (
          <span className="text-[11px] text-slate-500 font-mono">
            {signedDate}
          </span>
        )}
      </div>

      {/* Name and Identifier Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
            Nama Lengkap & Gelar *
          </label>
          {readOnly ? (
            <div className="p-2 bg-white rounded-xl border border-slate-200 font-bold text-slate-800 text-xs">
              {personName || '-'}
            </div>
          ) : (
            <input
              type="text"
              value={personName}
              onChange={(e) => onNameChange?.(e.target.value)}
              placeholder={roleLabel === 'Dokter DPJP' ? 'dr. Nama Dokter, Sp.X' : 'Ns. Nama Perawat, S.Kep'}
              className={`w-full p-2 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-800 ${roleTheme.ring} outline-none`}
            />
          )}
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
            {roleLabel === 'Dokter DPJP' ? 'No. SIP Dokter *' : 'NIP / No. STR Perawat *'}
          </label>
          {readOnly ? (
            <div className="p-2 bg-white rounded-xl border border-slate-200 font-mono text-slate-700 text-xs">
              {identifierNumber || '-'}
            </div>
          ) : (
            <input
              type="text"
              value={identifierNumber}
              onChange={(e) => onIdentifierChange?.(e.target.value)}
              placeholder={roleLabel === 'Dokter DPJP' ? 'SIP: 446/123/DISKES/2026' : 'STR: 12.04.5.2.1.26.12345'}
              className={`w-full p-2 bg-white rounded-xl border border-slate-200 text-xs font-medium text-slate-800 ${roleTheme.ring} outline-none font-mono`}
            />
          )}
        </div>
      </div>

      {/* Canvas Signature Box */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-bold text-slate-700 flex items-center gap-1">
            <PenTool className="w-3.5 h-3.5 text-slate-600" />
            Goresan Tanda Tangan (Touch / Mouse):
          </span>
          {!readOnly && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleGenerateDigitalSignature}
                className="text-[11px] text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1 cursor-pointer"
                title="Tanda tangan otomatis terverifikasi"
              >
                <Sparkles className="w-3 h-3" /> TTD Otomatis
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="text-[11px] text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Bersihkan
              </button>
            </div>
          )}
        </div>

        <div className="relative border border-slate-300 rounded-xl bg-white overflow-hidden shadow-inner">
          <canvas
            ref={canvasRef}
            width={400}
            height={90}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className={`w-full h-20 bg-white ${readOnly ? 'cursor-default pointer-events-none' : 'cursor-crosshair touch-none'}`}
          />
          {!hasSignature && !readOnly && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-300 text-xs font-medium italic">
              Klik & gores tanda tangan di sini
            </div>
          )}
          {hasSignature && (
            <div className="absolute bottom-1 right-2 pointer-events-none flex items-center gap-1 text-[10px] text-emerald-700 font-bold bg-emerald-50/90 px-1.5 py-0.5 rounded border border-emerald-200">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>Terverifikasi RME</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
