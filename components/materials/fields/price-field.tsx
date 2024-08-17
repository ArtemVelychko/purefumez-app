import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface PriceFieldProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export const PriceField: React.FC<PriceFieldProps> = ({
  value,
  onChange,
  disabled,
}) => (
  <div>
    <Label className="mb-1 block text-sm font-medium">Cost</Label>
    <div className="relative flex-1">
      <Input
        type="number"
        min={0}
        value={`${value}`}
        onChange={(e) => {
          const newValue =
            e.target.value === ""
              ? 0
              : Math.min(100, Math.max(0, Number(e.target.value)));
          onChange(newValue);
        }}
        onBlur={(e) => {
          const newValue = Math.min(100, Math.max(0, Number(e.target.value)));
          onChange(newValue);
        }}
        placeholder="Price (per g)"
        disabled={disabled}
      />
      <div className="absolute inset-y-0 right-5 flex items-center pr-3 pointer-events-none">
        <span className="text-sm text-muted-foreground">$/g</span>
      </div>
    </div>
  </div>
);
