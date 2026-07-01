import { fsGet, fsSet } from "./store";

const today = () => new Date().toISOString().slice(0, 10);

// ── DEFAULT PROGRESS SHAPE ──────────────────────────────────────────────────
function emptyProgress() {
  return {
    totalAttempted: 0,   // every attempt (1st + 2nd tries) counts
    totalCorrect: 0,     // only final-locked correct results
    totalWrong: 0,       // only final-locked wrong results
    totalScore: 0,       // sum of points (fill +1, hindi +2, writing 0-5)
    dailyStats: {},      // { "2026-07-01": { attempted, correct, wrong } }
    levelStats: {},      // { Beginner: { attempted, correct, wrong } } -> "attempted" here = locked questions count
    lockedQuestions: {}, // { "<mode>_<level>_<questionId>": { attempts: 1|2, correct: bool, locked: bool } }
  };
}

export async function getProgress(uid) {
  const p = await fsGet("progress", uid);
  return p ? { ...emptyProgress(), ...p } : emptyProgress();
}

export function getTodayStats(progress) {
  return progress?.dailyStats?.[today()] || { attempted: 0, correct: 0, wrong: 0 };
}

// Check if a question is already locked (answered correctly OR used both attempts)
export function getQuestionState(progress, mode, level, questionId) {
  const key = `${mode}_${level}_${questionId}`;
  return progress?.lockedQuestions?.[key] || { attempts: 0, correct: false, locked: false };
}

// ── RECORD AN ATTEMPT ────────────────────────────────────────────────────────
// mode: "fill" | "hindi" | "writing"
// Returns: { progress, locked, showHint, attemptsUsed }
export async function recordAttempt(uid, mode, level, questionId, isCorrect, points = 0) {
  const p = await getProgress(uid);
  const key = `${mode}_${level}_${questionId}`;
  const existing = p.lockedQuestions[key] || { attempts: 0, correct: false, locked: false };

  // Already locked — ignore further attempts (safety net)
  if (existing.locked) {
    return { progress: p, locked: true, showHint: existing.attempts >= 2 && !existing.correct, attemptsUsed: existing.attempts };
  }

  const newAttemptCount = existing.attempts + 1;
  const willLock = isCorrect || newAttemptCount >= 2;

  // totalAttempted / todayAttempted — every single attempt counts (1st and 2nd)
  p.totalAttempted += 1;
  const t = today();
  if (!p.dailyStats[t]) p.dailyStats[t] = { attempted: 0, correct: 0, wrong: 0 };
  p.dailyStats[t].attempted += 1;

  // Only when the question becomes locked do we record the FINAL correct/wrong + score + level stats
  if (willLock) {
    if (isCorrect) {
      p.totalCorrect += 1;
      p.dailyStats[t].correct += 1;
      p.totalScore += points;
    } else {
      p.totalWrong += 1;
      p.dailyStats[t].wrong += 1;
    }

    if (!p.levelStats[level]) p.levelStats[level] = { attempted: 0, correct: 0, wrong: 0 };
    p.levelStats[level].attempted += 1;
    if (isCorrect) p.levelStats[level].correct += 1;
    else p.levelStats[level].wrong += 1;
  }

  p.lockedQuestions[key] = { attempts: newAttemptCount, correct: isCorrect, locked: willLock };

  await fsSet("progress", uid, p);

  // Hint shows ONLY when both attempts were used and the final result is still wrong
  const showHint = willLock && !isCorrect && newAttemptCount >= 2;

  return { progress: p, locked: willLock, showHint, attemptsUsed: newAttemptCount };
}

// ── WRITING: AI gives 0-5 score directly, no lock/attempt concept ───────────
export async function recordWritingSubmission(uid, level, aiScore) {
  const p = await getProgress(uid);
  const t = today();

  p.totalAttempted += 1;
  p.totalScore += aiScore;

  if (!p.dailyStats[t]) p.dailyStats[t] = { attempted: 0, correct: 0, wrong: 0 };
  p.dailyStats[t].attempted += 1;
  if (aiScore >= 3) p.dailyStats[t].correct += 1; else p.dailyStats[t].wrong += 1;

  if (!p.levelStats[level]) p.levelStats[level] = { attempted: 0, correct: 0, wrong: 0 };
  p.levelStats[level].attempted += 1;
  if (aiScore >= 3) p.levelStats[level].correct += 1; else p.levelStats[level].wrong += 1;

  await fsSet("progress", uid, p);
  return p;
}
