"use client";

import { useCallback, useState } from "react";
import { useTheme } from "next-themes";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
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
import { ProfilesField } from "./materials/fields/profiles-field";
import { DilutionsField } from "./materials/fields/dilutions-field";
import { IFRALimitField } from "./materials/fields/ifra-limit-field";
import { FragrancePyramidField } from "./materials/fields/fragrance-pyramid-field";
import { InputField } from "./materials/fields/input-field";

type Profile = {
  _id: Id<"profiles">;
  title: string;
  color: string;
};

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
    profiles: initialData.profiles || [],
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
  const allProfiles = useQuery(api.profiles.get) || [];

  const handleInputChange = useCallback(
    (field: keyof typeof formData, value: any) => {
      let newValue = value;
      let updateData: {
        id: Id<"materials">;
        profiles: Id<"profiles">[];
        [key: string]: unknown;
      } = {
        id: initialData._id,
        profiles: formData.profiles,
      };

      if (field === "dilutions") {
        // Handle dilutions separately
        newValue = value as number[];
        updateData.dilutions = [100, ...newValue];
      } else if (field === "profiles") {
        newValue = (value as Profile[]).map((profile) => profile._id);
        updateData.profiles = newValue;
      } else if (field === "dateObtained") {
        newValue = value ? new Date(value as string).toISOString() : undefined;
        updateData.dateObtained = newValue;
      } else {
        updateData[field] = value;
      }

      setFormData((prevData) => ({
        ...prevData,
        [field]: newValue,
      }));

      update(updateData);
    },
    [update, initialData._id]
  );

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
      profiles: formData.profiles,
      cas: formData.cas,
      altName: formData.altName,
      ifralimit: formData.ifralimit,
      dilutions: [100, ...formData.dilutions],
      fragrancePyramid: formData.fragrancePyramid,
      dateObtained: formData.dateObtained,
      description: formData.description,
      price: formData.price,
      inventory: false,
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

  const selectedProfiles = formData.profiles.map(
    (profileId) =>
      allProfiles.find((p) => p._id === profileId) || {
        _id: profileId,
        title: "Unknown",
        color: "#000000",
      }
  );

  return (
    <div className="flex h-full flex-col gap-4 p-4 md:p-6">
      <div className="pl-4 relative">
        <div className="space-y-4 mt-8">
          <div className="flex items-center justify-between">
            <Input
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              className="text-4xl bg-transparent font-bold break-words outline-none text-[#3F3F3F] dark:text-[#CFCFCF] resize-none border-none focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
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

            {material && !preview && <ShareMaterial initialData={material} />}

            {preview && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={handleSaveMaterial} size="icon">
                      <CopyPlus />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Add material to my collection</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          <ProfilesField
            selectedProfiles={selectedProfiles}
            onChange={(value) => handleInputChange("profiles", value)}
            disabled={preview}
          />

          <div className="w-full">
            <InputField
              label="CAS Number"
              value={formData.cas}
              onChange={(value) => handleInputChange("cas", value)}
              placeholder="CAS Number (e.g., 1234-56-7)"
              disabled={preview}
            />
          </div>

          <div className="flex flex-col items-center w-full md:flex-row gap-4">
            <div className="w-full">
              <FragrancePyramidField
                value={formData.fragrancePyramid}
                onChange={(value) =>
                  handleInputChange("fragrancePyramid", value)
                }
                disabled={preview}
              />
            </div>
            <div className="w-full">
              <IFRALimitField
                value={formData.ifralimit}
                onChange={(value) =>
                  handleInputChange("ifralimit", Number(value))
                }
                disabled={preview}
              />
            </div>
          </div>

          {!preview && (
            <div className="flex flex-row justify-between">
              {/* Dilutions */}
              <DilutionsField
                dilutions={formData.dilutions}
                onChange={(value) => handleInputChange("dilutions", value)}
              />

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
