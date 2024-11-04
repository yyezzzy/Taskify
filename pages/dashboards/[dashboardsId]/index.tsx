// 필요한 모듈과 컴포넌트들을 import
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";
import { getColumns, createColumn } from "../../../utils/api/columnsApi";
import { ColoumnsParams, Columns, ColumnsResponse } from "@/types/columns";
import { UserResponse } from "@/types/users";
import { useAuthStore } from "@/store/authStore";
import Image from "next/image";
import Column from "@/components/DashBoard/column/Column";
import DashBoardLayout from "@/components/Layout/DashBoardLayout";
import Portal from "@/components/UI/modal/ModalPotal";
import OneInputModal from "@/components/UI/modal/InputModal/OneInputModal";
import useModal from "@/hooks/modal/useModal";
import LoadingSpinner from "@/components/UI/loading/LoadingSpinner";
import MetaHead from "@/components/MetaHead";
import { useDashBoardStore } from "@/store/dashBoardStore";
import { withAuth } from "@/utils/auth";

// 초기 유저 정보를 받는 props 인터페이스 정의
interface DashboardDetailProps {
  initialUser: UserResponse | null;
}

// DashboardDetail 컴포넌트 정의, initialUser라는 props를 받아 유저 정보를 설정
const DashboardDetail: React.FC<DashboardDetailProps> = ({ initialUser }) => {
  const router = useRouter();
  const { dashboardsId } = router.query; // 쿼리에서 dashboard ID 추출
  const { setDashboardId } = useDashBoardStore(); // 대시보드 ID 상태 설정
  const [columns, setColumns] = useState<Columns[]>([]); // 칼럼 데이터 상태
  const [loading, setLoading] = useState<boolean>(false); // 로딩 상태 관리

  // 모달 관련 상태 및 메서드 가져옴 (열기, 닫기, 입력값, 확인 동작)
  const {
    isOpen,
    inputValue,
    openModal: handleAddColumn,
    closeModal,
    handleInputChange,
    handleConfirm: handleModalConfirm,
  } = useModal();

  // 인증 관련 상태 및 메서드 불러오기
  const { setUser, checkAuth } = useAuthStore();

  // 컴포넌트 마운트 시 초기 유저 정보 설정, 없으면 인증 체크
  useEffect(() => {
    if (initialUser) {
      setUser({
        ...initialUser,
        profileImageUrl: initialUser.profileImageUrl || "",
      });
    } else {
      checkAuth();
    }
  }, [initialUser, setUser, checkAuth]);

  // 칼럼 데이터 불러오는 함수
  const fetchColumns = useCallback(async () => {
    const dashboardId = Number(dashboardsId); // dashboard ID를 숫자로 변환
    const params: ColoumnsParams = { dashboardId }; // API 호출에 필요한 파라미터 설정

    try {
      setLoading(true);
      const columnsData: ColumnsResponse = await getColumns(params); // 칼럼 데이터 API 호출
      setColumns(columnsData.data); // 상태에 칼럼 데이터 설정
    } catch (error) {
      throw error;
    } finally {
      setLoading(false); // 로딩 상태 업데이트
    }
  }, [dashboardsId]);

  // 새로운 칼럼을 생성하는 함수, 모달의 확인 버튼을 클릭 시 실행
  const handleConfirm = useCallback(
    (inputValue: string) => {
      createColumn({
        title: inputValue,
        dashboardId: Number(dashboardsId),
      }).then((newColumn) => {
        if (newColumn) {
          setColumns((prev) => [
            ...prev,
            { ...newColumn, dashboardId: Number(dashboardsId) },
          ]);
        }
        fetchColumns(); // 새로 생성한 칼럼을 가져와 화면에 업데이트
      });
    },
    [dashboardsId, fetchColumns]
  );

  // 컴포넌트가 마운트되거나 dashboardsId가 변경될 때 칼럼 데이터 가져오기
  useEffect(() => {
    if (dashboardsId) {
      fetchColumns();
    }
    setDashboardId(Number(dashboardsId));
  }, [dashboardsId, fetchColumns, setDashboardId]);

  return (
    <>
      <MetaHead
        title="상세 대시보드🎯"
        description="대시보드에 새로운 일정을 추가해보세요!"
      />
      <DashBoardLayout>
        {loading ? (
          <div className="flex justify-center items-center min-h-screen">
            <LoadingSpinner text={"로딩중입니다! 잠시만 기다려주세요🙂‍↕️"} />
          </div>
        ) : (
          <div className="h-srceen columns flex flex-col lg:flex-row">
            {columns.map((item) => (
              <Column
                key={item.id}
                id={item.id}
                title={item.title}
                onRefresh={fetchColumns}
              />
            ))}
            <div className="columnList flex-1 h-full py-4 px-3 md:p-5 border-r border-[gray600]">
              <button
                type="button"
                className="flex justify-center items-center gap-3 w-full sm:h-[66px] h-[70px] lg:mt-12 border border-gray400 rounded-md bg-white100 text-black300 font-bold"
                onClick={handleAddColumn}
              >
                새로운 컬럼 추가하기
                <Image
                  src="/images/icons/icon_add_column.svg"
                  width={16}
                  height={16}
                  alt="할 일 추가"
                />
              </button>
            </div>
          </div>
        )}
        <Portal>
          <OneInputModal
            isOpen={isOpen}
            modalTitle="새 칼럼 생성"
            inputLabel="이름"
            inputPlaceholder="컬럼 이름을 입력해주세요"
            onCancel={closeModal}
            cancelButtonText="취소"
            onConfirm={() => handleModalConfirm(handleConfirm)}
            confirmButtonText="생성"
            inputValue={inputValue}
            onInputChange={handleInputChange}
          />
        </Portal>
      </DashBoardLayout>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  return withAuth(context);
};

export default DashboardDetail;
