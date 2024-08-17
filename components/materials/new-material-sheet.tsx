import React, { useState, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { categories } from "./categories";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";
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
import { ProfilesField } from "./fields/profiles-field";
import { Id } from "@/convex/_generated/dataModel";

interface Profile {
  _id: Id<"profiles">;
  title: string;
  color: string;
}

interface FormData {
  title: string;
  profiles: Profile[];
  altName: string;
  cas: string;
  fragrancePyramid: string[];
  ifralimit: number;
  dilutions: number[];
  dateObtained?: Date;
  description: string;
}

export const NewMaterialSheet = () => {
  const createMaterial = useMutation(api.materials.createMaterial);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    profiles: [],
    altName: "",
    cas: "",
    fragrancePyramid: [],
    ifralimit: 0,
    dilutions: [],
    dateObtained: undefined,
    description: "",
  });

  const handleInputChange = useCallback(
    <K extends keyof FormData>(field: K, value: FormData[K]) => {
      setFormData((prevData) => ({
        ...prevData,
        [field]: value,
      }));
    },
    []
  );

  const handleCreateMaterial = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const newMaterial = {
        ...formData,
        profiles: formData.profiles.map((p) => p._id),
        dilutions: [100, ...formData.dilutions],
        dateObtained: formData.dateObtained
          ? new Date(formData.dateObtained).toISOString()
          : undefined,
      };
      const promise = createMaterial(newMaterial);
      toast.promise(promise, {
        loading: "Creating a new material...",
        success: "Material created successfully",
        error: "Failed to create material",
      });
      setIsOpen(false);
      setFormData({
        title: "",
        profiles: [],
        altName: "",
        cas: "",
        fragrancePyramid: [],
        ifralimit: 0,
        dilutions: [],
        dateObtained: undefined,
        description: "",
      });
    },
    [formData, createMaterial]
  );

  const content = (
    <form
      onSubmit={handleCreateMaterial}
      className="flex flex-col space-y-6 p-6"
    >
      <InputField
        label="Title"
        value={formData.title}
        onChange={(value) => handleInputChange("title", value)}
        required
      />
      <ProfilesField
        selectedProfiles={formData.profiles}
        onChange={(profiles) => handleInputChange("profiles", profiles)}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="CAS Number"
          value={formData.cas}
          onChange={(value) => handleInputChange("cas", value)}
          placeholder="CAS Number (e.g., 1234-56-7)"
        />

        <FragrancePyramidField
          value={formData.fragrancePyramid}
          onChange={(value) =>
            handleInputChange("fragrancePyramid", value as string[])
          }
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <IFRALimitField
          value={formData.ifralimit}
          onChange={(value) => handleInputChange("ifralimit", value)}
        />
        <DateObtainedField
          value={formData.dateObtained?.toISOString()}
          onChange={(value) => handleInputChange("dateObtained", value)}
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
        <Button type="submit">Create Material</Button>
      </div>
    </form>
  );

  const triggerButton = (
    <Button size="sm">
      <PlusCircle className="h-4 w-4 mr-2" />
      Add Material
    </Button>
  );

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>{triggerButton}</DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogTitle>Add New Material</DialogTitle>
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>{triggerButton}</SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-xl">
        <DialogTitle>Add New Material</DialogTitle>
        {content}
      </SheetContent>
    </Sheet>
  );
};
