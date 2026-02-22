import {
  HAND_TYPE_FIVE_FACE,
  HAND_TYPE_NIU_DONG_GU,
  HAND_TYPE_PAIR,
  HAND_TYPE_POINTS_10,
  HAND_TYPE_POINTS_OTHER,
  NO_RESULT_NAME
} from "../../../lib/historyDb";
import { localizeHandName } from "../../shared/gnau/handSummary";

export function formatHistoryTypeName(handName, t, language) {
  if (handName === NO_RESULT_NAME) return t.noResult;
  return localizeHandName(handName, language);
}

export function formatHistoryTypeCountName(typeName, t, language) {
  if (typeName === HAND_TYPE_NIU_DONG_GU) return localizeHandName("牛冬菇", language);
  if (typeName === HAND_TYPE_FIVE_FACE) return localizeHandName("五張公", language);
  if (typeName === HAND_TYPE_PAIR) return localizeHandName("孖寶", language);
  if (typeName === HAND_TYPE_POINTS_10) return t.points10;
  if (typeName === HAND_TYPE_POINTS_OTHER) return t.pointsOther;
  if (typeName === NO_RESULT_NAME) return t.noResult;
  return localizeHandName(typeName, language);
}

function getLocale(language) {
  if (language === "zh-Hans") return "zh-CN";
  if (language === "zh-Hant") return "zh-HK";
  return "en-US";
}

export function formatTime(timestamp, language) {
  return new Date(timestamp).toLocaleTimeString(getLocale(language), {
    hour: "2-digit",
    minute: "2-digit"
  });
}

export function formatSessionPeriod(session, language) {
  const start = formatTime(session.startAt, language);
  const end = formatTime(session.endAt, language);
  if (start === end) return start;
  return `${start} - ${end}`;
}
