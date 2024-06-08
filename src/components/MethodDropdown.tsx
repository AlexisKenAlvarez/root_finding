import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Types } from "@/lib/types";


const MethodDropdown = ({
  type,
  setType
}: {
  type: Types["rootFinding"];
  setType: (type: Types["rootFinding"]) => void;
}) => {
  return (
    <div className="w-full space-y-2">
      <Label className="">Method</Label>

      <Select onValueChange={(val) => setType(val as Types["rootFinding"])}>
        <SelectTrigger className="w-full text-black">
          <SelectValue
            className="text-black"
            placeholder={type.charAt(0).toUpperCase() + type.slice(1)}
          />
        </SelectTrigger>
        <SelectContent defaultValue={type}>
          <SelectItem value="bisection">Bisection</SelectItem>
          <SelectItem value="false Position">False position</SelectItem>
          <SelectItem value="newton Raphson">Newton Raphson</SelectItem>
          <SelectItem value="secant">Secant</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default MethodDropdown;
