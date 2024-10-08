"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import { MenuIcon } from "lucide-react";

interface NavbarProps {
  isCollapsed: boolean;
  onResetWidth: () => void;
}

export const MaterialNavbar = ({ isCollapsed, onResetWidth }: NavbarProps) => {
  const params = useParams();

  const material = useQuery(api.materials.getById, {
    materialId: params.materialId as Id<"materials">,
  });

  if (material === undefined) {
    return (
      <nav className="bg-background px-3 py-2 w-full flex items-center justify-between">
        <div className="flex items-center gap-x-2">
        </div>
      </nav>
    );
  }

  if (material === null) {
    return null;
  }

  return (
    <>
      <nav className="bg-background dark:bg-[#1F1F1F] px-3 py-2 w-full flex items-center gap-x-4">
        {isCollapsed && (
          <MenuIcon
            role="button"
            onClick={onResetWidth}
            className="h-6 w-6 text-muted-foreground"
          />
        )}
        <div className="flex items-center justify-between w-full">
          {material.title}
          <div className="flex items-center gap-x-2">
          </div>
        </div>
      </nav>
    </>
  );
};
