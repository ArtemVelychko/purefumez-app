import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Calculator } from "lucide-react";

const DilutionCalculator = () => {
  const [startingDilution, setStartingDilution] = useState<string>("");
  const [desiredDilution, setDesiredDilution] = useState<string>("");
  const [desiredQuantity, setDesiredQuantity] = useState<string>("");
  const [result, setResult] = useState<string | null>(null);

  const calculate = () => {
    if (
      startingDilution === "" ||
      desiredDilution === "" ||
      desiredQuantity === ""
    ) {
      setResult("Please fill in all fields.");
      return;
    }

    const starting = parseFloat(startingDilution);
    const desired = parseFloat(desiredDilution);
    const quantity = parseFloat(desiredQuantity);

    if (
      starting <= 0 ||
      desired <= 0 ||
      quantity <= 0 ||
      desired >= 100 ||
      starting <= desired
    ) {
      setResult(
        "All values must be greater than 0, the starting dilution must be greater than the desired dilution, and the desired dilution should be less than 100%."
      );
      return;
    }

    // Calculate the amount of material needed
    const materialNeeded =
      quantity * (desired / (starting - desired + desired));
    // Calculate the amount of solvent needed
    const solventQuantity = quantity - materialNeeded;

    setResult(
      `To create ${quantity} grams of material at ${desired}% dilution, you need to add ${solventQuantity.toFixed(2)} grams of solvent to ${materialNeeded.toFixed(2)} grams of material.`
    );
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-gray-700 text-white hover:bg-blue-600">
          <Calculator className="h-5 w-5"/>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>
          Dilution Calculator
        </DialogTitle>
        <div className="space-y-4">
          <div>
            <Label htmlFor="startingDilution">Starting Dilution (%)</Label>
            <Input
              id="startingDilution"
              type="number"
              value={startingDilution}
              onChange={(e) => setStartingDilution(e.target.value)}
              placeholder="e.g., 100"
            />
          </div>
          <div>
            <Label htmlFor="desiredDilution">Desired Dilution (%)</Label>
            <Input
              id="desiredDilution"
              type="number"
              value={desiredDilution}
              onChange={(e) => setDesiredDilution(e.target.value)}
              placeholder="e.g., 10"
            />
          </div>
          <div>
            <Label htmlFor="desiredQuantity">Desired Quantity (g)</Label>
            <Input
              id="desiredQuantity"
              type="number"
              value={desiredQuantity}
              onChange={(e) => setDesiredQuantity(e.target.value)}
              placeholder="e.g., 10"
            />
          </div>

          {result && (
            <p className="mt-4 text-gray-700 border p-4 rounded-md bg-gray-200">
              {result}
            </p>
          )}
        </div>
        <div className="flex flex-row items-center justify-between ">
          <DialogClose asChild>
            <Button>
              Close
            </Button>
          </DialogClose>
          <Button
            onClick={calculate}
            className="bg-green-500 text-white hover:bg-green-600"
          >
            Calculate
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DilutionCalculator;
