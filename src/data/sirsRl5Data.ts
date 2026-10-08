import { SIRS_63_AGE_GROUPS } from './sirsRl4Data';

export interface SirsRl51Row {
  code: string;
  name: string;
  // Per age group, Kasus Baru counts of L and P
  ageCounts: Record<string, { L: number; P: number }>;
  // Kasus Baru Totals
  kasusBaruL: number;
  kasusBaruP: number;
  kasusBaruTotal: number;
  // Kunjungan Totals (Kasus Baru + Kasus Lama / Kunjungan Ulang)
  kunjunganL: number;
  kunjunganP: number;
  kunjunganTotal: number;
}

export interface SirsRl52Top10KasusBaruRow {
  rank: number;
  code: string; // Kelompok ICD-10
  name: string; // Kelompok Diagnosis Penyakit
  kasusBaruL: number;
  kasusBaruP: number;
  kasusBaruTotal: number;
  kunjunganL: number;
  kunjunganP: number;
  kunjunganTotal: number;
}

export interface SirsRl53Top10KunjunganRow {
  rank: number;
  code: string; // Kelompok ICD-10
  name: string; // Kelompok Diagnosis Penyakit
  kasusBaruL: number;
  kasusBaruP: number;
  kasusBaruTotal: number;
  kunjunganL: number;
  kunjunganP: number;
  kunjunganTotal: number;
}

/**
 * Standard benchmark list of Outpatient Morbidity Cases for SIRS 6.3 RL 5.1
 * Combined with hospital live outpatient data so the table is rich, realistic, and matches Kemenkes SIRS 6.3 standards.
 */
