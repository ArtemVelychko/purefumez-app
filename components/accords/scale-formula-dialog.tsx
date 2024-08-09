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
import { ScaleIcon } from "lucide-react";

interface ScaleFormulaDialogProps {
  totalWeight: number;
  onScale: (newTotalWeight: number) => void;
}

export const ScaleFormulaDialog: React.FC<ScaleFormulaDialogProps> = ({
  totalWeight,
  onScale,
}) => {
  const [open, setOpen] = useState(false);
  const [newWeight, setNewWeight] = useState(totalWeight.toString());

  const handleScale = () => {
    const parsedWeight = parseFloat(newWeight);
    if (!isNaN(parsedWeight) && parsedWeight > 0) {
      onScale(parsedWeight);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <ScaleIcon className="mr-2 h-4 w-4" />
          Scale Formula
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Scale Formula</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="new-weight" className="text-right">
              New Total Weight (g)
            </Label>
            <Input
              id="new-weight"
              type="number"
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleScale}>Scale</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};