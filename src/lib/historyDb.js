const DB_NAME = "gnau-history-db";
const DB_VERSION = 1;
const STORE_NAME = "hands";
const SESSION_BREAK_MS = 60 * 60 * 1000;

export const NO_RESULT_NAME = "NO_RESULT";
export const HAND_TYPE_NIU_DONG_GU = "NIU_DONG_GU";
export const HAND_TYPE_FIVE_FACE = "FIVE_FACE";
export const HAND_TYPE_PAIR = "PAIR";
export const HAND_TYPE_POINTS_10 = "POINTS_10";
export const HAND_TYPE_POINTS_OTHER = "POINTS_OTHER";

let openDbPromise = null;

function requestToPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB request failed"));
  });
}

function transactionToPromise(transaction) {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error("IndexedDB transaction failed"));
    transaction.onabort = () => reject(transaction.error ?? new Error("IndexedDB transaction aborted"));
  });
}

function compareTuple(a = [], b = []) {
  const len = Math.max(a.length, b.length);
  for (let index = 0; index < len; index += 1) {
    const av = a[index] ?? 0;
    const bv = b[index] ?? 0;
    if (av > bv) return 1;
    if (av < bv) return -1;
  }
  return 0;
}

function handTypeSortRank(typeKey) {
  switch (typeKey) {
    case HAND_TYPE_NIU_DONG_GU:
      return 0;
    case HAND_TYPE_FIVE_FACE:
      return 1;
    case HAND_TYPE_PAIR:
      return 2;
    case HAND_TYPE_POINTS_10:
      return 3;
    case HAND_TYPE_POINTS_OTHER:
      return 4;
    case NO_RESULT_NAME:
      return 5;
    default:
      return 6;
  }
}

export function toHandTypeBucket(handName) {
  if (!handName || handName === NO_RESULT_NAME) return NO_RESULT_NAME;
  if (handName === "牛冬菇") return HAND_TYPE_NIU_DONG_GU;
  if (handName === "五張公") return HAND_TYPE_FIVE_FACE;
  if (handName === "孖寶") return HAND_TYPE_PAIR;
  if (handName === "10點") return HAND_TYPE_POINTS_10;
  if (/^\d+點$/.test(handName)) return HAND_TYPE_POINTS_OTHER;
  return handName;
}

function toLocalDayKey(timestamp) {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function normalizeRecord(record) {
  return {
    id: String(record.id),
    createdAt: Number(record.createdAt) || Date.now(),
    dayKey: record.dayKey || toLocalDayKey(record.createdAt),
    sessionId: String(record.sessionId || "unknown"),
    cards: Array.isArray(record.cards) ? record.cards : [],
    handName: record.handName || NO_RESULT_NAME,
    strengthKey: Array.isArray(record.strengthKey) ? record.strengthKey : [0, 0, 0],
    best: record.best ?? null
  };
}

function openHistoryDb() {
  if (openDbPromise) return openDbPromise;

  openDbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("byCreatedAt", "createdAt");
        store.createIndex("byDayKey", "dayKey");
        store.createIndex("bySessionId", "sessionId");
        store.createIndex("byDaySession", ["dayKey", "sessionId"]);
        store.createIndex("byHandName", "handName");
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Failed to open IndexedDB"));
  });

  return openDbPromise;
}