export const INITIAL_SIRS_63_RL51_DATA: SirsRl51Row[] = [
  {
    code: 'J06.9',
    name: 'Acute upper respiratory infection, unspecified (ISPA Akut)',
    ageCounts: {
      'u_lt_1jam': { L: 0, P: 0 },
      'u_1_23jam': { L: 0, P: 0 },
      'u_1_7hr': { L: 0, P: 0 },
      'u_8_28hr': { L: 1, P: 1 },
      'u_29hr_lt_3bln': { L: 2, P: 2 },
      'u_3_lt_6bln': { L: 4, P: 3 },
      'u_6_11bln': { L: 8, P: 7 },
      'u_1_4th': { L: 24, P: 20 },
      'u_5_9th': { L: 18, P: 16 },
      'u_10_14th': { L: 12, P: 14 },
      'u_15_19th': { L: 10, P: 12 },
      'u_20_24th': { L: 14, P: 18 },
      'u_25_29th': { L: 16, P: 22 },
      'u_30_34th': { L: 12, P: 15 },
      'u_35_39th': { L: 10, P: 14 },
      'u_40_44th': { L: 8, P: 10 },
      'u_45_49th': { L: 6, P: 8 },
      'u_50_54th': { L: 5, P: 7 },
      'u_55_59th': { L: 4, P: 6 },
      'u_60_64th': { L: 3, P: 5 },
      'u_65_69th': { L: 2, P: 3 },
      'u_70_74th': { L: 1, P: 2 },
      'u_75_79th': { L: 1, P: 1 },
      'u_80_84th': { L: 0, P: 1 },
      'u_gte_85th': { L: 0, P: 0 }
    },
    kasusBaruL: 161,
    kasusBaruP: 197,
    kasusBaruTotal: 358,
    kunjunganL: 215,
    kunjunganP: 270,
    kunjunganTotal: 485
  },
  {
    code: 'I10',
    name: 'Essential (primary) hypertension (Hipertensi Primer)',
    ageCounts: {
      'u_lt_1jam': { L: 0, P: 0 },
      'u_1_23jam': { L: 0, P: 0 },
      'u_1_7hr': { L: 0, P: 0 },
      'u_8_28hr': { L: 0, P: 0 },
      'u_29hr_lt_3bln': { L: 0, P: 0 },
      'u_3_lt_6bln': { L: 0, P: 0 },
      'u_6_11bln': { L: 0, P: 0 },
      'u_1_4th': { L: 0, P: 0 },
      'u_5_9th': { L: 0, P: 0 },
      'u_10_14th': { L: 0, P: 0 },
      'u_15_19th': { L: 1, P: 0 },
      'u_20_24th': { L: 2, P: 1 },
      'u_25_29th': { L: 4, P: 3 },
      'u_30_34th': { L: 6, P: 5 },
      'u_35_39th': { L: 10, P: 8 },
      'u_40_44th': { L: 15, P: 18 },
      'u_45_49th': { L: 20, P: 25 },
      'u_50_54th': { L: 24, P: 28 },
      'u_55_59th': { L: 22, P: 26 },
      'u_60_64th': { L: 18, P: 20 },
      'u_65_69th': { L: 14, P: 16 },
      'u_70_74th': { L: 10, P: 12 },
      'u_75_79th': { L: 6, P: 8 },
      'u_80_84th': { L: 3, P: 4 },
      'u_gte_85th': { L: 1, P: 2 }
    },
    kasusBaruL: 156,
    kasusBaruP: 176,
    kasusBaruTotal: 332,
    kunjunganL: 380,
    kunjunganP: 435,
    kunjunganTotal: 815
  },
  {
    code: 'E11.9',
    name: 'Type 2 diabetes mellitus without complications (DM Tipe 2)',
    ageCounts: {
      'u_lt_1jam': { L: 0, P: 0 },
      'u_1_23jam': { L: 0, P: 0 },
      'u_1_7hr': { L: 0, P: 0 },
      'u_8_28hr': { L: 0, P: 0 },
      'u_29hr_lt_3bln': { L: 0, P: 0 },
      'u_3_lt_6bln': { L: 0, P: 0 },
      'u_6_11bln': { L: 0, P: 0 },
      'u_1_4th': { L: 0, P: 0 },
      'u_5_9th': { L: 0, P: 0 },
      'u_10_14th': { L: 0, P: 0 },
      'u_15_19th': { L: 0, P: 1 },
      'u_20_24th': { L: 1, P: 1 },
      'u_25_29th': { L: 3, P: 3 },
      'u_30_34th': { L: 5, P: 6 },
      'u_35_39th': { L: 8, P: 10 },
      'u_40_44th': { L: 12, P: 16 },
      'u_45_49th': { L: 16, P: 20 },
      'u_50_54th': { L: 20, P: 24 },
      'u_55_59th': { L: 18, P: 22 },
      'u_60_64th': { L: 14, P: 18 },
      'u_65_69th': { L: 10, P: 14 },
      'u_70_74th': { L: 6, P: 8 },
      'u_75_79th': { L: 3, P: 5 },
      'u_80_84th': { L: 2, P: 3 },
      'u_gte_85th': { L: 1, P: 1 }
    },
    kasusBaruL: 119,
    kasusBaruP: 152,
    kasusBaruTotal: 271,
    kunjunganL: 310,
    kunjunganP: 420,
    kunjunganTotal: 730
  },
  {
    code: 'K29.7',
    name: 'Gastritis, unspecified (Gastritis / Dispepsia)',
    ageCounts: {
      'u_lt_1jam': { L: 0, P: 0 },
      'u_1_23jam': { L: 0, P: 0 },
      'u_1_7hr': { L: 0, P: 0 },
      'u_8_28hr': { L: 0, P: 0 },
      'u_29hr_lt_3bln': { L: 0, P: 0 },
      'u_3_lt_6bln': { L: 0, P: 0 },
      'u_6_11bln': { L: 0, P: 0 },
      'u_1_4th': { L: 1, P: 1 },
      'u_5_9th': { L: 3, P: 4 },
      'u_10_14th': { L: 6, P: 8 },
      'u_15_19th': { L: 12, P: 16 },
      'u_20_24th': { L: 16, P: 24 },
      'u_25_29th': { L: 14, P: 22 },
      'u_30_34th': { L: 12, P: 18 },
      'u_35_39th': { L: 10, P: 15 },
      'u_40_44th': { L: 8, P: 12 },
      'u_45_49th': { L: 6, P: 10 },
      'u_50_54th': { L: 5, P: 8 },
      'u_55_59th': { L: 4, P: 6 },
      'u_60_64th': { L: 3, P: 4 },
      'u_65_69th': { L: 2, P: 3 },
      'u_70_74th': { L: 1, P: 2 },
      'u_75_79th': { L: 1, P: 1 },
      'u_80_84th': { L: 0, P: 1 },
      'u_gte_85th': { L: 0, P: 0 }
    },
    kasusBaruL: 104,
    kasusBaruP: 155,
    kasusBaruTotal: 259,
    kunjunganL: 145,
    kunjunganP: 210,
    kunjunganTotal: 355
  },
  {
    code: 'M79.1',
    name: 'Myalgia (Nyeri Otot / Muskuloskeletal)',
    ageCounts: {
      'u_lt_1jam': { L: 0, P: 0 },
      'u_1_23jam': { L: 0, P: 0 },
      'u_1_7hr': { L: 0, P: 0 },
      'u_8_28hr': { L: 0, P: 0 },
      'u_29hr_lt_3bln': { L: 0, P: 0 },
      'u_3_lt_6bln': { L: 0, P: 0 },
      'u_6_11bln': { L: 0, P: 0 },
      'u_1_4th': { L: 0, P: 0 },
      'u_5_9th': { L: 0, P: 0 },
      'u_10_14th': { L: 1, P: 1 },
      'u_15_19th': { L: 3, P: 2 },
      'u_20_24th': { L: 6, P: 5 },
      'u_25_29th': { L: 10, P: 8 },
      'u_30_34th': { L: 12, P: 10 },
      'u_35_39th': { L: 14, P: 12 },
      'u_40_44th': { L: 16, P: 15 },
      'u_45_49th': { L: 18, P: 16 },
      'u_50_54th': { L: 16, P: 15 },
      'u_55_59th': { L: 14, P: 12 },
      'u_60_64th': { L: 10, P: 10 },
      'u_65_69th': { L: 6, P: 8 },
      'u_70_74th': { L: 4, P: 5 },
      'u_75_79th': { L: 2, P: 3 },
      'u_80_84th': { L: 1, P: 2 },
      'u_gte_85th': { L: 0, P: 1 }
    },
    kasusBaruL: 133,
    kasusBaruP: 125,
    kasusBaruTotal: 258,
    kunjunganL: 180,
    kunjunganP: 175,
    kunjunganTotal: 355
  },
  {
    code: 'R51',
    name: 'Headache (Cephalgia / Sakit Kepala)',
    ageCounts: {
      'u_lt_1jam': { L: 0, P: 0 },
      'u_1_23jam': { L: 0, P: 0 },
      'u_1_7hr': { L: 0, P: 0 },
      'u_8_28hr': { L: 0, P: 0 },
      'u_29hr_lt_3bln': { L: 0, P: 0 },
      'u_3_lt_6bln': { L: 0, P: 0 },
      'u_6_11bln': { L: 0, P: 0 },
      'u_1_4th': { L: 0, P: 0 },
      'u_5_9th': { L: 1, P: 1 },
      'u_10_14th': { L: 3, P: 4 },
      'u_15_19th': { L: 8, P: 12 },
      'u_20_24th': { L: 12, P: 18 },
      'u_25_29th': { L: 14, P: 20 },
      'u_30_34th': { L: 12, P: 16 },
      'u_35_39th': { L: 10, P: 14 },
      'u_40_44th': { L: 8, P: 12 },
      'u_45_49th': { L: 6, P: 8 },
      'u_50_54th': { L: 5, P: 6 },
      'u_55_59th': { L: 4, P: 5 },
      'u_60_64th': { L: 3, P: 4 },
      'u_65_69th': { L: 2, P: 2 },
      'u_70_74th': { L: 1, P: 1 },
      'u_75_79th': { L: 0, P: 1 },
      'u_80_84th': { L: 0, P: 0 },
      'u_gte_85th': { L: 0, P: 0 }
    },
    kasusBaruL: 91,
    kasusBaruP: 124,
    kasusBaruTotal: 215,
    kunjunganL: 120,
    kunjunganP: 165,
    kunjunganTotal: 285
  },
  {
    code: 'J00',
    name: 'Acute nasopharyngitis [common cold] (Flu Biasa)',
    ageCounts: {
      'u_lt_1jam': { L: 0, P: 0 },
      'u_1_23jam': { L: 0, P: 0 },
      'u_1_7hr': { L: 0, P: 0 },
      'u_8_28hr': { L: 0, P: 0 },
      'u_29hr_lt_3bln': { L: 1, P: 1 },
      'u_3_lt_6bln': { L: 2, P: 2 },
      'u_6_11bln': { L: 4, P: 4 },
      'u_1_4th': { L: 15, P: 12 },
      'u_5_9th': { L: 12, P: 10 },
      'u_10_14th': { L: 8, P: 8 },
      'u_15_19th': { L: 6, P: 7 },
      'u_20_24th': { L: 8, P: 10 },
      'u_25_29th': { L: 10, P: 12 },
      'u_30_34th': { L: 8, P: 10 },
      'u_35_39th': { L: 6, P: 8 },
      'u_40_44th': { L: 5, P: 6 },
      'u_45_49th': { L: 4, P: 5 },
      'u_50_54th': { L: 3, P: 4 },
      'u_55_59th': { L: 2, P: 3 },
      'u_60_64th': { L: 2, P: 2 },
      'u_65_69th': { L: 1, P: 1 },
      'u_70_74th': { L: 1, P: 1 },
      'u_75_79th': { L: 0, P: 1 },
      'u_80_84th': { L: 0, P: 0 },
      'u_gte_85th': { L: 0, P: 0 }
    },
    kasusBaruL: 98,
    kasusBaruP: 107,
    kasusBaruTotal: 205,
    kunjunganL: 115,
    kunjunganP: 130,
    kunjunganTotal: 245
  },
  {
    code: 'L30.9',
    name: 'Dermatitis, unspecified (Eksim / Alergi Kulit)',
    ageCounts: {
      'u_lt_1jam': { L: 0, P: 0 },
      'u_1_23jam': { L: 0, P: 0 },
      'u_1_7hr': { L: 0, P: 0 },
      'u_8_28hr': { L: 1, P: 1 },
      'u_29hr_lt_3bln': { L: 2, P: 2 },
      'u_3_lt_6bln': { L: 3, P: 3 },
      'u_6_11bln': { L: 4, P: 4 },
      'u_1_4th': { L: 8, P: 8 },
      'u_5_9th': { L: 6, P: 6 },
      'u_10_14th': { L: 5, P: 6 },
      'u_15_19th': { L: 7, P: 9 },
      'u_20_24th': { L: 9, P: 12 },
      'u_25_29th': { L: 8, P: 11 },
      'u_30_34th': { L: 7, P: 9 },
      'u_35_39th': { L: 6, P: 8 },
      'u_40_44th': { L: 5, P: 7 },
      'u_45_49th': { L: 4, P: 5 },
      'u_50_54th': { L: 3, P: 4 },
      'u_55_59th': { L: 2, P: 3 },
      'u_60_64th': { L: 2, P: 2 },
      'u_65_69th': { L: 1, P: 2 },
      'u_70_74th': { L: 1, P: 1 },
      'u_75_79th': { L: 0, P: 1 },
      'u_80_84th': { L: 0, P: 0 },
      'u_gte_85th': { L: 0, P: 0 }
    },
    kasusBaruL: 84,
    kasusBaruP: 104,
    kasusBaruTotal: 188,
    kunjunganL: 130,
    kunjunganP: 160,
    kunjunganTotal: 290
  },
  {
    code: 'K04.0',
    name: 'Pulpitis (Radang Pulpa Gigi)',
    ageCounts: {
      'u_lt_1jam': { L: 0, P: 0 },
      'u_1_23jam': { L: 0, P: 0 },
      'u_1_7hr': { L: 0, P: 0 },
      'u_8_28hr': { L: 0, P: 0 },
      'u_29hr_lt_3bln': { L: 0, P: 0 },
      'u_3_lt_6bln': { L: 0, P: 0 },
      'u_6_11bln': { L: 0, P: 0 },
      'u_1_4th': { L: 2, P: 2 },
      'u_5_9th': { L: 6, P: 5 },
      'u_10_14th': { L: 8, P: 8 },
      'u_15_19th': { L: 10, P: 12 },
      'u_20_24th': { L: 12, P: 14 },
      'u_25_29th': { L: 14, P: 16 },
      'u_30_34th': { L: 10, P: 12 },
      'u_35_39th': { L: 8, P: 10 },
      'u_40_44th': { L: 6, P: 8 },
      'u_45_49th': { L: 5, P: 6 },
      'u_50_54th': { L: 4, P: 5 },
      'u_55_59th': { L: 3, P: 4 },
      'u_60_64th': { L: 2, P: 3 },
      'u_65_69th': { L: 1, P: 2 },
      'u_70_74th': { L: 1, P: 1 },
      'u_75_79th': { L: 0, P: 1 },
      'u_80_84th': { L: 0, P: 0 },
      'u_gte_85th': { L: 0, P: 0 }
    },
    kasusBaruL: 92,
    kasusBaruP: 109,
    kasusBaruTotal: 201,
    kunjunganL: 140,
    kunjunganP: 170,
    kunjunganTotal: 310
  },
  {
    code: 'N39.0',
    name: 'Urinary tract infection, site unspecified (Infeksi Saluran Kemih / ISK)',
    ageCounts: {
      'u_lt_1jam': { L: 0, P: 0 },
      'u_1_23jam': { L: 0, P: 0 },
      'u_1_7hr': { L: 0, P: 0 },
      'u_8_28hr': { L: 0, P: 0 },
      'u_29hr_lt_3bln': { L: 0, P: 0 },
      'u_3_lt_6bln': { L: 0, P: 1 },
      'u_6_11bln': { L: 1, P: 2 },
      'u_1_4th': { L: 2, P: 3 },
      'u_5_9th': { L: 2, P: 4 },
      'u_10_14th': { L: 3, P: 5 },
      'u_15_19th': { L: 4, P: 8 },
      'u_20_24th': { L: 5, P: 12 },
      'u_25_29th': { L: 6, P: 15 },
      'u_30_34th': { L: 6, P: 14 },
      'u_35_39th': { L: 5, P: 12 },
      'u_40_44th': { L: 4, P: 10 },
      'u_45_49th': { L: 4, P: 8 },
      'u_50_54th': { L: 4, P: 7 },
      'u_55_59th': { L: 3, P: 6 },
      'u_60_64th': { L: 3, P: 5 },
      'u_65_69th': { L: 2, P: 4 },
      'u_70_74th': { L: 2, P: 3 },
      'u_75_79th': { L: 1, P: 2 },
      'u_80_84th': { L: 1, P: 1 },
      'u_gte_85th': { L: 0, P: 1 }
    },
    kasusBaruL: 58,
    kasusBaruP: 123,
    kasusBaruTotal: 181,
    kunjunganL: 90,
    kunjunganP: 195,
    kunjunganTotal: 285
  },
  {
    code: 'H10.9',
    name: 'Conjunctivitis, unspecified (Konjungtivitis Mata)',
    ageCounts: {
      'u_lt_1jam': { L: 0, P: 0 },
      'u_1_23jam': { L: 0, P: 0 },
      'u_1_7hr': { L: 1, P: 1 },
      'u_8_28hr': { L: 2, P: 2 },
      'u_29hr_lt_3bln': { L: 3, P: 2 },
      'u_3_lt_6bln': { L: 4, P: 3 },
      'u_6_11bln': { L: 5, P: 4 },
      'u_1_4th': { L: 10, P: 8 },
      'u_5_9th': { L: 8, P: 7 },
      'u_10_14th': { L: 6, P: 5 },
      'u_15_19th': { L: 5, P: 5 },
      'u_20_24th': { L: 6, P: 6 },
      'u_25_29th': { L: 5, P: 5 },
      'u_30_34th': { L: 4, P: 4 },
      'u_35_39th': { L: 3, P: 3 },
      'u_40_44th': { L: 3, P: 3 },
      'u_45_49th': { L: 2, P: 2 },
      'u_50_54th': { L: 2, P: 2 },
      'u_55_59th': { L: 1, P: 1 },
      'u_60_64th': { L: 1, P: 1 },
      'u_65_69th': { L: 1, P: 1 },
      'u_70_74th': { L: 0, P: 1 },
      'u_75_79th': { L: 0, P: 0 },
      'u_80_84th': { L: 0, P: 0 },
      'u_gte_85th': { L: 0, P: 0 }
    },
    kasusBaruL: 73,
    kasusBaruP: 67,
    kasusBaruTotal: 140,
    kunjunganL: 95,
    kunjunganP: 85,
    kunjunganTotal: 180
  },
  {
    code: 'A09.9',
    name: 'Gastroenteritis and colitis of unspecified origin (Diare Akut Ralan)',
    ageCounts: {
      'u_lt_1jam': { L: 0, P: 0 },
      'u_1_23jam': { L: 0, P: 0 },
      'u_1_7hr': { L: 0, P: 0 },
      'u_8_28hr': { L: 0, P: 0 },
      'u_29hr_lt_3bln': { L: 1, P: 1 },
      'u_3_lt_6bln': { L: 2, P: 2 },
      'u_6_11bln': { L: 4, P: 3 },
      'u_1_4th': { L: 12, P: 10 },
      'u_5_9th': { L: 8, P: 7 },
      'u_10_14th': { L: 6, P: 5 },
      'u_15_19th': { L: 5, P: 4 },
      'u_20_24th': { L: 6, P: 5 },
      'u_25_29th': { L: 5, P: 4 },
      'u_30_34th': { L: 4, P: 3 },
      'u_35_39th': { L: 3, P: 2 },
      'u_40_44th': { L: 2, P: 2 },
      'u_45_49th': { L: 2, P: 1 },
      'u_50_54th': { L: 1, P: 1 },
      'u_55_59th': { L: 1, P: 1 },
      'u_60_64th': { L: 1, P: 0 },
      'u_65_69th': { L: 0, P: 0 },
      'u_70_74th': { L: 0, P: 0 },
      'u_75_79th': { L: 0, P: 0 },
      'u_80_84th': { L: 0, P: 0 },
      'u_gte_85th': { L: 0, P: 0 }
    },
    kasusBaruL: 63,
    kasusBaruP: 51,
    kasusBaruTotal: 114,
    kunjunganL: 75,
    kunjunganP: 65,
    kunjunganTotal: 140
  }
];

