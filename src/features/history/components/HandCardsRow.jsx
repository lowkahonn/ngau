import PokerCard from "../../../components/PokerCard";

export default function HandCardsRow({ cards, recordId }) {
  return (
    <div className="mt-2 flex justify-center gap-1">
      {cards.map((card, cardIndex) => (
        <PokerCard key={`${recordId}-${card}-${cardIndex}`} value={card} size="tiny" />
      ))}
    </div>
  );
}
