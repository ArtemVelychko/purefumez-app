"use client";

import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useSearch } from "@/hooks/use-search";
import { api } from "@/convex/_generated/api";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { DialogTitle } from "./ui/dialog";

export const SearchCommand = () => {
  const router = useRouter();
  const formulas = useQuery(api.formulas.getSearchFormulas);
  const materials = useQuery(api.materials.getSearch);
  const accords = useQuery(api.accords.getSearchAccords);
  const [isMounted, setIsMounted] = useState(false);

  const toggle = useSearch((store) => store.toggle);
  const isOpen = useSearch((store) => store.isOpen);
  const onClose = useSearch((store) => store.onClose);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggle();
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [toggle]);

  const onSelect = (group: string, id: string) => {
    if (group === "formulas") {
      router.push(`/formulas/${id}`);
    }

    if (group === "materials") {
      router.push(`/materials/${id}`);
    }

    if (group === "accords") {
      router.push(`/accords/${id}`);
    }

    onClose();
  };

  if (!isMounted) {
    return null;
  }

  if (!isMounted) {
    return null;
  }

  return (
    <CommandDialog open={isOpen} onOpenChange={onClose}>
      <VisuallyHidden>
        <DialogTitle>Search Dialog</DialogTitle>
      </VisuallyHidden>
      <CommandInput placeholder={"Search..."} />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Materials">
          {materials?.map((material) => (
            <CommandItem
              key={material._id}
              value={`${material._id}-${material.title}`}
              title={material.title}
              onSelect={() => onSelect("materials", material._id)}
            >
              <span
                className="mr-2 h-2 w-2 rounded-full"
                style={{ backgroundColor: material.category.color }}
              ></span>
              <span>{material.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Accords">
          {accords?.map((accord) => (
            <CommandItem
              key={accord._id}
              value={`${accord._id}-${accord.title}`}
              title={accord.title}
              onSelect={() => onSelect("accords", accord._id)}
            >
              <span>{accord.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Formulas">
          {formulas?.map((formula) => (
            <CommandItem
              key={formula._id}
              value={`${formula._id}-${formula.title}`}
              title={formula.title}
              onSelect={() => onSelect("formulas", formula._id)}
            >
              <span>{formula.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};