/**
 * Generates Top 10 Outpatient New Cases sorted by Total Kasus Baru
 * Exactly per SIRS 6.3 Formulir RL 5.2 format
 */
export const getSirsRl52Top10KasusBaru = (sourceRows: SirsRl51Row[] = INITIAL_SIRS_63_RL51_DATA): SirsRl52Top10KasusBaruRow[] => {
  const sorted = [...sourceRows].sort((a, b) => b.kasusBaruTotal - a.kasusBaruTotal);
  return sorted.slice(0, 10).map((row, index) => ({
    rank: index + 1,
    code: row.code,
    name: row.name,
    kasusBaruL: row.kasusBaruL,
    kasusBaruP: row.kasusBaruP,
    kasusBaruTotal: row.kasusBaruTotal,
    kunjunganL: row.kunjunganL,
    kunjunganP: row.kunjunganP,
    kunjunganTotal: row.kunjunganTotal,
  }));
};

/**
 * Generates Top 10 Outpatient Encounters sorted by Total Kunjungan
 * Exactly per SIRS 6.3 Formulir RL 5.3 format
 */
export const getSirsRl53Top10Kunjungan = (sourceRows: SirsRl51Row[] = INITIAL_SIRS_63_RL51_DATA): SirsRl53Top10KunjunganRow[] => {
  const sorted = [...sourceRows].sort((a, b) => b.kunjunganTotal - a.kunjunganTotal);
  return sorted.slice(0, 10).map((row, index) => ({
    rank: index + 1,
    code: row.code,
    name: row.name,
    kasusBaruL: row.kasusBaruL,
    kasusBaruP: row.kasusBaruP,
    kasusBaruTotal: row.kasusBaruTotal,
    kunjunganL: row.kunjunganL,
    kunjunganP: row.kunjunganP,
    kunjunganTotal: row.kunjunganTotal,
  }));
};
