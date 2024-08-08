import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { FunctionReturnType } from "convex/server";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Actions } from "./actions";
import { NameAction } from "./nameAction";
import { DataTableColumnHeader } from "../../_components/table-column-header";

export type Formula = {
  _id: Id<"formulas">;
  title: string;
  concentration?: number;
  // Add any other formula-specific fields here
};

export type ResponseType = FunctionReturnType<typeof api.formulas.getFormulasSidebar>;

export const columns: ColumnDef<Formula>[] = [
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
    accessorKey: "concentration",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Concentration" />
    ),
    cell: ({ row }) => {
      const concentration = row.getValue("concentration");
      return concentration ? `${concentration}%` : "N/A";
    },
  },
  // Add more columns as needed for formula-specific data
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <Actions id={row.original._id} />,
  },
];