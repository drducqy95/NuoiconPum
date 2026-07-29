export interface PregnancyMilestone {
  id: string;
  period: string;
  babyDevelopment: string;
  momChanges: string;
  checkupsAndTests: Array<{
    title: string;
    description: string;
    ultrasoundNotes?: string;
  }>;
  tips: string[];
}

export const fetchPregnancyData = () => import("./json/pregnancy.json").then(m => m.default as PregnancyMilestone[]);
