import { Label } from "@/components/ui/label";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusIcon, MinusIcon } from "lucide-react";

interface DilutionsFieldProps {
  dilutions: number[];
  onChange: (dilutions: number[]) => void;
}

export const DilutionsField: React.FC<DilutionsFieldProps> = ({
  dilutions,
  onChange,
}) => (
  <div>
    <Label className="mb-1 block text-sm font-medium">My Dilutions</Label>
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="flex flex-col gap-y-2">
          <div className="flex items-center">
            <div className="relative flex-1">
              <Input type="number" value={100} disabled />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </div>
          </div>
          {dilutions.map((dilution, index) => (
            <div key={index} className="flex items-center">
              <div className="relative flex-1">
                <Input
                  type="number"
                  placeholder="Dilution"
                  min={0}
                  max={100}
                  value={`${dilution}`}
                  onChange={(e) => {
                    const newValue =
                      e.target.value === ""
                        ? 0
                        : Math.min(100, Math.max(0, Number(e.target.value)));
                    const newDilutions = [...dilutions];
                    newDilutions[index] = newValue;
                    onChange(newDilutions);
                  }}
                  onBlur={(e) => {
                    const newValue = Math.min(
                      100,
                      Math.max(0, Number(e.target.value))
                    );
                    const newDilutions = [...dilutions];
                    newDilutions[index] = newValue;
                    onChange(newDilutions);
                  }}
                  className="-webkit-inner-spin-button: pr-8"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  const newDilutions = [...dilutions];
                  newDilutions.splice(index, 1);
                  onChange(newDilutions);
                }}
                className="ml-2"
              >
                <MinusIcon className="h-3 w-3" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onChange([...dilutions, 10])}
          >
            <PlusIcon className="h-3 w-3 mr-1" />
            Add Dilution
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  </div>
);
