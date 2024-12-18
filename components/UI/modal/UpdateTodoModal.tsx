import UpdateTodoForm from "@/components/DashBoard/todo/UpdateTodoForm";
import TodoModalLayout from "@/components/Layout/TodoModalLayout";
import { TodoModalProps } from "@/types/dashboards";

const UpdateTodoModal = ({
  cardId,
  isOpen,
  onClose,
  onUpdateCard,
  onRefresh,
}: TodoModalProps) => {
  if (!isOpen) return null;

  return (
    <TodoModalLayout text="할 일 수정">
      <UpdateTodoForm
        cardId={cardId}
        onClose={onClose}
        onUpdateCard={onUpdateCard}
        onRefresh={onRefresh}
      />
    </TodoModalLayout>
  );
};

export default UpdateTodoModal;
