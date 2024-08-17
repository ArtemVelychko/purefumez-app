"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { FunctionReturnType } from "convex/server";
import { api } from "@/convex/_generated/api";
import { Actions } from "./actions";
import { Id } from "@/convex/_generated/dataModel";
import Image from "next/image";
import { NameAction } from "./nameAction";
import { DataTableColumnHeader } from "../../_components/table-column-header";
import { pyramidLevels } from "@/lib/pyramid-links";
import { useTheme } from "next-themes";
import { Badge } from "@/components/ui/badge";

export type Material = {
  _id: Id<"materials">;
  title: string;
  profiles: Array<{ _id: Id<"profiles">; title: string; color: string }>;
  cas?: string;
  fragrancePyramid?: string[];
  dateObtained?: string;
};

export type ResponseType = FunctionReturnType<typeof api.materials.get>;

const FragrancePyramidCell = ({
  pyramidValues,
}: {
  pyramidValues: string[] | undefined;
}) => {
  const { theme } = useTheme();

  if (!pyramidValues || pyramidValues.length === 0) return null;

  const selectedLevels = pyramidLevels.filter((level) =>
    pyramidValues.includes(level.value)
  );

  const tooltipText =
    selectedLevels.length > 1
      ? selectedLevels.map((level) => level.tooltip).join(" / ") + " Note"
      : selectedLevels.map((level) => level.tooltip).join(" / ") + " Note";

  return (
    <div className="flex items-center space-x-1">
      <HoverCard>
        <HoverCardTrigger>
          <div className="flex items-center space-x-1">
            {selectedLevels.map((level, index) => (
              <div key={index} className="size-5">
                <Image
                  alt={tooltipText}
                  height={24}
                  width={24}
                  src={
                    level.src[theme as keyof typeof level.src] ||
                    level.src.light
                  }
                />
              </div>
            ))}
          </div>
        </HoverCardTrigger>
        <HoverCardContent className="text-sm">{tooltipText}</HoverCardContent>
      </HoverCard>
    </div>
  );
};

export const columns: ColumnDef<Material>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" hideHideOption />
    ),
    cell: ({ row }) => {
      const id = row.original._id;

      return <NameAction id={id} />;
    },
  },
  {
    id: "profiles",
    accessorFn: (row) => row.profiles,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Profiles" />
    ),
    cell: ({ row }) => {
      const profiles = row.original.profiles;
      return (
        <div className="flex flex-wrap gap-1">
          {profiles.map((profile) => (
            <Badge
              key={profile._id}
              style={{ backgroundColor: profile.color, color: 'white' }}
            >
              {profile.title}
            </Badge>
          ))}
        </div>
      );
    },
    filterFn: (row, id, value: string[]) => {
      const profiles = row.getValue(id) as Material['profiles'];
      return value.some((v) => profiles.some(profile => profile._id === v));
    },
  },
  {
    accessorKey: "fragrancePyramid",
    accessorFn: (row) => row.fragrancePyramid,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Notes" />
    ),
    filterFn: (row, id, value: string[]) => {
      const pyramidValues = row.getValue(id) as string[];
      return value.some((v) => pyramidValues.includes(v));
    },
    cell: ({ row }) => (
      <FragrancePyramidCell pyramidValues={row.original.fragrancePyramid} />
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      return <Actions id={row.original._id} />;
    },
  },
];
