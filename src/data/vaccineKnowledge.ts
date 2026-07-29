export interface VaccineInfo {
  id: string;
  ageMilestone: string;
  vaccineName: string;
  diseaseTarget: string;
  doseNumber: string;
  topBrands: string[];
  commonSideEffects: string[];
  contraindications: string[];
  postCareTips: string;
}

export interface VaccineCategoryDetail {
  id: string;
  title: string;
  code: string;
  diseasePrevented: string;
  totalDoses: string;
  manufacturers: string;
  sideEffects: string;
  contraindications: string;
  importantNotes: string;
}

export interface NationalVaccineMatrixRow {
  id: string;
  vaccineName: string;
  programType: 'TCMR' | 'DV' | 'BOTH'; // TCMR: Tiêm chủng mở rộng, DV: Dịch vụ, BOTH: Cả 2
  newborn?: string;
  month2?: string;
  month3?: string;
  month4?: string;
  month6?: string;
  month9?: string;
  month12?: string;
  month18_24?: string;
  years4_6?: string;
  notes?: string;
}

// Brand-Based Vaccine Catalog Preset (Phân loại theo Nhóm vắc-xin & Tên Biệt dược cụ thể)
export interface VaccineBrandPreset {
  id: string;
  categoryName: string;      // Nhóm loại vắc-xin
  brandName: string;         // Tên biệt dược cụ thể
  manufacturer: string;      // Hãng sản xuất & Quốc gia
  targetDiseases: string;    // Bệnh phòng ngừa
  totalDosesText: string;    // Phác đồ tổng số mũi
  defaultLocation: string;
}


export interface VaccineData {
  BRAND_VACCINE_CATALOG: VaccineBrandPreset[];
  NATIONAL_VACCINE_MATRIX: NationalVaccineMatrixRow[];
  VACCINE_SCHEDULE: VaccineInfo[];
  DETAILED_VACCINES: VaccineCategoryDetail[];
  VACCINE_RULES: any[]; // Or define proper type if available
}
export const fetchVaccineData = () => import("./json/vaccineKnowledge.json").then(m => m.default as VaccineData);
