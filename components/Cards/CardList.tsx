import { useEffect, useState } from "react";
import { Card as CardType, CardListResponse } from "@/types/cards";
import { getCards } from "@/utils/api/cardsApi";
import { getRandomColor } from "@/utils/TodoForm";
import useModal from "@/hooks/modal/useModal";
import CardDetailModal from "../UI/modal/CardModal/CardDetailModal";

import Card from "./components/Card";
import UpdateTodoModal from "../UI/modal/UpdateTodoModal";

interface CardListProps {
  columnId: number;
  dashboardId: number;
}

const CardList: React.FC<CardListProps> = ({ columnId, dashboardId }) => {
  const [cards, setCards] = useState<CardType[]>([]);
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
  const {
    isOpen: isDetailOpen,
    openModal: openDetailModal,
    closeModal: closeDetailModal,
  } = useModal();
  const {
    isOpen: isUpdateOpen,
    openModal: openUpdateModal,
    closeModal: closeUpdateModal,
  } = useModal();
  const [tagColors, setTagColors] = useState<Record<string, string>>({});

  const handleCardClick = (card: CardType) => {
    setSelectedCard(card);
    openDetailModal();
  };

  const handleEditClick = () => {
    closeDetailModal();
    openUpdateModal();
  };

  const handleDeleteClick = () => {
    closeDetailModal();

    // 카드 삭제 로직 구현
  };

  useEffect(() => {
    const newTagColors: Record<string, string> = {};
    cards.forEach((card) => {
      card.tags.forEach((tag) => {
        if (!newTagColors[tag]) {
          newTagColors[tag] = getRandomColor();
        }
      });
    });
    setTagColors(newTagColors);
  }, [cards]);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const cardData: CardListResponse = await getCards({ columnId });
        setCards(cardData.cards);
      } catch (err) {
        console.error("Error fetching cards:", err);
      }
    };

    if (columnId) {
      fetchCards();
    }
  }, [columnId]);

  return (
    <div className="mt-[10px]">
      {cards.map((card) => (
        <Card
          key={card.id}
          card={card}
          tagColors={tagColors}
          onClick={() => handleCardClick(card)}
          dashboardId={dashboardId}
        />
      ))}
      {selectedCard && (
        <>
          <CardDetailModal
            card={selectedCard}
            isOpen={isDetailOpen}
            onClose={closeDetailModal}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
          />
          <UpdateTodoModal
            cardId={selectedCard.id}
            isOpen={isUpdateOpen}
            onClose={closeUpdateModal}
            dashboardId={dashboardId}
          />
        </>
      )}
    </div>
  );
};

export default CardList;
