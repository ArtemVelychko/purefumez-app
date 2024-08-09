import React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  getFacetedRowModel,
  getFacetedUniqueValues,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMediaQuery } from "usehooks-ts";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filterKey: string;
  onDelete: (rows: TData[]) => void;
  disabled?: boolean;
  categoryColumn?: keyof TData & string;
  fragrancePyramidColumn?: keyof TData & string;
  solventWeight: number;
  onSolventWeightChange: (weight: number) => void;
  totalWeight: number;
  finalDilution: number;
  onScale: (newTotalWeight: number) => void;
  onDilutionScale: (newDilution: number) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  filterKey,
  onDelete,
  disabled,
  categoryColumn,
  fragrancePyramidColumn,
  solventWeight,
  onSolventWeightChange,
  totalWeight,
  finalDilution,
  onScale,
  onDilutionScale,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = React.useState({});
  const [scaleValue, setScaleValue] = React.useState("");
  const [dilutionScaleValue, setDilutionScaleValue] = React.useState("");

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
  });

  const isMobile = useMediaQuery("(max-width: 768px)");

  const filteredSelectedRows = table.getFilteredSelectedRowModel().rows;

  const handleScaleSubmit = () => {
    const newTotalWeight = parseFloat(scaleValue);
    if (!isNaN(newTotalWeight) && newTotalWeight > 0) {
      onScale(newTotalWeight);
      setScaleValue("");
    }
  };

  const handleDilutionScaleSubmit = () => {
    const newDilution = parseFloat(dilutionScaleValue);
    if (!isNaN(newDilution) && newDilution > 0 && newDilution <= 100) {
      onDilutionScale(newDilution);
      setDilutionScaleValue("");
    }
  };

  return (
    <div className="border shadow-sm rounded-md">
      <div className="relative w-full overflow-auto">
        <Table className="w-full caption-bottom text-sm">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
            {/* Solvent Row */}
            <TableRow>
              <TableCell></TableCell>
              <TableCell className="font-medium">Solvent</TableCell>
              <TableCell>
                <Input
                  type="number"
                  value={`${solventWeight}`}
                  onChange={(e) => onSolventWeightChange(Number(e.target.value))}
                  disabled={disabled}
                />
              </TableCell>
              <TableCell></TableCell>
              <TableCell>
                {totalWeight > 0 ? ((solventWeight / totalWeight) * 100).toFixed(2) : 0}%
              </TableCell>
              <TableCell></TableCell>
            </TableRow>
            {/* Total Row */}
            <TableRow>
              <TableCell></TableCell>
              <TableCell className="font-bold">Total</TableCell>
              <TableCell>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" disabled={disabled}>
                      {totalWeight.toFixed(3)} g
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Scale Formula</DialogTitle>
                    </DialogHeader>
                    <Input
                      type="number"
                      value={scaleValue}
                      onChange={(e) => setScaleValue(e.target.value)}
                      placeholder="Enter new total weight (g)"
                    />
                    <Button onClick={handleScaleSubmit}>Scale</Button>
                  </DialogContent>
                </Dialog>
              </TableCell>
              <TableCell>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" disabled={disabled}>
                      {finalDilution.toFixed(2)}%
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adjust Concentration</DialogTitle>
                    </DialogHeader>
                    <Input
                      type="number"
                      value={dilutionScaleValue}
                      onChange={(e) => setDilutionScaleValue(e.target.value)}
                      placeholder="Enter new concentration (%)"
                    />
                    <Button onClick={handleDilutionScaleSubmit}>Adjust</Button>
                  </DialogContent>
                </Dialog>
              </TableCell>
              <TableCell>100%</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 p-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {filteredSelectedRows.length} of {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        {table.getPageCount() > 1 && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