export function createSessionId() {
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createHistoryRecord({ cards, best, sessionId, createdAt = Date.now() }) {
  return normalizeRecord({
    id: `hand-${createdAt}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt,
    dayKey: toLocalDayKey(createdAt),
    sessionId,
    cards,
    handName: best?.name ?? NO_RESULT_NAME,
    strengthKey: Array.isArray(best?.key) ? best.key : [0, 0, 0],
    best: best
      ? {
          name: best.name,
          points: best.points,
          multiplier: best.multiplier,
          key: Array.isArray(best.key) ? best.key : [0, 0, 0]
        }
      : null
  });
}

export async function addHistoryRecord(record) {
  const db = await openHistoryDb();
  const transaction = db.transaction(STORE_NAME, "readwrite");
  const store = transaction.objectStore(STORE_NAME);
  store.put(normalizeRecord(record));
  await transactionToPromise(transaction);
}

export async function listHistoryRecords(filters = {}) {
  const { dayKey, sessionId, limit } = filters;
  const db = await openHistoryDb();
  const transaction = db.transaction(STORE_NAME, "readonly");
  const store = transaction.objectStore(STORE_NAME);
  const all = await requestToPromise(store.getAll());
  await transactionToPromise(transaction);

  let records = all.map(normalizeRecord);
  if (dayKey) {
    records = records.filter((record) => record.dayKey === dayKey);
  }
  if (sessionId) {
    records = records.filter((record) => record.sessionId === sessionId);
  }

  records.sort((a, b) => b.createdAt - a.createdAt);

  if (typeof limit === "number") {
    return records.slice(0, limit);
  }
  return records;
}

function buildDaySessionGroups(records) {
  const sessions = buildTimeSessions(records);
  const dayMap = new Map();

  for (const session of sessions) {
    if (!dayMap.has(session.dayKey)) {
      dayMap.set(session.dayKey, []);
    }
    dayMap.get(session.dayKey).push({
      ...session,
      hands: [...session.hands].sort((a, b) => b.createdAt - a.createdAt)
    });
  }

  const groups = [];
  const sortedDays = [...dayMap.keys()].sort((a, b) => b.localeCompare(a));

  for (const dayKey of sortedDays) {
    const daySessions = dayMap.get(dayKey).sort((a, b) => b.startAt - a.startAt);
    groups.push({ dayKey, sessions: daySessions });
  }

  return groups;
}

function buildTimeSessions(records) {
  const sorted = [...records].sort((a, b) => a.createdAt - b.createdAt);
  const sessions = [];
  let current = null;

  for (const record of sorted) {
    if (!current) {
      current = {
        sessionId: `period-${record.createdAt}`,
        dayKey: record.dayKey,
        startAt: record.createdAt,
        endAt: record.createdAt,
        lastAt: record.createdAt,
        hands: [record]
      };
      continue;
    }

    const isDayChanged = current.dayKey !== record.dayKey;
    const gap = record.createdAt - current.lastAt;
    const shouldStartNewSession = isDayChanged || gap >= SESSION_BREAK_MS;

    if (shouldStartNewSession) {
      sessions.push(current);
      current = {
        sessionId: `period-${record.createdAt}`,
        dayKey: record.dayKey,
        startAt: record.createdAt,
        endAt: record.createdAt,
        lastAt: record.createdAt,
        hands: [record]
      };
      continue;
    }

    current.hands.push(record);
    current.endAt = record.createdAt;
    current.lastAt = record.createdAt;
  }

  if (current) {
    sessions.push(current);
  }

  return sessions.map(({ lastAt, ...session }) => session);
}

function buildHandTypeCounts(records) {
  const counts = new Map();
  for (const record of records) {
    const key = toHandTypeBucket(record.handName || NO_RESULT_NAME);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => {
      const aRank = handTypeSortRank(a.name);
      const bRank = handTypeSortRank(b.name);
      if (aRank !== bRank) return aRank - bRank;
      if (a.count !== b.count) return b.count - a.count;
      return a.name.localeCompare(b.name);
    });
}

function buildBiggestHands(records, limit = 5) {
  return records
    .filter((record) => Boolean(record.best))
    .sort((a, b) => {
      const strength = compareTuple(a.strengthKey, b.strengthKey);
      if (strength !== 0) return -strength;
      return b.createdAt - a.createdAt;
    })
    .slice(0, limit);
}

function getAbsoluteBiggestInfo(records) {
  const scored = records.filter((record) => Boolean(record.best));
  if (scored.length === 0) {
    return {
      topKey: null,
      topRecords: [],
      topHandNames: new Set()
    };
  }

  let topKey = scored[0].strengthKey;
  for (const record of scored) {
    if (compareTuple(record.strengthKey, topKey) > 0) {
      topKey = record.strengthKey;
    }
  }

  const topRecords = scored.filter((record) => compareTuple(record.strengthKey, topKey) === 0).sort((a, b) => b.createdAt - a.createdAt);
  const topHandNames = new Set(topRecords.map((record) => record.handName));

  return {
    topKey,
    topRecords,
    topHandNames
  };
}

export function queryDaySessionGroups(records) {
  return buildDaySessionGroups(records);
}

export function queryHandTypeCounts(records) {
  return buildHandTypeCounts(records);
}

export function queryBiggestHands(records, limit = 5) {
  return buildBiggestHands(records, limit);
}

export function queryAbsoluteBiggestHands(records, limit = 3) {
  const { topRecords } = getAbsoluteBiggestInfo(records);
  if (typeof limit === "number") {
    return topRecords.slice(0, limit);
  }
  return topRecords;
}

export async function getHistoryOverview(sessionId, recentLimit = 3) {
  const allRecords = await listHistoryRecords();
  const history = allRecords.slice(0, recentLimit);
  const historyGroups = buildDaySessionGroups(allRecords);
  const typeCounts = buildHandTypeCounts(allRecords);
  const biggestHands = buildBiggestHands(allRecords, 5);
  const timeSessions = buildTimeSessions(allRecords);
  const latestSession = timeSessions.at(-1);
  const sessionHands = latestSession ? latestSession.hands.length : 0;

  return {
    history,
    historyGroups,
    historyStats: {
      totalHands: allRecords.length,
      sessionHands,
      typeCounts,
      biggestHands
    }
  };
}

export async function clearHistoryRecords() {
  const db = await openHistoryDb();
  const transaction = db.transaction(STORE_NAME, "readwrite");
  transaction.objectStore(STORE_NAME).clear();
  await transactionToPromise(transaction);
}
