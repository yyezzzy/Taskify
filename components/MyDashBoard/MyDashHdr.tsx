import { hdMenuBtn, hdMenuBtnIcon } from "./MyDashStyle";
import { UserResponse } from "@/types/users";
import { useRouter } from "next/router";
import useGetUser from "@/hooks/useGetUser";
import Image from "next/image";
import Link from "next/link";
import { useDashboardContext } from "@/context/DashboardContext";
import { useEffect } from "react";
import { getDashboardDetail } from "@/utils/api/dashboardsApi";

const MyDashHdr = () => {
  const { data } = useGetUser();
  const userData = data as UserResponse;

  const router = useRouter();
  const { dashboardid } = router.query;

  const { dashboardDetail, setDashboardDetail } = useDashboardContext();

  useEffect(() => {
    const fetchDashboardDetail = async () => {
      if (dashboardid) {
        try {
          const detail = await getDashboardDetail(Number(dashboardid));
          setDashboardDetail(detail); // context에 대시보드 세부정보 저장
        } catch (error) {
          console.error("Failed to fetch dashboard detail:", error);
        }
      }
    };

    fetchDashboardDetail();
  }, [dashboardid, setDashboardDetail]);

  return (
    <div className="border-b border-gray400 bg-white">
      <div className="headerWrap flex justify-between items-center w-full p-[13px_8px_13px_18px] md:px-10 md:py-[15px]">
        <h2 className="pageTitle flex-1 text-x font-bold md:text-xl lg:text-[2rem]">
          {dashboardDetail?.title || "내 대시보드"}
        </h2>
        <ul className="flex gap-[6px] md:gap-4">
          <li>
            <Link
              href={`/dashboards/${dashboardid}/edit`}
              className={`${hdMenuBtn}`}
            >
              <span className={`${hdMenuBtnIcon}`}>
                <Image
                  src="/images/icons/icon_settings.svg"
                  width={15}
                  height={15}
                  alt="관리"
                />
              </span>
              관리
            </Link>
          </li>
          <li>
            <button type="button" className={`${hdMenuBtn}`}>
              <span className={`${hdMenuBtnIcon}`}>
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
        </ul>
        <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray400 md:ml-8 md:pl-8 lg:ml-9 lg:pl-9">
          <span className="overflow-hidden relative w-[34px] h-[34px] rounded-full bg-slate-500">
            {userData?.profileImageUrl ? (
              <Image src={userData.profileImageUrl} fill alt="Profile Image" />
            ) : (
              <Image
                src="https://via.placeholder.com/34"
                fill
                alt="Default Profile"
              />
            )}
          </span>
          <p className="hidden md:block">{userData?.nickname || ""}</p>
        </div>
      </div>
    </div>
  );
};

export default MyDashHdr;
