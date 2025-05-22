import type { Plan } from '../scripts/plans';

declare global {
    interface Window {
        plans: Plan[];
    }
}

export {};