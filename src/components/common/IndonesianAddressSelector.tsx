import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, MapPin, X, ChevronDown, Sparkles, Loader2, Check } from 'lucide-react';
import {
  INDONESIAN_PROVINCES,
  RegionHierarchyItem,
  searchIndonesianRegions,
  formatRegionSuggestion,
  getRegenciesByProvince,
  getDistrictsByRegency,
  getVillagesByDistrict,
  INDONESIA_REGION_DATABASE
} from '../../data/indonesiaRegions';

interface IndonesianAddressSelectorProps {
  provinsi: string;
  kabupaten: string;
  kecamatan: string;
  kelurahan: string;
  onChangeProvinsi: (val: string) => void;
  onChangeKabupaten: (val: string) => void;
  onChangeKecamatan: (val: string) => void;
  onChangeKelurahan: (val: string) => void;
  onSelectFullHierarchy?: (item: RegionHierarchyItem) => void;
  label?: string;
  required?: boolean;
}

export const IndonesianAddressSelector: React.FC<IndonesianAddressSelectorProps> = ({
  provinsi,
  kabupaten,
  kecamatan,
  kelurahan,
  onChangeProvinsi,
  onChangeKabupaten,
  onChangeKecamatan,
  onChangeKelurahan,
  onSelectFullHierarchy,
  label = 'ALAMAT LENGKAP BERJENJANG (KTP & DOMISILI)',
  required = false
}) => {
  // Global Autocomplete Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<RegionHierarchyItem[]>([]);
  const [isGlobalDropdownOpen, setIsGlobalDropdownOpen] = useState(false);

  // Active Dropdown for Individual Fields ('provinsi' | 'kabupaten' | 'kecamatan' | 'kelurahan' | null)
  const [activeDropdown, setActiveDropdown] = useState<'provinsi' | 'kabupaten' | 'kecamatan' | 'kelurahan' | null>(null);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Debounce for Global Search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setDebouncedQuery('');
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Execute Search
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    const results = searchIndonesianRegions(debouncedQuery, 10);
    setSuggestions(results);
    setIsSearching(false);
    setIsGlobalDropdownOpen(true);
  }, [debouncedQuery]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsGlobalDropdownOpen(false);
        setActiveDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 1. Filtered Province List (38 Provinsi Resmi)
  const filteredProvinces = useMemo(() => {
    if (!provinsi) return INDONESIAN_PROVINCES;
    return INDONESIAN_PROVINCES.filter(p => p.toLowerCase().includes(provinsi.toLowerCase()));
  }, [provinsi]);

  // 2. Filtered Regency / City List
  const filteredRegencies = useMemo(() => {
    const list = getRegenciesByProvince(provinsi);
    if (!kabupaten) return list;
    return list.filter(k => k.toLowerCase().includes(kabupaten.toLowerCase()));
  }, [provinsi, kabupaten]);

  // 3. Filtered District / Kecamatan List
  const filteredDistricts = useMemo(() => {
    const list = getDistrictsByRegency(provinsi, kabupaten);
    if (!kecamatan) return list;
    return list.filter(k => k.toLowerCase().includes(kecamatan.toLowerCase()));
  }, [provinsi, kabupaten, kecamatan]);

  // 4. Filtered Village / Kelurahan List
  const filteredVillages = useMemo(() => {
    // If user typed in kelurahan, also check across database for smart autocomplete
    if (kelurahan && kelurahan.trim().length >= 2) {
      const matchDb = INDONESIA_REGION_DATABASE.filter(item =>
        item.kelurahan.toLowerCase().includes(kelurahan.toLowerCase())
      );
      if (matchDb.length > 0) {
        return matchDb.map(m => ({
          name: m.kelurahan,
          hierarchy: m
        }));
      }
    }

    const standardList = getVillagesByDistrict(provinsi, kabupaten, kecamatan);
    const filtered = !kelurahan ? standardList : standardList.filter(v => v.toLowerCase().includes(kelurahan.toLowerCase()));
    return filtered.map(name => ({
      name,
      hierarchy: undefined
    }));
  }, [provinsi, kabupaten, kecamatan, kelurahan]);

  // Handler: Select Full Suggestion (Auto-fill all 4)
  const handleSelectFull = (item: RegionHierarchyItem) => {
    onChangeProvinsi(item.provinsi);
    onChangeKabupaten(item.kabupaten);
    onChangeKecamatan(item.kecamatan);
    onChangeKelurahan(item.kelurahan);

    if (onSelectFullHierarchy) {
      onSelectFullHierarchy(item);
    }

    setSearchQuery('');
    setSuggestions([]);
    setIsGlobalDropdownOpen(false);
    setActiveDropdown(null);
  };

  return (
    <div className="space-y-3 pt-2 border-t border-slate-100" ref={wrapperRef}>
      {/* HEADER SECTION (Label only, NO mode toggle buttons) */}
      <div className="flex items-center gap-1.5">
        <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
        <span className="text-[11px] font-black uppercase text-slate-800 tracking-wider">
          {label}
        </span>
        {required && <span className="text-rose-500 font-bold">*</span>}
      </div>

      {/* GLOBAL AUTOCOMPLETE SEARCH FIELD (Ketik nama wilayah misal: Duri Kepa) */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setIsGlobalDropdownOpen(true);
            }}
            onFocus={() => {
              if (suggestions.length > 0) setIsGlobalDropdownOpen(true);
            }}
            placeholder="Ketik wilayah (misal: Duri Kepa, Gambir, Bandung, Sanur, Kuta, dsb)..."
            className="w-full pl-9 pr-20 py-2 bg-blue-50/40 border border-blue-200 rounded-2xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
          />
          <div className="absolute right-2.5 flex items-center gap-1">
            {isSearching ? (
              <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
            ) : searchQuery ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSuggestions([]);
                  setIsGlobalDropdownOpen(false);
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-lg flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-blue-600" />
                <span>Auto-fill</span>
              </span>
            )}
          </div>
        </div>

        {/* REKOMENDASI AUTOCOMPLETE DROPDOWN */}
        {isGlobalDropdownOpen && suggestions.length > 0 && (
          <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-64 overflow-y-auto divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-600">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Pilih Wilayah Hasil Pencarian ({suggestions.length} Ditemukan):</span>
              </span>
              <span className="text-[10px] text-slate-400">Klik untuk Auto-fill</span>
            </div>

            {suggestions.map((item, idx) => (
              <div
                key={`${item.kelurahan}-${item.kecamatan}-${item.kabupaten}-${idx}`}
                onClick={() => handleSelectFull(item)}
                className="p-2.5 hover:bg-blue-50/70 cursor-pointer transition-colors flex items-center justify-between text-xs group"
              >
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-blue-500 mt-0.5 shrink-0 group-hover:text-blue-700" />
                  <div>
                    <div className="font-bold text-slate-900 group-hover:text-blue-900">
                      {formatRegionSuggestion(item)}
                    </div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                      <span>Kel. {item.kelurahan}</span>
                      <span>&bull;</span>
                      <span>Kec. {item.kecamatan}</span>
                      {item.kodePos && (
                        <>
                          <span>&bull;</span>
                          <span className="font-mono text-blue-600">KODEPOS: {item.kodePos}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="px-2.5 py-1 bg-blue-100 group-hover:bg-blue-600 text-blue-700 group-hover:text-white rounded-lg text-[10px] font-bold transition-all shrink-0 ml-2"
                >
                  Pilih
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4 KOLOM WILAYAH BERJENJANG (BISA DIKETIK & BISA DIKLIK DROPDOWN) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* 1. PROVINSI */}
        <div className="relative">
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
            Provinsi {required && '*'}
          </label>
          <div className="relative">
            <input
              type="text"
              value={provinsi}
              onChange={e => {
                onChangeProvinsi(e.target.value.toUpperCase());
                setActiveDropdown('provinsi');
              }}
              onFocus={() => setActiveDropdown('provinsi')}
              placeholder="Pilih / Ketik Provinsi"
              className="w-full pl-3 pr-7 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 uppercase transition-all"
              required={required}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setActiveDropdown(activeDropdown === 'provinsi' ? null : 'provinsi')}
              className="absolute right-2 top-2.5 p-0.5 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === 'provinsi' ? 'rotate-180 text-blue-600' : ''}`} />
            </button>
          </div>

          {/* Provinsi Dropdown Menu */}
          {activeDropdown === 'provinsi' && (
            <div className="absolute z-40 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-52 overflow-y-auto divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-100">
              <div className="p-1.5 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase sticky top-0">
                38 Provinsi Indonesia
              </div>
              {filteredProvinces.length > 0 ? (
                filteredProvinces.map(prov => (
                  <div
                    key={prov}
                    onClick={() => {
                      onChangeProvinsi(prov);
                      onChangeKabupaten('');
                      onChangeKecamatan('');
                      onChangeKelurahan('');
                      setActiveDropdown('kabupaten');
                    }}
                    className={`px-3 py-2 text-xs font-medium cursor-pointer hover:bg-blue-50 transition-colors flex items-center justify-between ${
                      provinsi.toUpperCase() === prov.toUpperCase() ? 'bg-blue-50/70 text-blue-700 font-bold' : 'text-slate-800'
                    }`}
                  >
                    <span>{prov}</span>
                    {provinsi.toUpperCase() === prov.toUpperCase() && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </div>
                ))
              ) : (
                <div className="p-2.5 text-xs text-slate-400 text-center">
                  Gunakan teks "{provinsi}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* 2. KABUPATEN / KOTA */}
        <div className="relative">
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
            Kab / Kota {required && '*'}
          </label>
          <div className="relative">
            <input
              type="text"
              value={kabupaten}
              onChange={e => {
                onChangeKabupaten(e.target.value.toUpperCase());
                setActiveDropdown('kabupaten');
              }}
              onFocus={() => setActiveDropdown('kabupaten')}
              placeholder="Pilih / Ketik Kab/Kota"
              className="w-full pl-3 pr-7 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 uppercase transition-all"
              required={required}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setActiveDropdown(activeDropdown === 'kabupaten' ? null : 'kabupaten')}
              className="absolute right-2 top-2.5 p-0.5 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === 'kabupaten' ? 'rotate-180 text-blue-600' : ''}`} />
            </button>
          </div>

          {/* Kabupaten / Kota Dropdown Menu */}
          {activeDropdown === 'kabupaten' && (
            <div className="absolute z-40 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-52 overflow-y-auto divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-100">
              <div className="p-1.5 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase sticky top-0">
                {provinsi ? `Kab/Kota di ${provinsi}` : 'Daftar Kab/Kota'}
              </div>
              {filteredRegencies.length > 0 ? (
                filteredRegencies.map(kab => (
                  <div
                    key={kab}
                    onClick={() => {
                      onChangeKabupaten(kab);
                      onChangeKecamatan('');
                      onChangeKelurahan('');
                      setActiveDropdown('kecamatan');
                    }}
                    className={`px-3 py-2 text-xs font-medium cursor-pointer hover:bg-blue-50 transition-colors flex items-center justify-between ${
                      kabupaten.toUpperCase() === kab.toUpperCase() ? 'bg-blue-50/70 text-blue-700 font-bold' : 'text-slate-800'
                    }`}
                  >
                    <span>{kab}</span>
                    {kabupaten.toUpperCase() === kab.toUpperCase() && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </div>
                ))
              ) : (
                <div className="p-2.5 text-xs text-slate-400 text-center">
                  Gunakan teks "{kabupaten}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* 3. KECAMATAN */}
        <div className="relative">
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
            Kecamatan {required && '*'}
          </label>
          <div className="relative">
            <input
              type="text"
              value={kecamatan}
              onChange={e => {
                onChangeKecamatan(e.target.value.toUpperCase());
                setActiveDropdown('kecamatan');
              }}
              onFocus={() => setActiveDropdown('kecamatan')}
              placeholder="Pilih / Ketik Kecamatan"
              className="w-full pl-3 pr-7 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 uppercase transition-all"
              required={required}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setActiveDropdown(activeDropdown === 'kecamatan' ? null : 'kecamatan')}
              className="absolute right-2 top-2.5 p-0.5 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === 'kecamatan' ? 'rotate-180 text-blue-600' : ''}`} />
            </button>
          </div>

          {/* Kecamatan Dropdown Menu */}
          {activeDropdown === 'kecamatan' && (
            <div className="absolute z-40 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-52 overflow-y-auto divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-100">
              <div className="p-1.5 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase sticky top-0">
                {kabupaten ? `Kecamatan di ${kabupaten}` : 'Daftar Kecamatan'}
              </div>
              {filteredDistricts.length > 0 ? (
                filteredDistricts.map(kec => (
                  <div
                    key={kec}
                    onClick={() => {
                      onChangeKecamatan(kec);
                      onChangeKelurahan('');
                      setActiveDropdown('kelurahan');
                    }}
                    className={`px-3 py-2 text-xs font-medium cursor-pointer hover:bg-blue-50 transition-colors flex items-center justify-between ${
                      kecamatan.toUpperCase() === kec.toUpperCase() ? 'bg-blue-50/70 text-blue-700 font-bold' : 'text-slate-800'
                    }`}
                  >
                    <span>{kec}</span>
                    {kecamatan.toUpperCase() === kec.toUpperCase() && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </div>
                ))
              ) : (
                <div className="p-2.5 text-xs text-slate-400 text-center">
                  Gunakan teks "{kecamatan}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* 4. KELURAHAN / DESA */}
        <div className="relative">
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
            Kelurahan {required && '*'}
          </label>
          <div className="relative">
            <input
              type="text"
              value={kelurahan}
              onChange={e => {
                onChangeKelurahan(e.target.value.toUpperCase());
                setActiveDropdown('kelurahan');
              }}
              onFocus={() => setActiveDropdown('kelurahan')}
              placeholder="Pilih / Ketik Kelurahan"
              className="w-full pl-3 pr-7 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 uppercase transition-all"
              required={required}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setActiveDropdown(activeDropdown === 'kelurahan' ? null : 'kelurahan')}
              className="absolute right-2 top-2.5 p-0.5 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === 'kelurahan' ? 'rotate-180 text-blue-600' : ''}`} />
            </button>
          </div>

          {/* Kelurahan Dropdown Menu (Dengan Auto-fill Pintar jika ada hierarki) */}
          {activeDropdown === 'kelurahan' && (
            <div className="absolute z-40 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-52 overflow-y-auto divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-100">
              <div className="p-1.5 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase sticky top-0">
                {kecamatan ? `Kelurahan di ${kecamatan}` : 'Daftar Kelurahan'}
              </div>
              {filteredVillages.length > 0 ? (
                filteredVillages.map((item, idx) => (
                  <div
                    key={`${item.name}-${idx}`}
                    onClick={() => {
                      if (item.hierarchy) {
                        handleSelectFull(item.hierarchy);
                      } else {
                        onChangeKelurahan(item.name);
                        setActiveDropdown(null);
                      }
                    }}
                    className={`px-3 py-2 text-xs font-medium cursor-pointer hover:bg-blue-50 transition-colors ${
                      kelurahan.toUpperCase() === item.name.toUpperCase() ? 'bg-blue-50/70 text-blue-700 font-bold' : 'text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{item.name}</span>
                      {kelurahan.toUpperCase() === item.name.toUpperCase() && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </div>
                    {item.hierarchy && (
                      <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                        Kec. {item.hierarchy.kecamatan}, {item.hierarchy.kabupaten}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-2.5 text-xs text-slate-400 text-center">
                  Gunakan teks "{kelurahan}"
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
