export interface AbnormalCondition {
  id: string;
  title: string;
  symptoms: string;
  homeCare: string;
  whenToSeeDoctor: string;
}

export interface FirstAidGuide {
  id: string;
  title: string;
  goldenRule: string;
  steps: string[];
  warnings: string[];
}

export interface MedicineKnowledge {
  name: string;
  usage: string;
  dosageNotes: string;
  warnings: string;
}

export interface HealthData {
  abnormalConditions: AbnormalCondition[];
  firstAidGuides: FirstAidGuide[];
  medicinesList: MedicineKnowledge[];
  medicineCabinetItems: string[];
}

export const fetchHealthKnowledgeData = () => import("./json/healthKnowledge.json").then(m => m.default as HealthData);
