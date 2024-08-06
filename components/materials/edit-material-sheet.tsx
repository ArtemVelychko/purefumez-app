import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { useOnOpenMaterial } from "@/hooks/materials/use-on-open-material";
import { categories } from "./categories";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from "usehooks-ts";
import {
  InputField,
  SelectField,
  FragrancePyramidField,
  IFRALimitField,
  DilutionsField,
  DateObtainedField,
  TextareaField,
} from "./fields";
import { PriceField } from "./fields/price-field";
import { ShareMaterial } from "@/app/(main)/_components/share-material";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";

type EditMaterialProps = {
  initialData: Doc<"materials">;
};

export const EditMaterialSheet: React.FC<EditMaterialProps> = ({
  initialData,
}) => {
  const { isOpen, onClose } = useOnOpenMaterial();
  const router = useRouter();
  const update = useMutation(api.materials.update);
  const material = useQuery(api.materials.getById, {
    materialId: initialData._id,
  });
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const [formData, setFormData] = useState({
    title: initialData.title,
    category: initialData.category,
    cas: initialData.cas || "",
    altName: initialData.altName || "",
    ifralimit: initialData.ifralimit || 0,
    dilutions: initialData.dilutions?.slice(1) || [],
    fragrancePyramid: initialData.fragrancePyramid || [],
    dateObtained: initialData.dateObtained
      ? new Date(initialData.dateObtained).toISOString().split("T")[0]
      : "",
    description: initialData.description || "",
    price: initialData.price || 0,
    inventory: initialData.inventory,
  });

  const handleInputChange = useCallback(
    (field: keyof typeof formData, value: unknown) => {
      setFormData((prevData) => {
        const newData = { ...prevData, [field]: value };

        if (field === "category") {
          const selectedCategory = categories.find(
            (category) => category.name === value
          );
          newData.category = selectedCategory || prevData.category;
        }

        return newData;
      });

      const updateData: Partial<typeof formData> = { [field]: value };

      if (field === "dilutions") {
        updateData.dilutions = [100, ...(value as number[])];
      } else if (field === "dateObtained") {
        updateData.dateObtained = value
          ? new Date(value as string).toISOString()
          : undefined;
      } else if (field === "category") {
        const selectedCategory = categories.find(
          (category) => category.name === value
        );
        updateData.category = selectedCategory;
      } else if (field === "fragrancePyramid") {
        updateData.fragrancePyramid = value as string[];
      }

      update({ id: initialData._id, ...updateData });
    },
    [update, initialData._id, categories]
  );

  const onRedirect = useCallback(
    (materialId: string) => {
      onClose();
      router.push(`/materials/${materialId}`);
    },
    [router, onClose]
  );

  if (!material) return null;

  const content = (
    <div className="flex flex-col space-y-6 p-6">
      <div className="flex flex-row items-center space-x-4">
        <InputField
          label="Title"
          value={formData.title}
          onChange={(value) => handleInputChange("title", value)}
        />
        <div className="flex items-center space-x-2 mt-5">
          <Label htmlFor="inventory-switch" className="font-medium">
            Inventory
          </Label>
          <Switch
            id="inventory-switch"
            checked={formData.inventory}
            onCheckedChange={(checked: boolean) =>
              handleInputChange("inventory", checked)
            }
          />
        </div>
      </div>

      <div className="flex flex-col items-center w-full md:flex-row gap-4">
        <div className="w-full">
          <SelectField
            label="Category"
            value={formData.category?.name || ""}
            onChange={(value) => handleInputChange("category", value)}
            options={categories}
          />
        </div>
        <div className="w-full">
          <InputField
            label="CAS Number"
            value={formData.cas}
            onChange={(value) => handleInputChange("cas", value)}
            placeholder="CAS Number (e.g., 1234-56-7)"
          />
        </div>
      </div>

      <FragrancePyramidField
        value={formData.fragrancePyramid}
        onChange={(value) => handleInputChange("fragrancePyramid", value)}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <IFRALimitField
          value={formData.ifralimit}
          onChange={(value) => handleInputChange("ifralimit", Number(value))}
        />
        <DateObtainedField
          value={formData.dateObtained}
          onChange={(value) => handleInputChange("dateObtained", value)}
        />
        <PriceField
          value={formData.price}
          onChange={(value) => handleInputChange("price", value)}
        />
        <DilutionsField
          dilutions={formData.dilutions}
          onChange={(value) => handleInputChange("dilutions", value)}
        />
      </div>

      <TextareaField
        label="Description"
        value={formData.description}
        onChange={(value) => handleInputChange("description", value)}
      />

      <div className="flex justify-between pt-4">
        <DialogClose asChild>
          <Button type="button" variant="secondary">
            Close
          </Button>
        </DialogClose>

        <div className="flex gap-2 items-center justify-center">
          <ShareMaterial initialData={material}></ShareMaterial>

          <Button onClick={() => onRedirect(material._id)}>
            Go to material →
          </Button>
        </div>
      </div>
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogTitle>Edit Material</DialogTitle>
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-xl">
        <DialogTitle>Edit Material</DialogTitle>
        {content}
      </SheetContent>
    </Sheet>
  );
};
