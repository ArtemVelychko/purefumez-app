import Image from "next/image";
import { CheckIcon, PlusCircledIcon } from "@radix-ui/react-icons";
import type { Column } from "@tanstack/react-table";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "next-themes";

interface DataTableFacetedFilterProps<TData, TValue> {
  column?: Column<TData, TValue>;
  title?: string;
  options: Array<{ name: string; color: string } | string>;
}

const pyramidLevels = [
  { value: "Top", src: "/pyramid-top.svg", tooltip: "Top" },
  { value: "Heart", src: "/pyramid-mid.svg", tooltip: "Heart" },
  { value: "Base", src: "/pyramid-base.svg", tooltip: "Base" },
];

export function DataTableFacetedFilter<TData, TValue>({
  column,
  title,
  options,
}: DataTableFacetedFilterProps<TData, TValue>) {
  const facets = column?.getFacetedUniqueValues();
  const selectedValues = new Set(column?.getFilterValue() as string[]);
  const isFragranceFilter = title === "Fragrance Notes";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          <PlusCircledIcon className="mr-2 size-4" />
          {title}
          {selectedValues?.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge
                variant="secondary"
                className="rounded-sm px-1 font-normal lg:hidden"
              >
                {selectedValues.size}
              </Badge>
              <div className="hidden space-x-1 lg:flex">
                {selectedValues.size > 2 ? (
                  <Badge
                    variant="secondary"
                    className="rounded-sm px-1 font-normal"
                  >
                    {selectedValues.size} selected
                  </Badge>
                ) : (
                  options
                    .filter((option) =>
                      selectedValues.has(
                        typeof option === "string" ? option : option.name
                      )
                    )
                    .map((option, index) => {
                      const optionName =
                        typeof option === "string" ? option : option.name;
                      const displayName =
                        optionName.charAt(0).toUpperCase() +
                        optionName.slice(1);
                      return (
                        <Badge
                          variant="secondary"
                          key={index}
                          className="rounded-sm px-1 font-normal"
                        >
                          {displayName}
                        </Badge>
                      );
                    })
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder={title} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option, index) => {
                const optionName =
                  typeof option === "string" ? option : option.name;
                const displayName =
                  optionName.charAt(0).toUpperCase() + optionName.slice(1);
                const isSelected = selectedValues.has(optionName);
                return (
                  <CommandItem
                    key={index}
                    onSelect={() => {
                      if (isSelected) {
                        selectedValues.delete(optionName);
                      } else {
                        selectedValues.add(optionName);
                      }
                      const filterValues = Array.from(selectedValues);
                      column?.setFilterValue(
                        filterValues.length ? filterValues : undefined
                      );
                    }}
                  >
                    <div
                      className={cn(
                        "mr-2 flex size-4 items-center justify-center rounded-sm border border-primary",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible"
                      )}
                    >
                      <CheckIcon className="size-4" aria-hidden="true" />
                    </div>
                    {isFragranceFilter ? (
                      <div className="mr-2 w-4 h-4">
                        {pyramidLevels.find(
                          (level) =>
                            level.value.toLowerCase() ===
                            optionName.toLowerCase()
                        ) && (
                          <Image
                            src={
                              pyramidLevels.find(
                                (level) =>
                                  level.value.toLowerCase() ===
                                  optionName.toLowerCase()
                              )!.src
                            }
                            alt={
                              pyramidLevels.find(
                                (level) =>
                                  level.value.toLowerCase() ===
                                  optionName.toLowerCase()
                              )!.tooltip
                            }
                            width={16}
                            height={16}
                          />
                        )}
                      </div>
                    ) : (
                      typeof option !== "string" && (
                        <div
                          className="mr-2 w-4 h-4 rounded-full"
                          style={{ backgroundColor: option.color }}
                        />
                      )
                    )}
                    <span>{displayName}</span>
                    {facets?.get(optionName) && (
                      <span className="ml-auto flex size-4 items-center justify-center font-mono text-xs">
                        {facets.get(optionName)}
                      </span>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {selectedValues.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => column?.setFilterValue(undefined)}
                    className="justify-center text-center"
                  >
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
