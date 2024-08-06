"use client";

import { useParams } from "next/navigation";
import { MenuIcon } from "lucide-react";
// import { Banner } from "./banner";
import { UserItem } from "./user-item";

interface NavbarProps {
  isCollapsed: boolean;
  onResetWidth: () => void;
  isMobile: boolean;
}

export const Navbar = ({ isCollapsed, onResetWidth, isMobile }: NavbarProps) => {
  const params = useParams();

  // const formula = useQuery(api.formulas.getFormulaById, {
  //   formulaId: params.formulaId as Id<"formulas">,
  // });

  // if (formula === undefined) {
  //   return (
  //     <nav className="bg-background px-3 py-2 w-full flex items-center justify-between">
  //       <Title.Skeleton />
  //       <div className="flex items-center gap-x-2">
  //         <Menu.Skeleton />
  //       </div>
  //     </nav>
  //   );
  // }

  // if (formula === null) {
  //   return null;
  // }

  return (
    <>
        {isCollapsed && (
          <MenuIcon
            role="button"
            onClick={onResetWidth}
            size="icon"
            className="ml-5 h-6 w-6 text-muted-foreground transition-transform transform hover:scale-110 hover:rounded-md hover:bg-gray-100/40 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-50"
          />
        )}

        {/* <Publish initialData={formula}/> */}

        {((isMobile && isCollapsed) || !isMobile) && <UserItem />}
      {/* {formula.isArchived && <Banner documentId={formula._id} />} */}
    </>
  );
};
