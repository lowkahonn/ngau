from itertools import combinations
from dataclasses import dataclass

# 輸入允許：A 2 3 4 5 6 7 8 9 T/10 J Q K（不分大小寫）
VALID = set(list("A23456789TJQK"))
VALID_SUITS = {"S", "H", "D", "C"}
SUIT_SYMBOLS = {"♠": "S", "♥": "H", "♦": "D", "♣": "C"}

# 用於「底要 10 的倍數」與一般點數加總時的數值（T/J/Q/K 都當 10）
def sum_value(rank: str) -> int:
    r = rank.upper()
    if r == "A":
        return 1
    if r in "TJQK":
        return 10
    return int(r)

# 用於「比大小」的牌面順序：A < 2 < ... < 9 < T < J < Q < K
# 同時符合你說的：K>Q>J>T
def rank_strength(rank: str) -> int:
    r = rank.upper()
    if r == "A":
        return 1
    if r in "23456789":
        return int(r)
    return {"T": 10, "J": 11, "Q": 12, "K": 13}[r]

@dataclass(frozen=True)
class Card:
    rank: str
    suit: str = ""
    face_rank: str = ""

    def __post_init__(self):
        # face_rank 代表原始牌面，用於「孖寶」按牌面點數判定
        if not self.face_rank:
            object.__setattr__(self, "face_rank", self.rank)

    @property
    def is_spade_ace(self) -> bool:
        return self.rank == "A" and self.suit == "S"

    def __str__(self) -> str:
        if self.rank == "A" and self.suit:
            return f"{self.rank}{self.suit}"
        return self.rank

def parse_cards(line: str):
    tokens = [t.strip().upper() for t in line.split() if t.strip()]
    if len(tokens) != 5:
        raise ValueError("請輸入剛好 5 張牌面，用空格分開，例如：AS 3 6 8 K")

    cards = []
    for raw in tokens:
        t = raw
        # 接受花色符號，例如 A♠ / 10♠
        if len(t) >= 2 and t[-1] in SUIT_SYMBOLS:
            t = t[:-1] + SUIT_SYMBOLS[t[-1]]

        # 接受 10 作為 T 的別名，例如 10 / 10S
        if t == "10":
            t = "T"
        elif len(t) == 3 and t.startswith("10") and t[2] in VALID_SUITS:
            t = "T" + t[2]

        # 支援一般撲克牌格式：<牌面><花色>，但只有 A 的花色會影響規則
        if len(t) == 2 and t[0] in VALID and t[1] in VALID_SUITS:
            rank, suit = t[0], t[1]
            cards.append(Card(rank, suit if rank == "A" else "", rank))
            continue

        if t in VALID:
            # A 不帶花色時視為非黑桃 A（不觸發牛冬菇）
            cards.append(Card(t, "", t))
            continue

        raise ValueError(
            f"不合法牌面：{raw}（只允許 A23456789TJQK 或 10，A 可加花色如 AS/AH/AD/AC）"
        )

    return cards

def is_five_face(cards):
    # 五張公：5張都 J/Q/K
    return all(c.rank in "JQK" for c in cards)

def point_hand(point_cards):
    """
    回傳：
    (multiplier, points, name, kicker)
    kicker 用於最後同倍數同點數時的比大小（取點牌2張最大牌面）
    """
    a, b = point_cards
    ra, rb = a.rank, b.rank

    kicker = max(rank_strength(ra), rank_strength(rb))

    # 牛冬菇：黑桃A + (J/Q/K) -> 7倍，點數=1
    if (a.is_spade_ace and rb in "JQK") or (b.is_spade_ace and ra in "JQK"):
        return (7, 1, "牛冬菇", kicker)

    # 孖寶：按「原始牌面」判定與計點（3/6 互換不改變 face_rank）
    if a.face_rank == b.face_rank:
        pts = rank_strength(a.face_rank)
        # 孖寶比大小也按原始牌面，不受 3/6 互換後顯示值影響
        return (3, pts, "孖寶", pts)

    # 普通：兩張 sum_value 相加取個位數；0 視為 10點 -> 2倍
    s = sum_value(ra) + sum_value(rb)
    p = s % 10
    if p == 0:
        return (2, 10, "10點", kicker)
    return (1, p, f"{p}點", kicker)

def base_ok(base_cards):
    # 底：3張的 sum_value 總和必須是 10 的倍數
    return (sum(sum_value(c.rank) for c in base_cards) % 10) == 0

def all_swapped_variants(cards):
    """
    對所有 3/6 牌作獨立互換，枚舉所有可能的 5 張牌版本。
    最多 2^5=32 種（實際只對 3/6 的數量做 2^k）
    """
    idx = [i for i, c in enumerate(cards) if c.rank in ("3", "6")]
    k = len(idx)
    variants = []

    for mask in range(1 << k):
        new = cards[:]
        for bit in range(k):
            i = idx[bit]
            r = new[i].rank
            if (mask >> bit) & 1:
                # 只互換當前數值 rank；face_rank 保留原始牌面
                new[i] = Card("6" if r == "3" else "3", new[i].suit, new[i].face_rank)
        variants.append(new)
    return variants

