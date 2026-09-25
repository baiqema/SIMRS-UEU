import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Plus, Check, Tag, Stethoscope, Activity, Sparkles, X, ChevronDown } from 'lucide-react';
import { EXTENDED_ICD10, EXTENDED_ICD9CM, ExtendedICD10, ExtendedICD9CM } from '../data/icdDatabase';

interface IcdAutocompleteProps {
  type: 'icd10' | 'icd9';
  selectedCodes: string[];
  onAddCode: (code: string) => void;
  onRemoveCode: (code: string) => void;
  placeholder?: string;
  maxDisplay?: number;
  allowCustom?: boolean;
  medicalRecordContextText?: string; // Text to suggest auto-matching codes
  className?: string;
}

export const IcdAutocomplete: React.FC<IcdAutocompleteProps> = ({
  type,
  selectedCodes,
  onAddCode,
  onRemoveCode,
  placeholder,
  maxDisplay = 12,
  allowCustom = true,
  medicalRecordContextText = '',
  className = ''
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const database = useMemo(() => {
    return type === 'icd10' ? EXTENDED_ICD10 : EXTENDED_ICD9CM;
  }, [type]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered suggestions based on typed input
  const suggestions = useMemo(() => {
    if (!inputValue.trim()) {
      // Return top common items when input is empty but opened
      return database.slice(0, maxDisplay);
    }
    const q = inputValue.toLowerCase().trim();
    return database
      .filter(item => {
        const matchCode = item.code.toLowerCase().includes(q);
        const matchDesc = item.desc.toLowerCase().includes(q);
        const matchCategory = (item.category || '').toLowerCase().includes(q);
        return matchCode || matchDesc || matchCategory;
      })
      .slice(0, maxDisplay);
  }, [inputValue, database, maxDisplay]);

  // Smart suggestions parsed from clinical text if provided
  const contextSuggestions = useMemo(() => {
    if (!medicalRecordContextText.trim()) return [];
    const text = medicalRecordContextText.toLowerCase();
    return database.filter(item => {
      const descWords = item.desc.toLowerCase().split(/[\s,/-]+/).filter(w => w.length > 3);
      return descWords.some(word => text.includes(word));
    }).slice(0, 4);
  }, [medicalRecordContextText, database]);

  const handleSelect = (code: string) => {
    onAddCode(code);
    setInputValue('');
    setIsOpen(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setIsOpen(true);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (suggestions[highlightedIndex]) {
        handleSelect(suggestions[highlightedIndex].code);
      } else if (allowCustom && inputValue.trim()) {
        handleSelect(inputValue.trim().toUpperCase());
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const themeColors = type === 'icd10' 
    ? {
        border: 'border-blue-300 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100',
        badgePrimary: 'bg-blue-900 text-blue-50 border-blue-800',
        badgeSecondary: 'bg-slate-100 text-slate-800 border-slate-300',
        activeItem: 'bg-blue-50 text-blue-950',
        iconColor: 'text-blue-700',
        highlightText: 'text-blue-700 font-black',
        accentBg: 'bg-blue-600 hover:bg-blue-700 text-white',
        title: 'ICD-10 Diagnosis'
      }
    : {
        border: 'border-indigo-300 focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-100',
        badgePrimary: 'bg-indigo-900 text-indigo-50 border-indigo-800',
        badgeSecondary: 'bg-slate-100 text-slate-800 border-slate-300',
        activeItem: 'bg-indigo-50 text-indigo-950',
        iconColor: 'text-indigo-700',
        highlightText: 'text-indigo-700 font-black',
        accentBg: 'bg-indigo-600 hover:bg-indigo-700 text-white',
        title: 'ICD-9-CM Prosedur'
      };

  return (
    <div className={`space-y-2 ${className}`} ref={wrapperRef}>
      {/* Selected Codes Pills */}
      <div className="flex flex-wrap items-center gap-1.5 min-h-[38px] p-2 bg-white rounded-xl border border-slate-200 shadow-2xs">
        {selectedCodes.length === 0 ? (
          <span className="text-xs text-slate-400 italic px-1">
            {type === 'icd10' ? 'Belum ada kode ICD-10 (Ketik di bawah untuk memilih otomatis)...' : 'Belum ada kode tindakan ICD-9-CM (opsional)...'}
          </span>
        ) : (
          selectedCodes.map((code, idx) => {
            const item = database.find(i => i.code === code);
            const isPrimary = type === 'icd10' && idx === 0;
            return (
              <span
                key={code + idx}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                  isPrimary
                    ? themeColors.badgePrimary
                    : themeColors.badgeSecondary
                }`}
              >
                <span className="font-mono font-bold">
                  {isPrimary ? '★ ' : ''}{code}
                </span>
                <span className="text-[11px] font-normal truncate max-w-[150px]" title={item?.desc || code}>
                  {item?.desc || code}
                </span>
                <button
                  type="button"
                  onClick={() => onRemoveCode(code)}
                  className="p-0.5 rounded hover:bg-black/20 text-current transition-colors cursor-pointer"
                  title="Hapus Kode"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })
        )}
      </div>

      {/* Auto-detect from clinical text helper button if available */}
      {contextSuggestions.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap bg-blue-50/80 border border-blue-200 p-2 rounded-xl text-xs">
          <span className="text-blue-900 font-bold flex items-center gap-1 shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            Saran Otomatis Rekam Medis:
          </span>
          <div className="flex flex-wrap gap-1">
            {contextSuggestions.map(s => {
              const alreadySelected = selectedCodes.includes(s.code);
              return (
                <button
                  key={s.code}
                  type="button"
                  onClick={() => !alreadySelected && onAddCode(s.code)}
                  disabled={alreadySelected}
                  className={`px-2 py-0.5 rounded-lg text-[11px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                    alreadySelected 
                      ? 'bg-emerald-100 text-emerald-800 opacity-60 cursor-not-allowed'
                      : 'bg-white text-blue-800 border border-blue-300 hover:bg-blue-600 hover:text-white shadow-2xs'
                  }`}
                >
                  {s.code} - {s.desc.substring(0, 20)}...
                  {!alreadySelected && <Plus className="w-3 h-3" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Typing Search Input with Instant Popover */}
      <div className="relative">
        <div className={`flex items-center bg-white rounded-xl border ${themeColors.border} transition-all shadow-2xs overflow-hidden`}>
          <div className="pl-3 pr-2 py-2">
            {type === 'icd10' ? (
              <Stethoscope className="w-4 h-4 text-blue-700" />
            ) : (
              <Activity className="w-4 h-4 text-indigo-700" />
            )}
          </div>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={e => {
              setInputValue(e.target.value);
              setIsOpen(true);
              setHighlightedIndex(0);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || (type === 'icd10' ? 'Ketik nama penyakit atau kode ICD-10 (contoh: I10, Diabetes, Diare, Hipertensi, Asma)...' : 'Ketik tindakan atau kode ICD-9-CM (contoh: 89.52, EKG, USG, Hecting, Appendiktomi)...')}
            className="w-full py-2 pr-3 text-xs font-medium text-slate-800 bg-transparent focus:outline-none placeholder:text-slate-400"
          />
          {inputValue && (
            <button
              type="button"
              onClick={() => {
                setInputValue('');
                setIsOpen(true);
              }}
              className="p-1 mr-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="px-2.5 py-2 text-slate-400 hover:text-slate-700 border-l border-slate-200 cursor-pointer"
          >
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Instant Dropdown Suggestions Floating Box */}
        {isOpen && (
          <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-300 rounded-xl shadow-xl z-50 overflow-hidden divide-y divide-slate-100 max-h-72 flex flex-col">
            <div className="bg-slate-900 text-white px-3 py-1.5 text-[11px] font-bold flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-sky-400" />
                Pilihan Otomatis {themeColors.title} ({suggestions.length} ditemukan)
              </span>
              <span className="text-[10px] text-sky-200 font-mono">Gunakan Enter / Klik</span>
            </div>

            <div className="overflow-y-auto flex-1 p-1 space-y-0.5">
              {suggestions.map((item, index) => {
                const isSelected = selectedCodes.includes(item.code);
                const isHighlighted = index === highlightedIndex;

                return (
                  <div
                    key={item.code}
                    onClick={() => handleSelect(item.code)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`px-3 py-2 rounded-lg text-xs flex items-center justify-between cursor-pointer transition-all ${
                      isHighlighted ? themeColors.activeItem : 'hover:bg-slate-50'
                    } ${isSelected ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0 pr-2">
                      <span className={`px-2 py-0.5 rounded font-mono font-black text-xs shrink-0 ${
                        type === 'icd10' ? 'bg-blue-100 text-blue-900' : 'bg-indigo-100 text-indigo-900'
                      }`}>
                        {item.code}
                      </span>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 text-xs truncate">
                          {item.desc}
                        </p>
                        {item.category && (
                          <span className="inline-block text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded font-medium mt-0.5">
                            {item.category}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 pl-2">
                      {isSelected ? (
                        <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                          <Check className="w-3 h-3" /> Terpilih
                        </span>
                      ) : (
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${themeColors.accentBg} flex items-center gap-1 shadow-2xs`}>
                          <Plus className="w-3 h-3" /> Pilih
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {suggestions.length === 0 && (
                <div className="p-4 text-center text-xs text-slate-500 space-y-2">
                  <p>Tidak ada kode yang cocok dengan kata kunci "<strong>{inputValue}</strong>".</p>
                  {allowCustom && (
                    <button
                      type="button"
                      onClick={() => handleSelect(inputValue.trim().toUpperCase())}
                      className="px-3 py-1.5 bg-blue-900 text-white rounded-lg text-xs font-bold hover:bg-blue-800 cursor-pointer shadow-xs"
                    >
                      Tambahkan "{inputValue.trim().toUpperCase()}" sebagai Kode Khusus
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
