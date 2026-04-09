export type LoadingState = 'idle' | 'pending' | 'succeeded' | 'failed';

export interface RegionOption {
  value: string;
  label: string;
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface SummaryMetric {
  label: string;
  value: string;
  hint?: string;
}
