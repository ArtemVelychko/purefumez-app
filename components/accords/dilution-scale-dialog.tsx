import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PercentIcon } from "lucide-react";

interface DilutionScaleDialogProps {
  totalMaterialWeight: number;
  totalWeight: number;
  materialsInFormula: { weight: number; dilution: number }[];
  onScale: (newSolventWeight: number) => void;
}

export const DilutionScaleDialog: React.FC<DilutionScaleDialogProps> = ({
  totalMaterialWeight,
  totalWeight,
  materialsInFormula,
  onScale,
}) => {
  const [open, setOpen] = useState(false);
  const [newDilution, setNewDilution] = useState("");

  const handleScale = () => {
    const parsedDilution = parseFloat(newDilution);
    if (!isNaN(parsedDilution) && parsedDilution > 0 && parsedDilution <= 100) {
      const totalMaterialDilutionWeight = materialsInFormula.reduce(
        (sum, material) => sum + material.weight * (material.dilution / 100),
        0
      );
      const requiredTotalWeight = totalMaterialDilutionWeight / (parsedDilution / 100);
      const newSolventWeight = requiredTotalWeight - totalMaterialWeight;

      if (newSolventWeight >= 0) {
        onScale(newSolventWeight);
        setOpen(false);
      } else {
        alert("Cannot achieve desired concentration. Please adjust material dilutions.");
      }
    }
  };

  const currentDilution = totalWeight > 0
    ? (materialsInFormula.reduce(
        (sum, material) => sum + material.weight * (material.dilution / 100),
        0
      ) / totalWeight) * 100
    : 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <PercentIcon className="mr-2 h-4 w-4" />
          Adjust Concentration
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adjust Final Concentration</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="current-dilution" className="text-right">
              Current Concentration
            </Label>
            <Input
              id="current-dilution"
              value={`${currentDilution.toFixed(2)}%`}
              readOnly
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="new-dilution" className="text-right">
              New Concentration (%)
            </Label>
            <Input
              id="new-dilution"
              type="number"
              value={newDilution}
              onChange={(e) => setNewDilution(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleScale}>Adjust</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};