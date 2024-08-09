import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlusCircle } from "lucide-react";

interface AddMaterialDialogProps {
  onAddMaterial: (material: Doc<"materials">) => void;
}

export const AddMaterialDialog: React.FC<AddMaterialDialogProps> = ({ onAddMaterial }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const materials = useQuery(api.materials.getSidebar);

  const filteredMaterials = materials?.filter((material) =>
    material.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddMaterial = (material: Doc<"materials">) => {
    onAddMaterial(material);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Material
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Material</DialogTitle>
        </DialogHeader>
        <Input
          placeholder="Search materials..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="my-4"
        />
        <ScrollArea className="h-[300px] pr-4">
          {filteredMaterials?.map((material) => (
            <Button
              key={material._id}
              variant="ghost"
              className="w-full justify-start"
              onClick={() => handleAddMaterial(material)}
            >
              <span
                className="mr-2 h-2 w-2 rounded-full"
                style={{ backgroundColor: material.category.color }}
              />
              {material.title}
            </Button>
          ))}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};