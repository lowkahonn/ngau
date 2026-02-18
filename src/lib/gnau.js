const VALID_RANKS = new Set(["A", "2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K"]);
const VALID_SUITS = new Set(["S", "H", "D", "C"]);
const SUIT_SYMBOLS = {
  "♠": "S",
  "♥": "H",
  "♦": "D",
  "♣": "C"
};

function compareTuple(a, b) {
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i += 1) {
    const av = a[i] ?? 0;
    const bv = b[i] ?? 0;
    if (av > bv) return 1;
    if (av < bv) return -1;
  }
  return 0;
}

function combinationsOf2(indices) {
  const out = [];
  for (let i = 0; i < indices.length - 1; i += 1) {
    for (let j = i + 1; j < indices.length; j += 1) {
      out.push([indices[i], indices[j]]);
    }
  }
  return out;
}

export function sumValue(rank) {
  if (rank === "A") return 1;
  if ("TJQK".includes(rank)) return 10;
  return Number(rank);
}

export function rankStrength(rank) {
  if (rank === "A") return 1;
  if ("23456789".includes(rank)) return Number(rank);
  return { T: 10, J: 11, Q: 12, K: 13 }[rank];
}

function normalizeToken(raw) {
  let t = raw.trim().toUpperCase();
  if (!t) return "";

  if (t.length >= 2 && SUIT_SYMBOLS[t.at(-1)]) {
    t = `${t.slice(0, -1)}${SUIT_SYMBOLS[t.at(-1)]}`;
  }

  if (t === "10") return "T";
  if (t.length === 3 && t.startsWith("10") && VALID_SUITS.has(t[2])) {
    return `T${t[2]}`;
  }

  return t;
}

export function parseCards(input) {
  const tokens = input
    .split(/\s+/)
    .map(normalizeToken)
    .filter(Boolean);

  if (tokens.length !== 5) {
    throw new Error("請輸入剛好 5 張牌，用空格分開，例如：AS 3 6 8 K");
  }

  return tokens.map((token) => {
    if (token.length === 2 && VALID_RANKS.has(token[0]) && VALID_SUITS.has(token[1])) {
      const rank = token[0];
      return {
        rank,
        suit: rank === "A" ? token[1] : "",
        faceRank: rank
      };
    }

    if (VALID_RANKS.has(token)) {
      return {
        rank: token,
        suit: "",
        faceRank: token
      };
    }

    throw new Error(`不合法牌面：${token}（只允許 A23456789TJQK 或 10）`);
  });
}

export function isFiveFace(cards) {
  return cards.every((card) => "JQK".includes(card.rank));
}

function isSpadeAce(card) {
  return card.rank === "A" && card.suit === "S";
}

export function pointHand(pointCards) {
  const [a, b] = pointCards;
  const kicker = Math.max(rankStrength(a.rank), rankStrength(b.rank));

  if ((isSpadeAce(a) && "JQK".includes(b.rank)) || (isSpadeAce(b) && "JQK".includes(a.rank))) {
    return { multiplier: 7, points: 1, name: "牛冬菇", kicker };
  }

  if (a.faceRank === b.faceRank) {
    const points = rankStrength(a.faceRank);
    return { multiplier: 3, points, name: "孖寶", kicker: points };
  }

  const total = sumValue(a.rank) + sumValue(b.rank);
  const points = total % 10;
  if (points === 0) {
    return { multiplier: 2, points: 10, name: "10點", kicker };
  }

  return { multiplier: 1, points, name: `${points}點`, kicker };
}

export function baseOk(baseCards) {
  const total = baseCards.reduce((sum, card) => sum + sumValue(card.rank), 0);
  return total % 10 === 0;
}

