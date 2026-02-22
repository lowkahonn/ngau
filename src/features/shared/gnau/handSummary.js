export function localizeHandName(name, language) {
  if (language === "en") {
    if (name === "五張公") return "Five Face";
    if (name === "牛冬菇") return "Niu Dong Gu";
    if (name === "孖寶") return "Pair";
    if (name === "10點") return "10 Points";
    const matched = name.match(/^(\d+)點$/);
    if (matched) return `${matched[1]} Points`;
  }
  return name;
}

export function formatDisplayPoints(best) {
  if (best.name === "孖寶") {
    if (best.points === 11) return "J";
    if (best.points === 12) return "Q";
    if (best.points === 13) return "K";
  }
  return best.points;
}

export function formatHandSummary(best, t, language) {
  const handName = localizeHandName(best.name, language);
  if (best.name === "牛冬菇" || best.name === "五張公" || /^\d+點$/.test(best.name)) {
    return t.handTypeOnly(handName);
  }
  return t.handLine(handName, formatDisplayPoints(best));
}
