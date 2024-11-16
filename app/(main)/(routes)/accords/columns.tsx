import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { FunctionReturnType } from "convex/server";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Actions } from "./actions";
import { NameAction } from "./nameAction";
import { DataTableColumnHeader } from "../../_components/table-column-header";
import { Badge } from "@/components/ui/badge";
import { HoverCardContent, HoverCardTrigger, HoverCard } from "@/components/ui/hover-card";

export type Accord = {
  _id: Id<"accords">;
  title: string;
  hasChildren?: boolean;
  tags?: string[];
};

export type ResponseType = FunctionReturnType<typeof api.accords.get>;

export const columns: ColumnDef<Accord>[] = [
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
    cell: ({ row }) => <NameAction id={row.original._id} />,
  },
  {
    accessorKey: "tags",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tags" />
    ),
    cell: ({ row }) => {
      const tags = row.original.tags || [];
      const displayTags = tags.slice(0, 3);
      const remainingCount = tags.length - 3;
      const remainingTags = tags.slice(3);

      return (
        <div className="flex flex-wrap items-center gap-1">
          {displayTags.map((tag, index) => (
            <Badge key={index} variant="outline">
              {tag}
            </Badge>
          ))}
          {remainingCount > 0 && (
            <HoverCard>
              <HoverCardTrigger>
                <Badge variant="secondary" className="cursor-help">
                  +{remainingCount} more
                </Badge>
              </HoverCardTrigger>
              <HoverCardContent className="flex flex-wrap gap-1">
                {remainingTags.map((tag, index) => (
                  <Badge key={index} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </HoverCardContent>
            </HoverCard>
          )}
        </div>
      );
    },
    filterFn: (row, id, value: string[]) => {
      const tags = row.getValue<string[]>("tags") || [];
      return value.length === 0 ? true : value.some((val) => tags.includes(val));
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <Actions id={row.original._id} />,
  },
];
