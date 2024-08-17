import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface IFRALimitFieldProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export const IFRALimitField: React.FC<IFRALimitFieldProps> = ({
  value,
  onChange,
  disabled,
}) => (
  <div>
    <Label className="mb-1 block text-sm font-medium">IFRA Limit</Label>
    <div className="relative flex-1">
      <Input
        type="number"
        min={0}
        max={100}
        value={`${value}`}
        disabled={disabled}
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
        placeholder="IFRA Limit"
      />
      <div className="absolute inset-y-0 right-5 flex items-center pr-3 pointer-events-none">
        <span className="text-sm text-muted-foreground">%</span>
      </div>
    </div>
  </div>
);
