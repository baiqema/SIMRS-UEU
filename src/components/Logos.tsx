import React from 'react';
import esaUnggulFullLogo from '../assets/logo-esa-unggul-asli.png';
import esaUnggulEmblem from '../assets/logo-esa-unggul-emblem.png';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

/**
 * Universitas Esa Unggul Logo (Official Authentic Brand Asset)
 * Logo Asli Universitas Esa Unggul Powered by Arizona State University®
 */
export const EsaUnggulLogo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
}) => {
  const fullSizeMap = {
    sm: 'h-8 sm:h-9 max-w-[170px]',
    md: 'h-10 sm:h-11 max-w-[220px]',
    lg: 'h-12 sm:h-14 max-w-[280px]',
    xl: 'h-16 sm:h-20 max-w-[360px]',
  };

  const emblemSizeMap = {
    sm: 'h-7 w-7',
    md: 'h-9 w-9',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  if (!showText) {
    return (
      <div className={`inline-flex items-center select-none ${className}`}>
        <img
          src={esaUnggulEmblem}
          alt="Universitas Esa Unggul"
          className={`${emblemSizeMap[size] || emblemSizeMap.md} object-contain shrink-0`}
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <img
        src={esaUnggulFullLogo}
        alt="Universitas Esa Unggul - Powered by Arizona State University"
        className={`${fullSizeMap[size] || fullSizeMap.md} w-auto object-contain shrink-0`}
        referrerPolicy="no-referrer"
      />
    </div>
  );
};

/**
 * Akreditasi Unggul Gold Emblem Wreath
 * BAN-PT / LAM-PTKes Official Gold Laurel Wreath Seal
 */
export const AkreditasiUnggulEmblem: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 32
}) => {
  return (
    <div className={`inline-flex items-center justify-center shrink-0 ${className}`} title="Akreditasi Unggul">
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        {/* Outer Circular Gold Border */}
        <circle cx="50" cy="50" r="46" stroke="#CA8A04" strokeWidth="2.5" fill="#FEFCE8" />
        <circle cx="50" cy="50" r="41" stroke="#EAB308" strokeWidth="1" strokeDasharray="3 2" />

        {/* Laurel Wreath Left */}
        <path
          d="M 22 55 C 20 40 28 26 42 20 M 24 45 C 22 36 29 28 38 25 M 28 62 C 22 52 24 38 32 30"
          stroke="#A16207"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Laurel Wreath Right */}
        <path
          d="M 78 55 C 80 40 72 26 58 20 M 76 45 C 78 36 71 28 62 25 M 72 62 C 78 52 76 38 68 30"
          stroke="#A16207"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Ribbon / Star / Leaves bottom */}
        <path
          d="M 38 78 L 50 72 L 62 78 L 50 84 Z"
          fill="#CA8A04"
          stroke="#854D0E"
          strokeWidth="1"
        />

        {/* Text AKREDITASI */}
        <text
          x="50"
          y="42"
          textAnchor="middle"
          fill="#854D0E"
          fontSize="11"
          fontWeight="900"
          letterSpacing="0.8"
          fontFamily="sans-serif"
        >
          AKREDITASI
        </text>

        {/* Text UNGGUL */}
        <text
          x="50"
          y="60"
          textAnchor="middle"
          fill="#713F12"
          fontSize="15"
          fontWeight="950"
          letterSpacing="0.5"
          fontFamily="sans-serif"
        >
          UNGGUL
        </text>
      </svg>
    </div>
  );
};

/**
 * Esa Unggul Portal Brand Pill
 * White pill container with Logo Esa Unggul and Logo Rekam Medis (RMIK) side-by-side neatly
 */
export const EsaUnggulPortalPill: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`bg-white rounded-xl sm:rounded-2xl px-2.5 sm:px-3 py-1.5 shadow-xs flex items-center gap-2 sm:gap-2.5 shrink-0 border border-white/90 select-none ${className}`}>
      <img
        src={esaUnggulFullLogo}
        alt="Universitas Esa Unggul - Powered by Arizona State University"
        className="h-6 sm:h-7.5 w-auto object-contain shrink-0"
        referrerPolicy="no-referrer"
      />
      <div className="h-5 sm:h-6 w-px bg-slate-200 shrink-0"></div>
      <RmikLogo size="sm" showText={false} className="w-6 h-6 sm:w-7.5 sm:h-7.5 shrink-0" />
    </div>
  );
};

