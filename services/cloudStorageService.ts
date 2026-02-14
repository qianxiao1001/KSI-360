import { EvaluationRecord, AggregatedData } from '../types';
import { POSITIVE_QUESTIONS, NEGATIVE_QUESTIONS } from '../constants';
import { db, loginAnonymous } from './tcbConfig';

const COLLECTION_NAME = 'evaluations';

export const saveEvaluation = async (record: Omit<EvaluationRecord, 'id' | 'timestamp'>): Promise<void> => {
  await loginAnonymous();
  
  const collection = db.collection(COLLECTION_NAME);
  
  // 删除已有记录（避免重复）
  const existRes = await collection
    .where({
      evaluator: record.evaluator,
      target: record.target
    })
    .get();
    
  if (existRes.data && existRes.data.length > 0) {
    for (const doc of existRes.data) {
      await collection.doc(doc._id).remove();
    }
  }
  
  // 插入新记录
  await collection.add({
    ...record,
    timestamp: new Date().toISOString(),
    createdAt: db.serverDate()
  });
};

export const getEvaluations = async (): Promise<EvaluationRecord[]> => {
  await loginAnonymous();
  
  const res = await db.collection(COLLECTION_NAME)
    .orderBy('timestamp', 'desc')
    .get();
    
  return res.data || [];
};

export const clearAllEvaluations = async (): Promise<number> => {
  await loginAnonymous();
  
  const collection = db.collection(COLLECTION_NAME);
  const res = await collection.get();
  
  let deleteCount = 0;
  
  if (res.data) {
    for (const doc of res.data) {
      try {
        await collection.doc(doc._id).remove();
        deleteCount++;
        console.log(`已删除记录 ${deleteCount}:`, doc._id);
      } catch (err) {
        console.error('删除记录失败:', doc._id, err);
      }
    }
  }
  
  return deleteCount;
};

export const getEvaluationStats = async (targetName: string): Promise<AggregatedData | null> => {
  await loginAnonymous();
  
  const res = await db.collection(COLLECTION_NAME)
    .where({ target: targetName })
    .get();
    
  const targetRecords = res.data || [];
  
  if (targetRecords.length === 0) return null;
  
  const count = targetRecords.length;
  
  const posSums: Record<string, number> = {};
  const negSums: Record<string, number> = {};
  
  POSITIVE_QUESTIONS.forEach(q => posSums[q] = 0);
  NEGATIVE_QUESTIONS.forEach(q => negSums[q] = 0);
  
  const commentsStart: { text: string; evaluator: string }[] = [];
  const commentsStop: { text: string; evaluator: string }[] = [];
  const commentsContinue: { text: string; evaluator: string }[] = [];
  
  targetRecords.forEach((record: any) => {
    POSITIVE_QUESTIONS.forEach(q => posSums[q] += (record.pos_scores?.[q] || 0));
    NEGATIVE_QUESTIONS.forEach(q => negSums[q] += (record.neg_scores?.[q] || 0));
    
    if (record.text_start) commentsStart.push({ text: record.text_start, evaluator: record.evaluator });
    if (record.text_stop) commentsStop.push({ text: record.text_stop, evaluator: record.evaluator });
    if (record.text_continue) commentsContinue.push({ text: record.text_continue, evaluator: record.evaluator });
  });
  
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

export const downloadCSV = async () => {
  const data = await getEvaluations();
  if (data.length === 0) return;
  
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
  
  data.forEach((row: any) => {
    const values = [
      `"${row.timestamp}"`,
      `"${row.evaluator}"`,
      `"${row.target}"`,
      ...POSITIVE_QUESTIONS.map(q => row.pos_scores?.[q] || 0),
      ...NEGATIVE_QUESTIONS.map(q => row.neg_scores?.[q] || 0),
      `"${(row.text_start || '').replace(/"/g, '""')}"`,
      `"${(row.text_stop || '').replace(/"/g, '""')}"`,
      `"${(row.text_continue || '').replace(/"/g, '""')}"`
    ];
    csvRows.push(values.join(","));
  });
  
  const csvString = "\uFEFF" + csvRows.join("\n");
  const blob = new Blob([csvString], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = `ksi_eval_v2_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