def best_arrangement_for_fixed_cards(cards):
    """
    在牌面已固定（3/6已決定）的情況下，找最佳：
    比較 key = (multiplier, points, kicker)
    """
    best = None  # (key, mult, pts, name, base_cards, point_cards)

    # 五張公：5倍
    if is_five_face(cards):
        # 五張公通常不再分底/點，仍給 kicker（最大牌面）
        kicker = max(rank_strength(c.rank) for c in cards)
        key = (5, 0, kicker)
        best = (key, 5, 0, "五張公", tuple(cards), tuple())

    # 枚舉所有 2 張做點數
    for p_idx in combinations(range(5), 2):
        point_cards = (cards[p_idx[0]], cards[p_idx[1]])
        base_cards = tuple(cards[i] for i in range(5) if i not in p_idx)

        if not base_ok(base_cards):
            continue

        mult, pts, name, kicker = point_hand(point_cards)
        key = (mult, pts, kicker)

        if best is None or key > best[0]:
            best = (key, mult, pts, name, base_cards, point_cards)

    return best

def best_overall(cards):
    """
    先枚舉所有 3/6 互換版本，再在每個版本找最佳排法，取全域最佳。
    """
    best = None
    for variant in all_swapped_variants(cards):
        cand = best_arrangement_for_fixed_cards(variant)
        if cand is None:
            continue
        # best[0] 是牌組，best[1] 才是比較用 key
        if best is None or cand[0] > best[1]:
            best = (variant, *cand)  # (variant_cards, key, mult, pts, name, base, point)
    return best

def best_assumed_niudonggu(cards):
    """
    若手牌中有 A，額外提供一個「假設 A 可作黑桃A」的參考排法：
    - 只考慮點牌為 A + (J/Q/K)
    - 仍需滿足底為 10 的倍數
    - 優先選擇最大的點牌（K > Q > J）
    """
    best = None  # (key, variant_cards, base_cards, point_cards)
    for variant in all_swapped_variants(cards):
        for p_idx in combinations(range(5), 2):
            point_cards = (variant[p_idx[0]], variant[p_idx[1]])
            base_cards = tuple(variant[i] for i in range(5) if i not in p_idx)
            if not base_ok(base_cards):
                continue

            a, b = point_cards
            if a.face_rank == "A" and b.rank in "JQK":
                face_card = b
            elif b.face_rank == "A" and a.rank in "JQK":
                face_card = a
            else:
                continue

            # 主排序：點牌大小（K>Q>J）；次排序：底牌強度，確保穩定輸出
            base_strength = tuple(
                sorted((rank_strength(c.rank) for c in base_cards), reverse=True)
            )
            key = (rank_strength(face_card.rank), base_strength)
            if best is None or key > best[0]:
                best = (key, tuple(variant), base_cards, point_cards)
    return best

def card_text(card: Card, use_face: bool = False, assume_spade_ace: bool = False) -> str:
    rank = card.face_rank if use_face else card.rank
    if rank == "T":
        rank = "10"
    if rank == "A":
        if assume_spade_ace:
            return "AS"
        if card.suit:
            return f"A{card.suit}"
    return rank

def fmt(cards, use_face: bool = False, assume_spade_ace: bool = False):
    return " ".join(
        card_text(c, use_face=use_face, assume_spade_ace=assume_spade_ace) for c in cards
    )

def main():
    print("輸入 5 張牌面（可選花色），例如：AS 3 6 8 K")
    print("牌面只允許：A 2 3 4 5 6 7 8 9 T(或10) J Q K")
    print("花色只對 A 有效：AS/AH/AD/AC（只有 AS 可觸發牛冬菇）")
    print("輸入 q 退出")

    while True:
        line = input("\n牌組> ").strip()
        if not line:
            continue
        if line.lower() in ("q", "quit", "exit"):
            break

        try:
            cards = parse_cards(line)
            result = best_overall(cards)

            if result is None:
                print("找不到任何合法排法（無法排出底為 10 的倍數）。")
                continue

            variant_cards, key, mult, pts, name, base_cards, point_cards = result

            print("\n✅ 最佳結果")
            print(f"採用牌組（含3/6互換後）：{fmt(variant_cards)}")
            if name == "五張公":
                print(f"牌型：{name}｜倍數：{mult}倍")
            else:
                print(f"底（3張）：{fmt(base_cards, use_face=True)}")
                print(f"點（2張）：{fmt(point_cards, use_face=True)}")
                print(f"牌型：{name}｜點數：{pts}｜倍數：{mult}倍")

            if any(c.face_rank == "A" for c in cards):
                assumed = best_assumed_niudonggu(cards)
                print("\nA 假設排法（A 當黑桃A，優先最大點牌）")
                if assumed is None:
                    print("無法排出牛冬菇（需 A + J/Q/K 且底為10的倍數）")
                else:
                    _, assumed_variant, assumed_base, assumed_point = assumed
                    print(f"採用牌組（含3/6互換後）：{fmt(assumed_variant)}")
                    print(
                        f"底（3張）：{fmt(assumed_base, use_face=True, assume_spade_ace=True)}"
                    )
                    print(
                        f"點（2張）：{fmt(assumed_point, use_face=True, assume_spade_ace=True)}"
                    )
                    print("牌型：牛冬菇｜點數：1｜倍數：7倍")

        except Exception as e:
            print(f"輸入有誤：{e}")

if __name__ == "__main__":
    main()