/**
 * DualBrandLogos
 * Komponen khusus untuk menampilkan Logo Esa Unggul & Logo Rekam Medis berdekatan rapi
 */
export const DualBrandLogos: React.FC<{
  className?: string;
  size?: 'sm' | 'md';
}> = ({ className = '', size = 'sm' }) => {
  const isSm = size === 'sm';
  return (
    <div className={`bg-white rounded-xl p-1 sm:p-1.5 shadow-xs flex items-center gap-1.5 shrink-0 border border-white/90 select-none ${className}`}>
      <img
        src={esaUnggulEmblem}
        alt="Logo Esa Unggul"
        className={isSm ? 'w-6 h-6 sm:w-7 sm:h-7 object-contain shrink-0' : 'w-8 h-8 object-contain shrink-0'}
        referrerPolicy="no-referrer"
      />
      <div className={isSm ? 'w-px h-5 bg-slate-200 shrink-0' : 'w-px h-6 bg-slate-200 shrink-0'}></div>
      <RmikLogo size={size} showText={false} className={isSm ? 'w-6 h-6 sm:w-7 sm:h-7 shrink-0' : 'w-8 h-8 shrink-0'} />
    </div>
  );
};

/**
 * Rekam Medis & Informasi Kesehatan (RMIK) Logo - Official Seal
 * Universitas Esa Unggul - Seal Lingkaran RMIK Terstandar PORMIKI & Kemenkes RI
 * Sesuai stempel dan emblem resmi Program Studi Rekam Medis & Informasi Kesehatan
 */