export function allSwappedVariants(cards) {
  const indexes = cards
    .map((card, index) => ({ card, index }))
    .filter(({ card }) => card.rank === "3" || card.rank === "6")
    .map(({ index }) => index);

  const variants = [];
  const count = 1 << indexes.length;

  for (let mask = 0; mask < count; mask += 1) {
    const variant = cards.map((card) => ({ ...card }));
    for (let bit = 0; bit < indexes.length; bit += 1) {
      if ((mask >> bit) & 1) {
        const i = indexes[bit];
        const current = variant[i];
        variant[i] = {
          ...current,
          rank: current.rank === "3" ? "6" : "3"
        };
      }
    }
    variants.push(variant);
  }

  return variants;
}

export function bestArrangementForFixedCards(cards) {
  let best = null;

  if (isFiveFace(cards)) {
    const kicker = Math.max(...cards.map((card) => rankStrength(card.rank)));
    best = {
      key: [5, 0, kicker],
      multiplier: 5,
      points: 0,
      name: "五張公",
      baseCards: [...cards],
      pointCards: []
    };
  }

  const pointPairs = combinationsOf2([0, 1, 2, 3, 4]);
  for (const [i, j] of pointPairs) {
    const pointCards = [cards[i], cards[j]];
    const baseCards = cards.filter((_, index) => index !== i && index !== j);
    if (!baseOk(baseCards)) continue;

    const outcome = pointHand(pointCards);
    const key = [outcome.multiplier, outcome.points, outcome.kicker];

    if (!best || compareTuple(key, best.key) > 0) {
      best = {
        key,
        multiplier: outcome.multiplier,
        points: outcome.points,
        name: outcome.name,
        baseCards,
        pointCards
      };
    }
  }

  return best;
}

export function bestOverall(cards) {
  let best = null;

  for (const variant of allSwappedVariants(cards)) {
    const candidate = bestArrangementForFixedCards(variant);
    if (!candidate) continue;

    if (!best || compareTuple(candidate.key, best.key) > 0) {
      best = {
        ...candidate,
        variantCards: variant
      };
    }
  }

  return best;
}

export function bestAssumedNiuDongGu(cards) {
  let best = null;

  for (const variant of allSwappedVariants(cards)) {
    const pointPairs = combinationsOf2([0, 1, 2, 3, 4]);

    for (const [i, j] of pointPairs) {
      const pointCards = [variant[i], variant[j]];
      const baseCards = variant.filter((_, index) => index !== i && index !== j);
      if (!baseOk(baseCards)) continue;

      const [a, b] = pointCards;
      let faceCard = null;
      if (a.faceRank === "A" && "JQK".includes(b.rank)) faceCard = b;
      if (b.faceRank === "A" && "JQK".includes(a.rank)) faceCard = a;
      if (!faceCard) continue;

      const baseStrength = [...baseCards]
        .map((card) => rankStrength(card.rank))
        .sort((x, y) => y - x);

      const key = [rankStrength(faceCard.rank), ...baseStrength];

      if (!best || compareTuple(key, best.key) > 0) {
        best = {
          key,
          variantCards: variant,
          baseCards,
          pointCards,
          multiplier: 7,
          points: 1,
          name: "牛冬菇"
        };
      }
    }
  }

  return best;
}

export function formatCard(card, options = {}) {
  const { useFace = false, assumeSpadeAce = false } = options;
  let rank = useFace ? card.faceRank : card.rank;
  if (rank === "T") rank = "10";

  if (rank === "A") {
    if (assumeSpadeAce) return "AS";
    if (card.suit) return `A${card.suit}`;
  }

  return rank;
}

export function formatCards(cards, options = {}) {
  return cards.map((card) => formatCard(card, options));
}

export function analyzeHand(input) {
  const cards = parseCards(input);
  const best = bestOverall(cards);

  if (!best) {
    return {
      cards,
      best: null,
      assumed: null,
      hasAce: cards.some((card) => card.faceRank === "A")
    };
  }

  const hasAce = cards.some((card) => card.faceRank === "A");
  const assumed = hasAce ? bestAssumedNiuDongGu(cards) : null;

  return {
    cards,
    best,
    assumed,
    hasAce
  };
}

export const suitText = {
  S: "♠",
  H: "♥",
  D: "♦",
  C: "♣"
};
