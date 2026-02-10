import { EvaluationRecord, AggregatedData } from '../types';
import { STORAGE_KEY, POSITIVE_QUESTIONS, NEGATIVE_QUESTIONS } from '../constants';

export const saveEvaluation = (record: Omit<EvaluationRecord, 'id' | 'timestamp'>): void => {
  const currentDataStr = localStorage.getItem(STORAGE_KEY);
  let currentData: EvaluationRecord[] = currentDataStr ? JSON.parse(currentDataStr) : [];
  
  // Remove existing record for this evaluator and target to avoid duplicates
  currentData = currentData.filter(r => !(r.evaluator === record.evaluator && r.target === record.target));

  const newRecord: EvaluationRecord = {
    ...record,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  };

  currentData.push(newRecord);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(currentData));
};

export const getEvaluations = (): EvaluationRecord[] => {
  const currentDataStr = localStorage.getItem(STORAGE_KEY);
  return currentDataStr ? JSON.parse(currentDataStr) : [];
};

export const clearAllEvaluations = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

export const getEvaluationStats = (targetName: string): AggregatedData | null => {
  const allRecords = getEvaluations();
  const targetRecords = allRecords.filter(r => r.target === targetName);

  if (targetRecords.length === 0) return null;

  const count = targetRecords.length;
  
  // Initialize sums
  const posSums: Record<string, number> = {};
  const negSums: Record<string, number> = {};
  
  POSITIVE_QUESTIONS.forEach(q => posSums[q] = 0);
  NEGATIVE_QUESTIONS.forEach(q => negSums[q] = 0);

  const commentsStart: string[] = [];
  const commentsStop: string[] = [];
  const commentsContinue: string[] = [];

  // Aggregate
  targetRecords.forEach(record => {
    POSITIVE_QUESTIONS.forEach(q => posSums[q] += (record.pos_scores[q] || 0));
    NEGATIVE_QUESTIONS.forEach(q => negSums[q] += (record.neg_scores[q] || 0));
    
    if (record.text_start) commentsStart.push(record.text_start);
    if (record.text_stop) commentsStop.push(record.text_stop);
    if (record.text_continue) commentsContinue.push(record.text_continue);
  });

  // Calculate Averages
  const avgPos: Record<string, number> = {};
  const avgNeg: Record<string, number> = {};

  POSITIVE_QUESTIONS.forEach(q => avgPos[q] = parseFloat((posSums[q] / count).toFixed(1)));
  NEGATIVE_QUESTIONS.forEach(q => avgNeg[q] = parseFloat((negSums[q] / count).toFixed(1)));

  return {
    target: targetName,
    avgPos,
    avgNeg,
    commentsStart,
    commentsStop,
    commentsContinue,
    count
  };
};

export const downloadCSV = () => {
  const data = getEvaluations();
  if (data.length === 0) return;

  // Flatten logic for CSV
  const headers = [
    "Time", 
    "Evaluator", 
    "Target", 
    ...POSITIVE_QUESTIONS.map(q => `POS_${q.substring(0, 5)}`),
    ...NEGATIVE_QUESTIONS.map(q => `NEG_${q.substring(0, 5)}`),
    "Start_Suggestion",
    "Stop_Suggestion",
    "Continue_Suggestion"
  ];

  const csvRows = [headers.join(",")];

  data.forEach(row => {
    const values = [
      `"${row.timestamp}"`,
      `"${row.evaluator}"`,
      `"${row.target}"`,
      ...POSITIVE_QUESTIONS.map(q => row.pos_scores[q] || 0),
      ...NEGATIVE_QUESTIONS.map(q => row.neg_scores[q] || 0),
      `"${(row.text_start || '').replace(/"/g, '""')}"`,
      `"${(row.text_stop || '').replace(/"/g, '""')}"`,
      `"${(row.text_continue || '').replace(/"/g, '""')}"`
    ];
    csvRows.push(values.join(","));
  });

  const csvString = "\uFEFF" + csvRows.join("\n"); // Add BOM for Excel utf-8
  const blob = new Blob([csvString], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = `ksi_eval_v2_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};