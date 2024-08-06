"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { PlusIcon, MinusIcon, CalendarIcon, CopyPlus } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "./ui/select";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "./ui/tooltip";
import Image from "next/image";
import { useUser, SignInButton } from "@clerk/nextjs";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { categories } from "./materials/categories";
import { PriceField } from "./materials/fields/price-field";
import { ShareMaterial } from "@/app/(main)/_components/share-material";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { pyramidLevels } from "@/lib/pyramid-links";

interface MaterialFormProps {
  initialData: Doc<"materials">;
  preview?: boolean;
  isSignedUser?: boolean;
}

export const MaterialForm = ({
  initialData,
  preview,
  isSignedUser,
}: MaterialFormProps) => {
  const [formData, setFormData] = useState({
    title: initialData.title,
    category: initialData.category,
    cas: initialData.cas || "",
    altName: initialData.altName || "",
    ifralimit: initialData.ifralimit || 0,
    dilutions: initialData.dilutions?.slice(1) || [],
    fragrancePyramid: initialData.fragrancePyramid || [],
    dateObtained: initialData.dateObtained
      ? new Date(initialData.dateObtained).toISOString()
      : undefined,
    description: initialData.description || "",
    price: initialData.price || 0,
    inventory: initialData.inventory || false,
  });

  const { user } = useUser();
  const { theme } = useTheme();
  const router = useRouter();
  const update = useMutation(api.materials.update);
  const material = useQuery(api.materials.getById, {
    materialId: initialData._id,
  });
  const saveMaterial = useMutation(api.materials.saveMaterial);

  const handleInputChange = (field: keyof typeof formData, value: unknown) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));

    if (field === "dilutions") {
      const updatedDilutions = [100, ...(value as number[])];
      update({
        id: initialData._id,
        dilutions: updatedDilutions,
      });
    } else if (field === "fragrancePyramid") {
      const updatedFragrancePyramid = value as string[];
      update({
        id: initialData._id,
        fragrancePyramid: updatedFragrancePyramid,
      });
    } else if (field === "dateObtained") {
      const dateValue = value instanceof Date ? value.toISOString() : undefined;
      update({
        id: initialData._id,
        dateObtained: dateValue,
      });
    } else if (field === "category") {
      const selectedCategory = categories.find(
        (category) => category.name === value
      );
      setFormData((prevData) => ({
        ...prevData,
        category: selectedCategory || prevData.category,
      }));
      update({
        id: initialData._id,
        category: selectedCategory,
      });
    } else {
      update({
        id: initialData._id,
        [field]: value,
      });
    }
  };

  const handleSaveMaterial = async () => {
    if (!user) {
      toast.error("Please sign in to save this material to your collection", {
        action: (
          <Button size="sm" variant="secondary">
            <SignInButton
              mode="modal"
              forceRedirectUrl={`/preview/material/${initialData._id}`}
            />
          </Button>
        ),
      });
      return;
    }

    const newMaterial = {
      title: formData.title,
      category: formData.category,
      cas: formData.cas,
      altName: formData.altName,
      ifralimit: formData.ifralimit,
      dilutions: [100],
      fragrancePyramid: formData.fragrancePyramid,
      dateObtained: formData.dateObtained,
      description: formData.description,
      price: formData.price,
      inventory: false,
      // Add any other fields that your material schema requires
    };

    const promise = saveMaterial(newMaterial);

    toast.promise(promise, {
      loading: "Saving material...",
      success: "Material saved to my collection",
      error: "Failed to save material",
    });

    try {
      await promise;
      router.push(`/materials/`);
    } catch (error) {
      console.error("Error saving material:", error);
    }
  };

  return (
    <div className="flex h-full flex-col gap-4 p-4 md:p-6">
      <div className="pl-4 group relative">
        {/* Inputs */}
        <div className="space-y-4 mt-8">
          <div className="flex items-center justify-between">
            <Input
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              className="text-5xl bg-transparent font-bold break-words outline-none text-[#3F3F3F] dark:text-[#CFCFCF] resize-none border-none focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              disabled={preview}
            />
            {!preview && (
              <div className="flex items-center space-x-2 mr-4">
                <Label htmlFor="inventory-switch" className="font-medium">
                  Inventory
                </Label>
                <Switch
                  id="inventory-switch"
                  checked={formData.inventory}
                  onCheckedChange={(checked: boolean) =>
                    handleInputChange("inventory", checked)
                  }
                  disabled={preview}
                />
              </div>
            )}

            {material && !preview && (
              <ShareMaterial initialData={material}></ShareMaterial>
            )}

            {preview && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={handleSaveMaterial} size="icon">
                      <CopyPlus />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Add material my collection</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          <div>
            <label className="pt-2 mb-1 block text-sm font-medium text-gray-900 dark:text-white">
              Category
            </label>
            <Select
              onValueChange={(value) => handleInputChange("category", value)}
              value={formData.category.name}
              disabled={preview}
            >
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
                      ></span>
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-900 dark:text-white">
              CAS Number
            </label>

            {/* Need to add a new component for OTP input */}

            <Input
              value={formData.cas}
              onChange={(e) => handleInputChange("cas", e.target.value)}
              placeholder="CAS Number (e.g., 1234-56-7)"
              disabled={preview}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-900 dark:text-white">
              Fragrance pyramid
            </label>
            <div className="flex gap-x-1">
              <ToggleGroup
                type="multiple"
                onValueChange={(value) =>
                  handleInputChange("fragrancePyramid", value)
                }
                value={formData.fragrancePyramid}
                disabled={preview}
              >
                {pyramidLevels.map((level) => (
                  <ToggleGroupItem key={level.value} value={level.value}>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="size-5">
                            <Image
                              alt={level.tooltip}
                              height="24"
                              width="24"
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

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-900 dark:text-white">
              IFRA Limit
            </label>
            <div className="relative flex-1">
              <Input
                type="number"
                min={0}
                max={99}
                value={`${formData.ifralimit}`}
                onChange={(e) => {
                  const value = e.target.value;

                  if (value === "") {
                    handleInputChange("ifralimit", 0);
                  } else {
                    handleInputChange("ifralimit", Number(value));
                  }
                }}
                placeholder="IFRA Limit"
                disabled={preview}
              />
              <div className="absolute inset-y-0 right-5 flex items-center pr-3 pointer-events-none">
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </div>
          </div>
          {!preview && (
            <div className="flex flex-row justify-between">
              {/* Dilutions */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-900 dark:text-white">
                  My Dilutions
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline">Open</Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="flex flex-col gap-y-2">
                      {/* Original Dilution */}
                      <div className="flex items-center">
                        <div className="relative flex-1">
                          <Input type="number" value={100} disabled />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <span className="text-sm text-muted-foreground">
                              %
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Additional Dilutions */}
                      {formData.dilutions.map((dilution, index) => (
                        <div key={index} className="flex items-center">
                          <div className="relative flex-1">
                            <Input
                              type="number"
                              placeholder="Dilution"
                              min={0}
                              max={100}
                              value={dilution}
                              onChange={(e) => {
                                const newDilutions = [...formData.dilutions];
                                newDilutions[index] = Number(e.target.value);
                                handleInputChange("dilutions", newDilutions);
                              }}
                              // disabled={preview}
                              className="-webkit-inner-spin-button: pr-8"
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                              <span className="text-sm text-muted-foreground">
                                %
                              </span>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newDilutions = [...formData.dilutions];
                              newDilutions.splice(index, 1);
                              handleInputChange("dilutions", newDilutions);
                            }}
                            className="ml-2"
                          >
                            <MinusIcon className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}

                      {/* Add Dilution Button */}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newDilutions = [...formData.dilutions, 10];
                          handleInputChange("dilutions", newDilutions);
                        }}
                      >
                        <PlusIcon className="h-3 w-3 mr-1" />
                        Add Dilution
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <PriceField
                value={formData.price}
                onChange={(value) => handleInputChange("price", value)}
                disabled={preview}
              />

              {/* Date Obtained */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-900 dark:text-white">
                  Date Obtained
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !formData.dateObtained && "text-muted-foreground"
                      )}
                    >
                      {formData.dateObtained
                        ? format(formData.dateObtained, "PPP")
                        : "Pick a date"}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      onSelect={(date) =>
                        handleInputChange("dateObtained", date)
                      }
                      disabled={preview}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}

          {preview && (
            <PriceField
              value={formData.price}
              onChange={(value) => handleInputChange("price", value)}
              disabled={preview}
            />
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-900 dark:text-white">
              Description
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Description"
              disabled={preview}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
