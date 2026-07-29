export interface SleepMethod {
  name: string;
  suitableAge: string;
  description: string;
  steps: string[];
  prosAndCons: string;
}

export interface SleepRoutineStep {
  stepNumber: number;
  title: string;
  action: string;
  tips: string;
}

export interface SleepGuideSection {
  id: string;
  title: string;
  subtitle: string;
  sleepCues: {
    earlyCues: string[];
    lateCues: string[];
  };
  bedtimeRoutine: SleepRoutineStep[];
  methods: SleepMethod[];
  safeSleepRules: string[];
  easySchedulesSummary: Array<{
    name: string;
    age: string;
    wakeWindow: string;
    napsCount: string;
  }>;
}

export const fetchSleepKnowledgeData = () => import("./json/sleepKnowledge.json").then(m => m.default as SleepGuideSection);
