import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const RoundoffDropdown = ({
  value,
  setRoundOff
}: {
  value: number,
  setRoundOff: (val: number) => void;
}) => {
  return (
    <div className="w-full space-y-2">
      <Label className="">Round off</Label>
      <Select onValueChange={(val) => setRoundOff(parseInt(val))} defaultValue={value.toString()}>
        <SelectTrigger className="w-full text-black" defaultValue={value}>
          <SelectValue className="text-black" placeholder="4" />
        </SelectTrigger>
        <SelectContent defaultValue={value}>
          <SelectItem value="15">None</SelectItem>
          <SelectItem value="1">1</SelectItem>
          <SelectItem value="2">2</SelectItem>
          <SelectItem value="3">3</SelectItem>
          <SelectItem value="4">4</SelectItem>
          <SelectItem value="5">5</SelectItem>
          <SelectItem value="6">6</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default RoundoffDropdown;
