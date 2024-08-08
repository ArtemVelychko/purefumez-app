"use client";

import { MenuIcon } from "lucide-react";
import { UserItem } from "./user-item";

interface NavbarProps {
  isCollapsed: boolean;
  onResetWidth: () => void;
  isMobile: boolean;
}

export const Navbar = ({ isCollapsed, onResetWidth, isMobile }: NavbarProps) => {
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

        {((isMobile && isCollapsed) || !isMobile) && <UserItem />}
    </>
  );
};
