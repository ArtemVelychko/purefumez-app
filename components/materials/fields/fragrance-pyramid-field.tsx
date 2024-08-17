import React from "react";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { pyramidLevels } from "@/lib/pyramid-links";
import { useTheme } from "next-themes";

interface FragrancePyramidFieldProps {
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
}

export const FragrancePyramidField: React.FC<FragrancePyramidFieldProps> = ({
  value,
  onChange,
  disabled,
}) => {
  const { theme } = useTheme();

  return (
    <div>
      <Label className="mb-1 block text-sm font-medium">
        Fragrance pyramid
      </Label>
      <div className="flex gap-x-1">
        <ToggleGroup
          type="multiple"
          value={value}
          onValueChange={onChange}
          disabled={disabled}
        >
          {pyramidLevels.map((level) => (
            <ToggleGroupItem key={level.value} value={level.value}>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="size-5">
                      <Image
                        alt={level.tooltip}
                        height={24}
                        width={24}
                        src={
                          level.src[theme as keyof typeof level.src] ||
                          level.src.light
                        }
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>{level.tooltip}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
    </div>
  );
};
