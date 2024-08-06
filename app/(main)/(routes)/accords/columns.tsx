import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { FunctionReturnType } from "convex/server";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Actions } from "./actions";
import { NameAction } from "./nameAction";
import { DataTableColumnHeader } from "../../_components/table-column-header";

export type Accord = {
  _id: Id<"accords">;
  title: string;
  hasChildren?: boolean;
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
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <Actions id={row.original._id} />,
  },
];
