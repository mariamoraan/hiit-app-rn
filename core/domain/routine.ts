export enum Level {
    beginner = 'beginner',
    intermediate = 'intermediate',
    advanced = 'advanced'
}


export enum StepType {
    work = 'work',
    rest = 'rest',
    prep = 'prep',
}

export interface Step {
    type: StepType;
    name: string;
    dur: number;
    note: string;
}

export interface Routine {
    id: string;
    name: string;
    description: string;
    color: string;
    level: Level;
    duration: string;
    exercises: number;
    steps: Step[]; 
    totalSeconds: number;
}

export interface Session {
    id: string;
    routineId: string;
    routineName: string;
    routineLevel: Level;
    completedAt: string; // ISO 8601
    durationSeconds: number;
}