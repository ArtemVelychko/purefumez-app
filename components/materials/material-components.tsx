import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { CalendarIcon, MinusIcon, PlusIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Form Field Component
interface FormFieldProps {
  label: string;
  name: string;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  children,
}) => (
  <div>
    <Label
      htmlFor={name}
      className="block mb-1 text-sm font-medium text-gray-900 dark:text-white"
    >
      {label}
    </Label>
    {children}
  </div>
);

// FragrancePyramidToggle Component
interface FragrancePyramidProps {
  value: string;
  onValueChange: (value: string) => void;
}

const pyramidLevels = [
  { value: "top", src: "/pyramid-top.svg", tooltip: "Top Note" },
  { value: "heartTop", src: "/pyramid-mid-top.svg", tooltip: "Heart/Top Top" },
  { value: "heart", src: "/pyramid-mid.svg", tooltip: "Heart Note" },
  {
    value: "baseHeart",
    src: "/pyramid-base-mid.svg",
    tooltip: "Base/Heart Note",
  },
  { value: "base", src: "/pyramid-base.svg", tooltip: "Base Note" },
];

export const FragrancePyramid: React.FC<FragrancePyramidProps> = ({
  value,
  onValueChange,
}) => {
  return (
    <div>
      <Label>Fragrance pyramid</Label>
      <div className="flex gap-x-1">
        <ToggleGroup type="single" value={value} onValueChange={onValueChange}>
          {pyramidLevels.map((level) => (
            <ToggleGroupItem value={level.value} key={level.value}>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="size-5">
                      <Image
                        alt={level.tooltip}
                        height={24}
                        width={24}
                        src={level.src}
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

// CategorySelect.tsx
interface CategorySelectProps {
  value: string;
  onChange: (value: string) => void;
}

export const CategorySelect: React.FC<CategorySelectProps> = ({
  value,
  onChange,
}) => (
  <Select onValueChange={onChange} value={value}>
    <SelectTrigger className="w-full">
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      {categories.map((category) => (
        <SelectItem key={category.name} value={category.name}>
          <div className="flex items-center">
            <span
              className="mr-2 h-2 w-2 rounded-full"
              style={{ backgroundColor: category.color }}
            />
            {category.name}
          </div>
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);

// DilutionsPopover.tsx

interface DilutionsPopoverProps {
  dilutions: number[];
  onChange: (dilutions: number[]) => void;
}

export const DilutionsPopover: React.FC<DilutionsPopoverProps> = ({
  dilutions,
  onChange,
}) => {
  const handleDilutionChange = (index: number, value: number) => {
    const newDilutions = [...dilutions];
    newDilutions[index] = value;
    onChange(newDilutions);
  };

  const handleRemoveDilution = (index: number) => {
    const newDilutions = dilutions.filter((_, i) => i !== index);
    onChange(newDilutions);
  };

  const handleAddDilution = () => {
    onChange([...dilutions, 10]);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Dilutions</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="flex flex-col gap-y-2">
          <div className="flex items-center">
            <Input type="number" value={100} disabled />
            <span className="ml-2">%</span>
          </div>
          {dilutions.map((dilution, index) => (
            <div key={index} className="flex items-center">
              <Input
                type="number"
                min={0}
                max={100}
                value={dilution}
                onChange={(e) =>
                  handleDilutionChange(index, Number(e.target.value))
                }
              />
              <span className="mx-2">%</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveDilution(index)}
              >
                <MinusIcon className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={handleAddDilution}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Dilution
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

// DatePickerPopover.tsx
interface DatePickerPopoverProps {
  date: Date | undefined;
  onSelect: (date: Date | undefined) => void;
}

export const DatePickerPopover: React.FC<DatePickerPopoverProps> = ({
  date,
  onSelect,
}) => (
  <Popover>
    <PopoverTrigger asChild>
      <Button
        variant="outline"
        className={cn(
          "w-full justify-start text-left font-normal",
          !date && "text-muted-foreground"
        )}
      >
        {date ? format(date, "PPP") : "Pick a date"}
        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-auto p-0" align="start">
      <Calendar
        mode="single"
        selected={date}
        onSelect={onSelect}
        initialFocus
      />
    </PopoverContent>
  </Popover>
);

// useForm.ts
import { useState, useCallback } from "react";
import { Doc } from "@/convex/_generated/dataModel";
import { categories } from "./categories";

interface FormData {
  title: string;
  category: { name: string; color: string };
  cas: string;
  altName: string;
  ifralimit: number;
  dilutions: number[];
  fragrancePyramid: string[];
  dateObtained?: string;
  description: string;
}

interface UseFormProps {
  initialData: Doc<"materials">;
  onUpdate: (field: keyof FormData, value: any) => void;
}

export const useForm = ({ initialData, onUpdate }: UseFormProps) => {
  const [formData, setFormData] = useState<FormData>({
    title: initialData.title,
    category: initialData.category,
    cas: initialData.cas || "",
    altName: initialData.altName || "",
    ifralimit: initialData.ifralimit || 0,
    dilutions: initialData.dilutions?.slice(1) || [],
    fragrancePyramid: initialData.fragrancePyramid || [],
    dateObtained: initialData.dateObtained,
    description: initialData.description || "",
  });

  const handleInputChange = useCallback(
    (field: keyof FormData, value: any) => {
      setFormData((prevData) => ({
        ...prevData,
        [field]: value,
      }));

      if (field === "category") {
        const selectedCategory = categories.find(
          (category) => category.name === value
        );
        setFormData((prevData) => ({
          ...prevData,
          category: selectedCategory || prevData.category,
        }));
        onUpdate(field, selectedCategory);
      } else {
        onUpdate(field, value);
      }
    },
    [onUpdate]
  );

  return { formData, handleInputChange };
};
