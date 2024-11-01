import { hdMenuBtn, hdMenuBtnIcon } from "./MyDashStyle";
import { useRouter } from "next/router";
import { useAuthStore } from "@/store/authStore";
import AvatarGroup from "./AvatarGroup";
import { addInvitations } from "@/utils/api/dashboardsApi";
import { useCallback, useState } from "react";
import { useInvitationStore } from "@/store/invitationStore";
import Image from "next/image";
import useModal from "@/hooks/modal/useModal";
import Portal from "@/components/UI/modal/ModalPotal";
import OneInputModal from "../UI/modal/InputModal/OneInputModal";
import ModalAlert from "../UI/modal/ModalAlert";
import { Dashboard } from "@/types/dashboards";
import useErrorModal from "@/hooks/modal/useErrorModal";

interface MyDashSideMenuProps {
  dashboards: Dashboard[];
}

const ITEMS_PER_PAGE = 5;

const MyDashHdr: React.FC<MyDashSideMenuProps> = ({ dashboards }) => {
  const router = useRouter();
  const { dashboardsId } = router.query;
  const { user } = useAuthStore();
  const { loadInvitations } = useInvitationStore();

  const {
    isOpen: isInviteModalOpen,
    inputValue,
    openModal: openInviteModal,
    closeModal: closeInviteModal,
    handleInputChange,
    handleConfirm: handleModalConfirm,
  } = useModal();

  const {
    isOpen: isErrorModalOpen,
    errorMessage,
    handleError,
    handleClose: closeErrorModal,
  } = useErrorModal();

  const [modalMessage, setModalMessage] = useState<string>("");
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);

  const currentDashboard = dashboards.find(
    (dashboard) => dashboard.id === Number(dashboardsId)
  );
  const dashboardTitle = currentDashboard
    ? currentDashboard.title
    : "내 대시보드";
  const isMyDashboardPage = router.pathname === "/mydashboard";

  const handleConfirm = useCallback(
    async (inputValue: string) => {
      try {
        await addInvitations(Number(dashboardsId), inputValue);
        setModalMessage("초대 요청을 보냈습니다.");
        setIsMessageModalOpen(true);
        closeInviteModal();
        loadInvitations(Number(dashboardsId), 1, ITEMS_PER_PAGE);
      } catch (error) {
        handleError(error);
      }
    },
    [dashboardsId, closeInviteModal, loadInvitations, handleError]
  );

  const handleManageClick = () => {
    if (currentDashboard && !currentDashboard.createdByMe) {
      setIsMessageModalOpen(true);
      router.push(`/dashboards/${dashboardsId}`);
    } else {
      router.push(`/dashboards/${dashboardsId}/edit`);
    }
  };

  return (
    <div>
      <div className="border-b border-gray400 bg-white">
        <div className="headerWrap flex justify-between items-center w-full p-[13px_8px_13px_18px] md:px-10 md:py-[15px]">
          <h2 className="pageTitle flex-1 text-x font-bold md:text-xl lg:text-[2rem]">
            {dashboardTitle}
          </h2>
          {!isMyDashboardPage && (
            <ul className="flex gap-[6px] md:gap-4">
              <li>
                <button onClick={handleManageClick} className={hdMenuBtn}>
                  <span className={hdMenuBtnIcon}>
                    <Image
                      src="/images/icons/icon_settings.svg"
                      width={15}
                      height={15}
                      alt="관리"
                    />
                  </span>
                  관리
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={hdMenuBtn}
                  onClick={openInviteModal}
                >
                  <span className={hdMenuBtnIcon}>
                    <Image
                      src="/images/icons/icon_add_box.svg"
                      width={15}
                      height={15}
                      alt="초대하기"
                    />
                  </span>
                  초대하기
                </button>
              </li>
              <li>
                <AvatarGroup />
              </li>
            </ul>
          )}
          <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray400 md:ml-8 md:pl-8 lg:ml-9 lg:pl-9">
            <span className="overflow-hidden relative w-[34px] h-[34px] rounded-full bg-slate-500">
              {user?.profileImageUrl ? (
                <Image
                  className="object-cover"
                  src={user.profileImageUrl}
                  fill
                  alt="Profile Image"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              ) : (
                <Image
                  className="object-cover"
                  src="https://via.placeholder.com/34"
                  fill
                  alt="Default Profile"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              )}
            </span>
            <p className="hidden md:block">{user?.nickname || ""}</p>
          </div>
        </div>
      </div>

      <Portal>
        <OneInputModal
          isOpen={isInviteModalOpen}
          modalTitle="초대하기"
          inputLabel="이메일"
          inputPlaceholder="이메일을 입력해주세요"
          onCancel={closeInviteModal}
          cancelButtonText="취소"
          onConfirm={() => handleModalConfirm(handleConfirm)}
          confirmButtonText="생성"
          inputValue={inputValue}
          onInputChange={handleInputChange}
        />
      </Portal>

      {isErrorModalOpen && (
        <ModalAlert
          isOpen={isErrorModalOpen}
          onClose={closeErrorModal}
          text={errorMessage}
        />
      )}

      {isMessageModalOpen && (
        <ModalAlert
          isOpen={isMessageModalOpen}
          onClose={() => setIsMessageModalOpen(false)}
          text={modalMessage}
        />
      )}
    </div>
  );
};

export default MyDashHdr;
