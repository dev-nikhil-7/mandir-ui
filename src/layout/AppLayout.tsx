import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import { Outlet } from "react-router";
import AppHeader from "./AppHeader";
import Backdrop from "./Backdrop";
import AppSidebar from "./AppSidebar";
import FAB from "../components/common/FAB";
import { useState } from "react";
import CollectChandaModal from "../components/modals/CollectChandaModal";
import { useAuth } from "./../context/AuthContext";
const LayoutContent: React.FC = () => {
  const { token } = useAuth();
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <div className="min-h-screen xl:flex">
      <div>
        <AppSidebar />
        <Backdrop />
      </div>
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isExpanded || isHovered ? "lg:ml-[290px]" : "lg:ml-[90px]"
        } ${isMobileOpen ? "ml-0" : ""}`}
      >
        <AppHeader />
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
          <Outlet />
        </div>
        {token && (
          <>
            {" "}
            {/* Floating Action Button */}
            {/* <FAB onClick={() => setIsModalOpen(true)} /> */}
            {/* Collect Chanda Modal */}
            {/* <CollectChandaModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
            /> */}
          </>
        )}
      </div>
    </div>
  );
};

const AppLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
};

export default AppLayout;
