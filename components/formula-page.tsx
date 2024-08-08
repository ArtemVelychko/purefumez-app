import React, { ElementRef, useEffect, useRef, useState } from "react";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { CirclePlusIcon, X, CopyPlus } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";
import Image from "next/image";
import { useUser, SignInButton } from "@clerk/nextjs";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { ShareFormula } from "@/app/(main)/_components/share-formula";
import { pyramidLevels } from "@/lib/pyramid-links";
import { useTheme } from "next-themes";

interface FormulaProps {
  initialData: Doc<"formulas">;
  preview?: boolean;
}

type MaterialInFormula = {
  material: Id<"materials">;
  weight: number;
  ifralimit: number;
  dilution: number;
};

type AccordInFormula = {
  accord: Id<"accords">;
  weight: number;
  dilution: number;
};

const roundToThousandths = (num: number): number => {
  return Math.round(num * 1000) / 1000;
};

export const FormulaPage = ({ initialData, preview }: FormulaProps) => {
  const update = useMutation(api.formulas.updateFormula);
  const queryFunction = preview
    ? api.accords.getSharedAccords
    : api.accords.getAccordsSidebar;
  const accords = useQuery(queryFunction);

  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialData.title);
  const [open, setOpen] = useState(false);
  const [scaleOpen, setScaleOpen] = useState(false);
  const [scaleValue, setScaleValue] = useState<string>("");
  const [dilutionScaleOpen, setDilutionScaleOpen] = useState(false);
  const [dilutionScaleValue, setDilutionScaleValue] = useState<string>("");
  const [solventWeight, setSolventWeight] = useState<number>(
    roundToThousandths(initialData.solvent?.weight || 0)
  );

  const [materialsInFormula, setMaterialsInFormula] = useState<
    MaterialInFormula[]
  >(
    (initialData.materialsInFormula ?? []).map((m) => ({
      ...m,
      weight: roundToThousandths(m.weight),
    }))
  );
  const [accordsInFormula, setAccordsInFormula] = useState<AccordInFormula[]>(
    (initialData.accordsInFormula ?? []).map((a) => ({
      ...a,
      weight: roundToThousandths(a.weight),
    }))
  );
  const [note, setNote] = useState(initialData.note || "");

  const formulaMaterials = useQuery(api.materials.getMaterialsForFormula, {
    formulaId: initialData._id,
  });
  const allMaterials = useQuery(api.materials.getSidebar);

  const materialsToAdd = allMaterials?.filter(
    (material) => !materialsInFormula.some((m) => m.material === material._id)
  );

  const { user } = useUser();
  const { theme } = useTheme();
  const router = useRouter();
  const saveFormulaToLibrary = useMutation(api.formulas.saveFormulaToLibrary);

  const handleSaveFormula = async () => {
    if (!user) {
      toast.error("Please sign in to save this formula to your collection", {
        action: (
          <Button size="sm" variant="secondary">
            <SignInButton
              mode="modal"
              forceRedirectUrl={`/preview/formula/${initialData._id}`}
            />
          </Button>
        ),
      });
      return;
    }

    try {
      await saveFormulaToLibrary({ formulaId: initialData._id });
      toast.success("Formula saved to your collection");
      router.push("/formulas");
    } catch (error) {
      console.error("Error saving formula:", error);
      toast.error("Failed to save formula to your collection");
    }
  };

  const disableInput = () => setIsEditing(false);

  const onInput = (value: string) => {
    setValue(value);
    update({
      id: initialData._id,
      title: value || "Untitled",
    });
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      disableInput();
    }
  };

  const addMaterial = (material: Doc<"materials">) => {
    if (materialsInFormula.some((m) => m.material === material._id)) {
      return;
    }

    setMaterialsInFormula([
      ...materialsInFormula,
      {
        material: material._id,
        weight: 0,
        ifralimit: material.ifralimit || 0,
        dilution: material.dilutions?.[0] || 100,
      },
    ]);
  };

  const addAccord = (accord: Doc<"accords">) => {
    if (accordsInFormula.some((a) => a.accord === accord._id)) {
      return;
    }

    setAccordsInFormula([
      ...accordsInFormula,
      {
        accord: accord._id,
        weight: 0,
        dilution: accord.concentration || 100,
      },
    ]);
  };

  const updateMaterialWeight = (index: number, weight: number) => {
    const updatedMaterials = [...materialsInFormula];
    updatedMaterials[index].weight = roundToThousandths(weight);
    setMaterialsInFormula(updatedMaterials);
  };

  const updateMaterialDilution = (index: number, dilution: number) => {
    const updatedMaterials = [...materialsInFormula];
    updatedMaterials[index].dilution = dilution;
    setMaterialsInFormula(updatedMaterials);
  };

  const updateAccordWeight = (index: number, weight: number) => {
    const updatedAccords = [...accordsInFormula];
    updatedAccords[index].weight = roundToThousandths(weight);
    setAccordsInFormula(updatedAccords);
  };

  const removeAccord = (index: number) => {
    const updatedAccords = [...accordsInFormula];
    updatedAccords.splice(index, 1);
    setAccordsInFormula(updatedAccords);
  };

  const removeMaterial = (index: number) => {
    const updatedMaterials = [...materialsInFormula];
    updatedMaterials.splice(index, 1);
    setMaterialsInFormula(updatedMaterials);
  };

  const totalMaterialWeight = roundToThousandths(
    materialsInFormula.reduce((sum, material) => sum + material.weight, 0)
  );

  const totalAccordWeight = roundToThousandths(
    accordsInFormula.reduce((sum, accord) => sum + accord.weight, 0)
  );

  const totalWeight = roundToThousandths(
    totalMaterialWeight + totalAccordWeight + solventWeight
  );

  const finalDilution =
    totalWeight > 0
      ? roundToThousandths(
          ((materialsInFormula.reduce(
            (sum, material) =>
              sum + material.weight * (material.dilution / 100),
            0
          ) +
            accordsInFormula.reduce(
              (sum, accord) => sum + accord.weight * (accord.dilution / 100),
              0
            )) /
            totalWeight) *
            100
        )
      : 0;

  const scaleFormula = (newTotalWeight: number) => {
    const scalingFactor = newTotalWeight / totalWeight;
    const scaledMaterials = materialsInFormula.map((material) => ({
      ...material,
      weight: roundToThousandths(material.weight * scalingFactor),
    }));
    setMaterialsInFormula(scaledMaterials);
    setSolventWeight(roundToThousandths(solventWeight * scalingFactor));
  };

  const handleScaleSubmit = () => {
    const newTotalWeight = parseFloat(scaleValue);
    if (!isNaN(newTotalWeight) && newTotalWeight > 0) {
      scaleFormula(newTotalWeight);
      setScaleOpen(false);
      setScaleValue("");
    }
  };

  const scaleFormulaByDilution = (desiredDilution: number) => {
    const totalMaterialDilutionWeight = materialsInFormula.reduce(
      (sum, material) => sum + material.weight * (material.dilution / 100),
      0
    );
    const requiredTotalWeight =
      totalMaterialDilutionWeight / (desiredDilution / 100);
    const requiredSolventWeight = roundToThousandths(
      requiredTotalWeight - totalMaterialWeight
    );

    if (requiredSolventWeight < 0) {
      alert(
        "Not possible to scale to the desired dilution. Adjust material dilutions."
      );
      return;
    }

    setSolventWeight(requiredSolventWeight);
  };

  const handleDilutionScaleSubmit = () => {
    const newDilution = parseFloat(dilutionScaleValue);
    if (!isNaN(newDilution) && newDilution > 0 && newDilution <= 100) {
      scaleFormulaByDilution(newDilution);
      setDilutionScaleOpen(false);
      setDilutionScaleValue("");
    } else {
      alert("Please enter a valid dilution percentage (1-100).");
    }
  };

  const updateNote = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNote(e.target.value);
    update({
      id: initialData._id,
      note: e.target.value,
    });
  };

  useEffect(() => {
    update({
      id: initialData._id,
      materialsInFormula: materialsInFormula,
      accordsInFormula: accordsInFormula,
      solvent: { ...initialData.solvent, weight: solventWeight },
      concentration: finalDilution,
    });
  }, [
    update,
    initialData._id,
    materialsInFormula,
    accordsInFormula,
    solventWeight,
    initialData.solvent,
    finalDilution,
  ]);

  const calculatePureMaterialWeight = (weight: number, dilution: number) => {
    return roundToThousandths(weight * (dilution / 100));
  };

  const ifraCompliant = (material: MaterialInFormula, totalWeight: number) => {
    const pureMaterialWeight = calculatePureMaterialWeight(
      material.weight,
      material.dilution
    );
    const pureMaterialPercentage = roundToThousandths(
      (pureMaterialWeight / totalWeight) * 100
    );
    if (material.ifralimit === 0) return true;
    return pureMaterialPercentage <= material.ifralimit;
  };

  return (
    <div className="flex h-full flex-col gap-4 p-4 md:p-6">
      <div className="flex-1 ml-4 mt-20">
        <div className="flex items-center justify-between">
          <Input
            onBlur={disableInput}
            onKeyDown={onKeyDown}
            value={value}
            onChange={(e) => onInput(e.target.value)}
            className="text-4xl bg-transparent font-bold outline-none text-[#3F3F3F] dark:text-[#CFCFCF] resize-none border-none focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            disabled={preview}
          />

          <div className="flex items-center justify-center gap-2">
            {preview && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={handleSaveFormula} size="icon">
                      <CopyPlus />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Add formula to my collection</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {!preview && <ShareFormula initialData={initialData} />}
          </div>
        </div>

        <div className="mt-4">
          {materialsInFormula.length > 0 && (
            <div className="border shadow-sm rounded-md">
              <div className="relative w-full overflow-auto">
                <Table className="w-full caption-bottom text-sm">
                  <TableHeader className="[&>tr]:border-b">
                    <TableRow className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <TableHead className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                        Note
                      </TableHead>
                      <TableHead className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                        Material
                      </TableHead>
                      <TableHead className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                        Weight (g)
                      </TableHead>
                      <TableHead className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                        Concentration
                      </TableHead>
                      <TableHead className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                        Percentage
                      </TableHead>
                      <TableHead className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                        {/* Actions */}
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody className="[&>tr:last-child]:border-0">
                    {materialsInFormula.map((selectedMaterial, index) => {
                      const material = formulaMaterials?.find(
                        (m) => m._id === selectedMaterial.material
                      );
                      const isCompliant = ifraCompliant(
                        selectedMaterial,
                        totalWeight
                      );

                      if (!material) {
                        return null;
                      }

                      const pyramidValues = material.fragrancePyramid || [];
                      const selectedLevels = pyramidLevels.filter((level) =>
                        pyramidValues.includes(level.value)
                      );

                      const tooltipText =
                        selectedLevels
                          .map((level) => level.tooltip)
                          .join(" / ") + " Note";

                      return (
                        <TableRow
                          key={selectedMaterial.material}
                          className={cn(
                            "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
                            { "bg-red-100": !isCompliant }
                          )}
                        >
                          <TableCell className="text-sm p-4 align-middle">
                            {pyramidValues.length > 0 && (
                              <div className="flex items-center space-x-1">
                                <HoverCard>
                                  <HoverCardTrigger>
                                    <div className="flex items-center space-x-1">
                                      {selectedLevels.map((level, index) => (
                                        <div key={index} className="size-5">
                                          <Image
                                            alt={tooltipText}
                                            height={24}
                                            width={24}
                                            src={
                                              level.src[
                                                theme as keyof typeof level.src
                                              ] || level.src.light
                                            }
                                          />
                                        </div>
                                      ))}
                                    </div>
                                  </HoverCardTrigger>
                                  <HoverCardContent className="text-sm">
                                    {tooltipText}
                                  </HoverCardContent>
                                </HoverCard>
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-sm p-4 align-middle">
                            <div className="flex items-center">
                              <Popover>
                                <PopoverTrigger asChild>
                                  <div>{material.title}</div>
                                </PopoverTrigger>
                                <PopoverContent>
                                  <div>
                                    <span className="font-bold">
                                      {material.title}
                                    </span>
                                    <div className="flex items-center mt-2 ml-1">
                                      <span
                                        className="mr-1 h-2 w-2 rounded-full"
                                        style={{
                                          backgroundColor:
                                            material.category.color,
                                        }}
                                      ></span>
                                      <span
                                        className="text-sm font-semibold"
                                        style={{
                                          color: material.category.color,
                                        }}
                                      >
                                        {material.category.name}
                                      </span>
                                    </div>
                                    <div className="flex items-center mt-2 ml-1">
                                      {material.description && (
                                        <span className="text-sm">
                                          {material.description}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </PopoverContent>
                              </Popover>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm p-4 align-middle">
                            {preview ? (
                              <div>{selectedMaterial.weight}</div>
                            ) : (
                              <Input
                                type="number"
                                value={`${selectedMaterial.weight}`}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  if (/^\d*\.?\d*$/.test(value)) {
                                    updateMaterialWeight(
                                      index,
                                      value === "" ? 0 : Number(value)
                                    );
                                  }
                                }}
                              />
                            )}
                          </TableCell>
                          <TableCell className="text-sm p-4 align-middle">
                            {preview ? (
                              <div>{selectedMaterial.dilution}%</div>
                            ) : (
                              <Select
                                value={`${selectedMaterial.dilution}`}
                                onValueChange={(value) =>
                                  updateMaterialDilution(index, Number(value))
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {material.dilutions?.map((dilution) => (
                                    <SelectItem
                                      key={dilution}
                                      value={`${dilution}`}
                                    >
                                      {dilution}%
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          </TableCell>
                          <TableCell className="text-sm p-4 align-middle">
                            {totalWeight > 0
                              ? (
                                  (selectedMaterial.weight / totalWeight) *
                                  100
                                ).toFixed(2)
                              : 0}
                            %
                          </TableCell>
                          <TableCell className="p-4 align-middle">
                            {!preview && (
                              <Button
                                onClick={() => removeMaterial(index)}
                                className="rounded-full opacity-100 transition text-muted-foreground text-xs"
                                variant="outline"
                                size="icon"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}

                    {accordsInFormula.map((selectedAccord, index) => {
                      const accord = accords?.find(
                        (a) => a._id === selectedAccord.accord
                      );

                      if (!accord) {
                        return null;
                      }

                      return (
                        <TableRow
                          key={selectedAccord.accord}
                          className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                        >
                          <TableCell className="text-sm p-4 align-middle">
                            {/* Add accord note if applicable */}
                          </TableCell>
                          <TableCell className="text-sm p-4 align-middle">
                            <div className="flex items-center">
                              <Popover>
                                <PopoverTrigger asChild>
                                  <div>{accord.title}</div>
                                </PopoverTrigger>
                                <PopoverContent>
                                  <div>
                                    <span className="font-bold">
                                      {accord.title}
                                    </span>
                                  </div>
                                </PopoverContent>
                              </Popover>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm p-4 align-middle">
                            {preview ? (
                              <div>{selectedAccord.weight}</div>
                            ) : (
                              <Input
                                type="number"
                                value={`${selectedAccord.weight}`}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  if (/^\d*\.?\d*$/.test(value)) {
                                    updateAccordWeight(
                                      index,
                                      value === "" ? 0 : Number(value)
                                    );
                                  }
                                }}
                              />
                            )}
                          </TableCell>
                          <TableCell className="text-sm p-4 align-middle">
                            {accord.concentration}%
                          </TableCell>
                          <TableCell className="text-sm p-4 align-middle">
                            {totalWeight > 0
                              ? (
                                  (selectedAccord.weight / totalWeight) *
                                  100
                                ).toFixed(2)
                              : 0}
                            %
                          </TableCell>
                          <TableCell className="p-4 align-middle">
                            {!preview && (
                              <Button
                                onClick={() => removeAccord(index)}
                                className="rounded-full opacity-100 transition text-muted-foreground text-xs"
                                variant="outline"
                                size="icon"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}

                    <TableRow>
                      <TableCell></TableCell>
                      <TableCell className="text-sm font-medium">
                        <div className="flex items-center">
                          {initialData.solvent?.name || "Solvent"}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {preview ? (
                          <div>{solventWeight}</div>
                        ) : (
                          <Input
                            type="number"
                            value={`${solventWeight}`}
                            min={0}
                            onChange={(e) =>
                              setSolventWeight(Number(e.target.value))
                            }
                          />
                        )}
                      </TableCell>
                      <TableCell className="text-sm font-medium"></TableCell>
                      <TableCell className="text-sm">
                        {totalWeight > 0
                          ? ((solventWeight / totalWeight) * 100).toFixed(2)
                          : 0}
                        %
                      </TableCell>
                      <TableCell />
                    </TableRow>
                    <TableRow>
                      <TableCell></TableCell>
                      <TableCell className="text-sm font-bold">Final</TableCell>
                      <TableCell className="text-sm">
                        <Dialog open={scaleOpen} onOpenChange={setScaleOpen}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="font-bold"
                              disabled={totalWeight === 0 || preview}
                            >
                              {totalWeight} g
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[225px]">
                            <DialogHeader>
                              <DialogTitle>Scale Formula</DialogTitle>
                            </DialogHeader>
                            <div className="flex flex-col space-y-4">
                              <label htmlFor="scaleInput" className="text-sm">
                                Scale formula to total weight (g):
                              </label>
                              <Input
                                id="scaleInput"
                                type="number"
                                value={scaleValue}
                                onChange={(e) => setScaleValue(e.target.value)}
                                className="w-full"
                              />
                              <div className="flex justify-between">
                                <DialogClose asChild>
                                  <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                  >
                                    Close
                                  </Button>
                                </DialogClose>
                                <Button
                                  type="button"
                                  onClick={handleScaleSubmit}
                                  variant="secondary"
                                  size="sm"
                                >
                                  Scale
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                      <TableCell className="text-sm">
                        <Dialog
                          open={dilutionScaleOpen}
                          onOpenChange={setDilutionScaleOpen}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="font-bold"
                              disabled={totalMaterialWeight === 0 || preview}
                            >
                              {finalDilution.toFixed(2)}%
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[225px]">
                            <DialogHeader>
                              <DialogTitle>
                                Scale to final concentration (%):
                              </DialogTitle>
                            </DialogHeader>
                            <div className="flex flex-col space-y-4">
                              <Input
                                id="dilutionScaleInput"
                                type="number"
                                min={0}
                                value={dilutionScaleValue}
                                onChange={(e) =>
                                  setDilutionScaleValue(e.target.value)
                                }
                                className="w-full"
                              />
                              <div className="flex justify-between">
                                <DialogClose asChild>
                                  <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                  >
                                    Close
                                  </Button>
                                </DialogClose>
                                <Button
                                  type="button"
                                  onClick={handleDilutionScaleSubmit}
                                  variant="secondary"
                                  size="sm"
                                >
                                  Scale
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                      <TableCell className="text-sm font-bold">100%</TableCell>
                      <TableCell />
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Add Material */}
          {!preview && (
            <div className="mt-4 flex gap-2">
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild onTouchStart={() => setOpen(!open)}>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                  >
                    <div className="flex justify-center items-center">
                      <CirclePlusIcon className="size-4 mr-2" />
                      add material/accord
                    </div>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput
                      placeholder="Search material or accord..."
                      className="h-9"
                    />
                    <CommandList>
                      <CommandEmpty>
                        No materials or accords found.
                      </CommandEmpty>
                      <CommandGroup heading="Materials">
                        {materialsToAdd?.map((material) => (
                          <CommandItem
                            key={material._id}
                            value={material.title}
                            onSelect={() => {
                              addMaterial(material);
                              setOpen(false);
                            }}
                          >
                            <span
                              className="mr-2 h-2 w-2 rounded-full"
                              style={{
                                backgroundColor: material.category.color,
                              }}
                            ></span>
                            {material.title}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                      <CommandGroup heading="Accords">
                        {accords?.map((accord) => (
                          <CommandItem
                            key={accord._id}
                            value={accord.title}
                            onSelect={() => {
                              addAccord(accord);
                              setOpen(false);
                            }}
                          >
                            {accord.title}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          )}

          {/* Note */}
          <div className="grid w-full gap-1.5 mt-4">
            <Label htmlFor="message">Note:</Label>
            <Textarea
              placeholder="Add a note to your formula..."
              id="message"
              value={note}
              onChange={updateNote}
              disabled={preview}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
