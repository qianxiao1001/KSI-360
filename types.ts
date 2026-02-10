export interface EvaluationRecord {
  id: string;
  timestamp: string;
  evaluator: string;
  target: string;
  pos_scores: Record<string, number>;
  neg_scores: Record<string, number>;
  text_start: string;
  text_stop: string;
  text_continue: string;
}

export type ScoreMap = Record<string, number>;

export interface AggregatedData {
  target: string;
  avgPos: ScoreMap;
  avgNeg: ScoreMap;
  commentsStart: string[];
  commentsStop: string[];
  commentsContinue: string[];
  count: number;
}