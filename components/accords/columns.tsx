import React, {useRef, useState, useEffect} from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { pyramidLevels } from "@/lib/pyramid-links";
import { Id } from "@/convex/_generated/dataModel";

export type Accord = {
  material: Id<"materials">;
  weight: number;
  dilution: number;
  ifralimit: number;
};

export const createColumns = (
  accordMaterials: any[],
  totalWeight: number,
  updateMaterialWeight: (index: number, weight: number) => void,
  updateMaterialDilution: (index: number, dilution: number) => void,
  removeMaterial: (index: number) => void,
  theme: string,
  preview: boolean
): ColumnDef<Accord>[] => [
  {
    accessorKey: "note",
    header: "Note",
    cell: ({ row }) => {
      const material = accordMaterials.find(
        (m) => m._id === row.original.material
      );
      if (!material) return null;

      const pyramidValues = material.fragrancePyramid || [];
      const selectedLevels = pyramidLevels.filter((level) =>
        pyramidValues.includes(level.value)
      );
      const tooltipText =
        selectedLevels.map((level) => level.tooltip).join(" / ") + " Note";

      return (
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
      );
    },
  },
  {
    accessorKey: "material",
    header: "Material",
    cell: ({ row }) => {
      const material = accordMaterials.find(
        (m) => m._id === row.original.material
      );
      if (!material) return null;

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <div className="flex items-center">
                <span
                  className="mr-2 h-2 w-2 rounded-full"
                  style={{ backgroundColor: material.category.color }}
                />
                {material.title}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{material.category.name}</p>
              {material.description && (
                <p className="text-sm">{material.description}</p>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  {
    accessorKey: "weight",
    header: "Weight (g)",
    cell: ({ row }) => {
      return preview ? (
        <div>{row.original.weight}</div>
      ) : (
          <Input
            type="number"
            value={`${row.original.weight}`}
            onChange={(e) =>
              updateMaterialWeight(row.index, Number(e.target.value))
            }
            className="w-20"
          />
      );
    },
  },
  {
    accessorKey: "dilution",
    header: "Concentration",
    cell: ({ row }) => {
      const material = accordMaterials.find(
        (m) => m._id === row.original.material
      );
      if (!material) return null;

      return preview ? (
        <div>{row.original.dilution}%</div>
      ) : (
        <Select
          value={`${row.original.dilution}`}
          onValueChange={(value) =>
            updateMaterialDilution(row.index, Number(value))
          }
        >
          <SelectTrigger className="w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {material.dilutions?.map((dilution: number) => (
              <SelectItem key={dilution} value={`${dilution}`}>
                {dilution}%
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    },
  },
  {
    accessorKey: "percentage",
    header: "Percentage",
    cell: ({ row }) => {
      const percentage =
        totalWeight > 0
          ? ((row.original.weight / totalWeight) * 100).toFixed(2)
          : "0";
      return <div>{percentage}%</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return !preview ? (
        <Button
          onClick={() => removeMaterial(row.index)}
          variant="ghost"
          className="h-8 w-8 p-0"
        >
          <span className="sr-only">Remove</span>
          <X className="h-4 w-4" />
        </Button>
      ) : null;
    },
  },
];
