import unittest
import subprocess
import sys

from main import Card, best_assumed_niudonggu, best_overall, parse_cards, point_hand


class GnauRulesTest(unittest.TestCase):
    def _solve(self, hand: str):
        cards = parse_cards(hand)
        result = best_overall(cards)
        self.assertIsNotNone(result)
        _, _, mult, pts, name, base_cards, point_cards = result
        return mult, pts, name, base_cards, point_cards

    def test_spade_ace_rule_in_point_hand(self):
        # 非黑桃 A + K：普通 1 點
        self.assertEqual(
            point_hand((Card("A", "H", "A"), Card("K", "", "K"))),
            (1, 1, "1點", 13),
        )
        # 黑桃 A + K：牛冬菇
        self.assertEqual(
            point_hand((Card("A", "S", "A"), Card("K", "", "K"))),
            (7, 1, "牛冬菇", 13),
        )

    def test_double_uses_face_value_not_swapped_rank(self):
        # 兩張目前都顯示為 6，但原牌面是 3 / 6，不算孖寶
        self.assertEqual(
            point_hand((Card("6", "", "3"), Card("6", "", "6"))),
            (1, 2, "2點", 6),
        )

    def test_arrangement_for_3_3_3_6_A(self):
        mult, pts, name, base_cards, point_cards = self._solve("3 3 3 6 A")
        self.assertEqual((mult, pts, name), (3, 3, "孖寶"))
        self.assertEqual([c.face_rank for c in base_cards], ["3", "6", "A"])
        self.assertEqual([c.face_rank for c in point_cards], ["3", "3"])

    def test_arrangement_for_3_3_6_6_A(self):
        mult, pts, name, base_cards, point_cards = self._solve("3 3 6 6 A")
        self.assertEqual((mult, pts, name), (3, 6, "孖寶"))
        self.assertEqual([c.face_rank for c in base_cards], ["3", "3", "A"])
        self.assertEqual([c.face_rank for c in point_cards], ["6", "6"])

    def test_cli_output_for_3_3_6_6_A(self):
        proc = subprocess.run(
            [sys.executable, "main.py"],
            input="3 3 6 6 A\nq\n",
            text=True,
            capture_output=True,
            check=True,
        )
        self.assertIn("底（3張）：3 3 A", proc.stdout)
        self.assertIn("點（2張）：6 6", proc.stdout)
        self.assertIn("無法排出牛冬菇", proc.stdout)

    def test_assumed_niudonggu_prefers_biggest_point_cards(self):
        result = best_assumed_niudonggu(parse_cards("A 3 6 8 K"))
        self.assertIsNotNone(result)
        _, _, base_cards, point_cards = result
        self.assertEqual([c.face_rank for c in base_cards], ["3", "6", "8"])
        self.assertEqual([c.face_rank for c in point_cards], ["A", "K"])

    def test_cli_output_includes_assumed_niudonggu(self):
        proc = subprocess.run(
            [sys.executable, "main.py"],
            input="A 3 6 8 K\nq\n",
            text=True,
            capture_output=True,
            check=True,
        )
        self.assertIn("A 假設排法", proc.stdout)
        self.assertIn("點（2張）：AS K", proc.stdout)

    def test_parse_allows_10_alias(self):
        cards = parse_cards("10 J Q K A")
        self.assertEqual([c.rank for c in cards], ["T", "J", "Q", "K", "A"])

    def test_cli_output_uses_10_not_t(self):
        proc = subprocess.run(
            [sys.executable, "main.py"],
            input="10 J Q K A\nq\n",
            text=True,
            capture_output=True,
            check=True,
        )
        self.assertIn("採用牌組（含3/6互換後）：10 J Q K A", proc.stdout)
        self.assertNotIn("採用牌組（含3/6互換後）：T J Q K A", proc.stdout)


if __name__ == "__main__":
    unittest.main()
