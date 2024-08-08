import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { CirclePlusIcon } from "lucide-react";
import { Doc } from "@/convex/_generated/dataModel";

interface AddMaterialAccordPopoverProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  materialsToAdd: Doc<"materials">[] | undefined;
  accordsToAdd: Doc<"accords">[] | undefined;
  addMaterial: (material: Doc<"materials">) => void;
  addAccord: (accord: Doc<"accords">) => void;
}

export const AddMaterialAccordPopover: React.FC<AddMaterialAccordPopoverProps> = ({
  open,
  setOpen,
  materialsToAdd,
  accordsToAdd,
  addMaterial,
  addAccord
}) => {
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full"
        >
          <CirclePlusIcon className="size-4 mr-2"/>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search material..." />
          <CommandList>
            <CommandEmpty>No materials found.</CommandEmpty>
            <CommandGroup heading="Materials">
              {materialsToAdd?.map((material) => (
                <CommandItem
                  key={material._id}
                  value={material.title}
                  onSelect={() => {
                    addMaterial(material);
                    setOpen(false);
                  }}
                >
                  <span
                    className="mr-2 h-2 w-2 rounded-full"
                    style={{ backgroundColor: material.category.color }}
                  />
                  {material.title}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="Accords">
              {accordsToAdd?.map((accord) => (
                <CommandItem
                  key={accord._id}
                  value={accord.title}
                  onSelect={() => {
                    addAccord(accord);
                    setOpen(false);
                  }}
                >
                  {accord.title}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
