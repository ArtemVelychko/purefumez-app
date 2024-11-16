import React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  Row,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash, Filter, Search, X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTableFacetedFilter } from "./data-table/data-table-faceted-filter";
import { useMediaQuery } from "usehooks-ts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

interface Profile {
  _id: string;
  title: string;
  color: string;
}

interface Tag {
  title: string;
}

interface FilterOption {
  value: string;
  label: string;
  color?: string;
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[] | undefined;
  filterKey: string;
  onDelete: (rows: Row<TData>[]) => void;
  disabled?: boolean;
  profilesColumn?: keyof TData & string;
  tagsColumn?: keyof TData & string;
  fragrancePyramidColumn?: keyof TData & string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  filterKey,
  onDelete,
  disabled,
  profilesColumn,
  tagsColumn,
  fragrancePyramidColumn,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [rowSelection, setRowSelection] = React.useState({});
  const [profileOptions, setProfileOptions] = React.useState<Profile[]>([]);
  const [tagsOptions, setTagOptions] = React.useState<Tag[]>([]);
  const [fragrancePyramidOptions, setFragrancePyramidOptions] = React.useState<
    string[]
  >([]);

  const table = useReactTable({
    data: data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
  });

  const isMobile = useMediaQuery("(max-width: 768px)");

  React.useEffect(() => {
    if (data && profilesColumn) {
      const allProfiles = data.flatMap(
        (item: any) => item[profilesColumn] || []
      );
      const uniqueProfiles = allProfiles.reduce(
        (acc: Profile[], profile: Profile) => {
          if (!acc.some((p) => p._id === profile._id)) {
            acc.push(profile);
          }
          return acc;
        },
        []
      );
      setProfileOptions(uniqueProfiles);
    }

    if (data && fragrancePyramidColumn) {
      const allNotes = data.flatMap(
        (item: any) => item[fragrancePyramidColumn] || []
      );
      const uniqueNotes = Array.from(new Set(allNotes));
      setFragrancePyramidOptions(uniqueNotes);
    }

    if (data && tagsColumn) {
      const allTags = data.flatMap((item: any) => item[tagsColumn] || []);
      const uniqueTags = Array.from(new Set(allTags));
      setTagOptions(uniqueTags.map(tag => ({ title: tag })));
    }
  }, [data, profilesColumn, fragrancePyramidColumn, tagsColumn]);

  const filteredSelectedRows = table.getFilteredSelectedRowModel().rows;
  const isFiltered = table.getState().columnFilters.length > 0;

  const renderFilters = () => (
    <>
      {profilesColumn && table.getColumn(profilesColumn) && (
        <DataTableFacetedFilter
          column={table.getColumn(profilesColumn)}
          options={profileOptions.map((profile) => ({
            value: profile._id,
            label: profile.title,
            color: profile.color,
          }))}
          title="Profiles"
        />
      )}
      {fragrancePyramidColumn && table.getColumn(fragrancePyramidColumn) && (
        <DataTableFacetedFilter
          column={table.getColumn(fragrancePyramidColumn)}
          options={fragrancePyramidOptions.map((note) => ({
            value: note,
            label: note,
          }))}
          title="Fragrance Notes"
        />
      )}
      {tagsColumn && table.getColumn(tagsColumn) && (
        <DataTableFacetedFilter
          column={table.getColumn(tagsColumn)}
          options={tagsOptions.map((tag) => ({
            value: tag.title,
            label: tag.title,
          }))}
          title="Tags"
        />
      )}
    </>
  );

  return (
    <div className="border shadow-sm rounded-md">
      <div className="flex items-center gap-4 border-b bg-gray-100/40 px-6 py-4 dark:bg-gray-800/40">
        {/* Search input */}
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                className="flex h-10 rounded-md border border-input px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 w-full bg-white shadow-none appearance-none pl-8 dark:bg-gray-950"
                placeholder={`Search ${filterKey}...`}
                value={
                  (table.getColumn(filterKey)?.getFilterValue() as string) ?? ""
                }
                onChange={(event) =>
                  table.getColumn(filterKey)?.setFilterValue(event.target.value)
                }
                type="search"
              />
            </div>
            {!isMobile && renderFilters()}
            {isFiltered && (
              <Button
                className="h-8 lg:px-3"
                onClick={() => table.resetColumnFilters()}
                variant="ghost"
              >
                Reset
                <X className="ml-2 size-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Mobile filters */}
        {isMobile && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="ml-auto font-normal text-xs"
                size="sm"
              >
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filters</DropdownMenuLabel>
              {renderFilters()}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Delete button */}
        {filteredSelectedRows.length > 0 && (
          <Button
            disabled={disabled}
            size="sm"
            variant="outline"
            className="ml-auto font-normal text-xs"
            onClick={() => {
              onDelete(filteredSelectedRows);
              table.resetRowSelection();
            }}
          >
            <Trash className="size-4 mr-2" />
            Delete ({filteredSelectedRows.length})
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="relative w-full overflow-auto">
        <Table className="w-full caption-bottom text-sm">
          <TableHeader className="[&>tr]:border-b">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="h-12 px-4 text-left align-middle font-medium text-muted-foreground"
                  >
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
          <TableBody className="[&>tr:last-child]:border-0">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="p-4 align-middle">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end space-x-2 p-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {filteredSelectedRows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        {table.getRowCount() > 10 && (
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

