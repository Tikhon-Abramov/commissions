export interface RatingIndicator {
  code: string;
  name: string;
  place: number;
  value: string;
  averageRf: string;
  bestPractice?: string;
}

export interface RatingTopRow {
  title: string;
  rating: number;
}