export const RmikLogo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showText = false,
}) => {
  const sizeMap = {
    sm: { icon: 'w-7 h-7 sm:w-8 sm:h-8', text: 'text-xs' },
    md: { icon: 'w-9 h-9 sm:w-10 sm:h-10', text: 'text-sm' },
    lg: { icon: 'w-12 h-12 sm:w-14 sm:h-14', text: 'text-base' },
    xl: { icon: 'w-16 h-16 sm:w-20 sm:h-20', text: 'text-lg' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`inline-flex items-center gap-2 select-none shrink-0 ${className}`} title="Rekam Medis & Informasi Kesehatan - Universitas Esa Unggul">
      {/* Official Circular Seal Vector */}
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${currentSize.icon} shrink-0 drop-shadow-xs`}
      >
        {/* Outer Blue Ring */}
        <circle cx="60" cy="60" r="58" stroke="#0072CE" strokeWidth="2.5" fill="#FFFFFF" />
        <circle cx="60" cy="60" r="55" fill="#084C8D" />

        {/* Circular text path guide: UNIVERSITAS ESA UNGGUL */}
        <path
          id="rmikTextRing"
          d="M 18 64 A 43 43 0 1 1 102 64"
          fill="none"
        />
        <text className="text-[7.4px] font-black uppercase tracking-[0.14em] fill-white" style={{ fontFamily: 'Arial, sans-serif' }}>
          <textPath href="#rmikTextRing" startOffset="50%" textAnchor="middle">
            UNIVERSITAS ESA UNGGUL
          </textPath>
        </text>

        {/* Side Faceted Diamond Crystals (Left: 2 diamonds) */}
        {/* Diamond 1 Top-Left */}
        <polygon points="17,70 21,66 25,70 21,74" fill="#38BDF8" />
        <polygon points="17,70 21,66 21,74" fill="#7DD3FC" />
        {/* Diamond 2 Bottom-Left */}
        <polygon points="23,80 27,76 31,80 27,84" fill="#0284C7" />
        <polygon points="23,80 27,76 27,84" fill="#38BDF8" />

        {/* Side Faceted Diamond Crystals (Right: 2 diamonds) */}
        {/* Diamond 1 Top-Right */}
        <polygon points="95,70 99,66 103,70 99,74" fill="#38BDF8" />
        <polygon points="99,66 103,70 99,74" fill="#7DD3FC" />
        {/* Diamond 2 Bottom-Right */}
        <polygon points="89,80 93,76 97,80 93,84" fill="#0284C7" />
        <polygon points="93,76 97,80 93,84" fill="#38BDF8" />

        {/* Bottom Arc Curved Pill Banner: RMIK */}
        <path
          d="M 33 87 C 41 81 50 78 60 78 C 70 78 79 81 87 87 C 82 99 72 105 60 105 C 48 105 38 99 33 87 Z"
          fill="#4BA3E3"
          stroke="#FFFFFF"
          strokeWidth="1.2"
        />
        <text
          x="60"
          y="97.5"
          fill="#FFFFFF"
          fontSize="11"
          fontWeight="900"
          textAnchor="middle"
          letterSpacing="1"
          fontFamily="Arial, sans-serif"
        >
          RMIK
        </text>

        {/* Inner White Field Circle with Blue Border */}
        <circle cx="60" cy="50" r="33" fill="#FFFFFF" stroke="#005BAB" strokeWidth="2.5" />

        {/* Red/Orange ECG Pulse Line & Heart */}
        {/* Heart Outline on Right */}
        <path
          d="M 68 47 C 68 43 72 40 76 42 C 79 40 83 43 83 47 C 83 53 76 57 76 57 C 76 57 68 53 68 47 Z"
          fill="none"
          stroke="#EE4D2D"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* ECG Pulse Line running into the heart */}
        <path
          d="M 36 51 L 43 51 L 47 44 L 52 60 L 57 37 L 61 54 L 64 51 L 68 51"
          fill="none"
          stroke="#EE4D2D"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Two Blue Cogwheels / Gears in lower center */}
        {/* Gear 1 */}
        <circle cx="59" cy="65" r="5" fill="#E0F2FE" stroke="#005BAB" strokeWidth="1.5" />
        <circle cx="59" cy="65" r="2" fill="#005BAB" />
        {/* Gear 2 (meshed) */}
        <circle cx="67" cy="61" r="4" fill="#E0F2FE" stroke="#005BAB" strokeWidth="1.5" />
        <circle cx="67" cy="61" r="1.5" fill="#005BAB" />

        {/* Magnifying Loupe with Blue Border */}
        <circle cx="62" cy="57" r="11" fill="#F0F9FF" stroke="#005BAB" strokeWidth="2.2" />
        {/* Handle pointing down-right */}
        <line x1="70" y1="65" x2="77" y2="72" stroke="#084C8D" strokeWidth="3.6" strokeLinecap="round" />

        {/* Binary numbers inside loupe */}
        <text x="62" y="55" fill="#005BAB" fontSize="4.2" fontFamily="monospace" fontWeight="900" textAnchor="middle">1011011</text>
        <text x="62" y="60.5" fill="#005BAB" fontSize="4.2" fontFamily="monospace" fontWeight="900" textAnchor="middle">1101101</text>
      </svg>

      {showText && (
        <div className="flex flex-col leading-tight">
          <span className="font-extrabold tracking-tight text-blue-950 text-xs sm:text-sm font-sans">
            RMIK
          </span>
          <span className="text-[9px] sm:text-[10px] font-semibold text-blue-700 tracking-normal">
            Rekam Medis & Info Kes
          </span>
        </div>
      )}
    </div>
  );
};

/**
 * Sequential Dual Brand Component (Esa Unggul + RMIK Berurutan)
 * Menampilkan Logo Universitas dan Logo Rekam Medis berdampingan secara teratur
 */
export const SequentialHospitalLogos: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  showRmikLogo?: boolean;
  className?: string;
}> = ({ size = 'md', showSubtitle = true, showRmikLogo = false, className = '' }) => {
  return (
    <div className={`flex items-center gap-3 select-none flex-wrap ${className}`}>
      {/* 1. Logo Universitas Esa Unggul */}
      <EsaUnggulLogo size={size} showText={true} />

      {showRmikLogo && (
        <>
          {/* Divider */}
          <div className="h-8 w-px bg-slate-300 hidden sm:block"></div>
          {/* 2. Logo Rekam Medis RMIK */}
          <RmikLogo size={size} showText={true} />
        </>
      )}

      {showSubtitle && (
        <div className="hidden xl:flex flex-col pl-2 border-l border-slate-200 text-[10px] text-slate-500 font-semibold leading-tight">
          <span className="text-blue-900 font-bold">SIMRS RME KEMENKES RI</span>
          <span>KMK No. HK.01.07/MENKES/1423/2022</span>
        </div>
      )}
    </div>
  );
};
