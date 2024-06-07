"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useState } from "react";

import {
  bisectionXm,
  falsiXm,
  parseEquation,
  roundOff,
} from "@/functions/root-finding";

interface IterationType {
  xl: number;
  xm: number;
  xr: number;
  yl: number;
  ym: number;
  yr: number;
  equation?: string;
}

interface Types {
  rootFinding: "bisection" | "falsi" | "newton" | "secant";
}

const COLUMNS = ["i", "XL", "Xm", "XR", "YL", "Ym", "YR"];

const BisectionFalsi = ({
  setType,
  type,
  handleOpen,
  open
}: {
  setType: (type: Types["rootFinding"]) => void;
  type: Types["rootFinding"];
  handleOpen: () => void;
  open: boolean
}) => {
  const [computation, setComputation] = useState<IterationType[]>([]);
  const [roundoff, setRoundOff] = useState(4);

  const formSchema = z
    .object({
      equation: z
        .string()
        .min(2, { message: "Invalid equation" })
        .max(50, { message: "Invalid equation" }),
      xl: z.coerce.number(),
      xr: z.coerce.number(),
      precision: z.coerce.number(),
    })
    .superRefine((data, ctx) => {
      if (data.xl >= data.xr) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "xl must be less than xr",
          path: ["xl"],
        });
      }
    });

  function areOppositeSigns(num1: number, num2: number) {
    return num1 * num2 < 0;
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      equation: "",
      xl: 0,
      xr: 0,
      precision: 0.1,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values.equation);
    setComputation([]);

    const xl_equation = parseEquation(values.equation, values.xl);
    const xr_equation = parseEquation(values.equation, values.xr);

    const xl = values.xl;
    const xr = values.xr;

    const yl = eval(xl_equation);
    const yr = eval(xr_equation);

    const xm =
      type === "bisection"
        ? bisectionXm(xl, xr)
        : falsiXm({
            xl: xl,
            xr: xr,
            yl: yl,
            yr: yr,
          });

    const ym = eval(parseEquation(values.equation, xm));

    const fxl = roundOff(xl, roundoff);
    const fxm = roundOff(xm, roundoff);
    const fxr = roundOff(xr, roundoff);
    const fyl = roundOff(yl, roundoff);
    const fym = roundOff(ym, roundoff);
    const fyr = roundOff(yr, roundoff);

    const isRight = areOppositeSigns(fym, fyr);

    setComputation((prev) => [
      {
        xl: fxl,
        xm: fxm,
        xr: fxr,
        yl: fyl,
        ym: fym,
        yr: fyr,
      },
    ]);

    const new_xm =
      type === "bisection"
        ? bisectionXm(fxl, fxr)
        : falsiXm({
            xl: fxl,
            xr: fxr,
            yl: fyl,
            yr: fyr,
          });

    const new_ym = eval(parseEquation(values.equation, new_xm));

    const parsed_ym = roundOff(new_ym, roundoff);
    const parsed_xm = roundOff(new_xm, roundoff);

    Iterate({
      xl: isRight ? parsed_xm : fxl,
      xm: parsed_xm,
      xr: isRight ? fxr : parsed_xm,
      yl: isRight ? parsed_ym : fyl,
      ym: parsed_ym,
      yr: isRight ? fyr : parsed_ym,
      equation: values.equation,
    });
  }

  const Iterate = ({ xl, xm, xr, yl, ym, yr, equation }: IterationType) => {
    const intervalId = setTimeout(() => {
      iterate_func();
    }, 400);

    const iterate_func = () => {
      const fxl = roundOff(xl, roundoff);
      const fxm = roundOff(xm, roundoff);
      const fxr = roundOff(xr, roundoff);
      const fyl = roundOff(yl, roundoff);
      const fym = roundOff(ym, roundoff);
      const fyr = roundOff(yr, roundoff);

      const new_xm =
        type === "bisection"
          ? bisectionXm(fxl, fxr)
          : falsiXm({
              xl: fxl,
              xr: fxr,
              yl: fyl,
              yr: fyr,
            });

      const new_ym = eval(parseEquation(equation!, new_xm));

      const parsed_ym = roundOff(new_ym, roundoff);
      const parsed_xm = roundOff(new_xm, roundoff);

      const isRight = areOppositeSigns(parsed_ym, fyr);

      setComputation((prev) => [
        ...prev,
        {
          xl: fxl,
          xm: parsed_xm,
          xr: fxr,
          yl: fyl,
          ym: parsed_ym,
          yr: fyr,
        },
      ]);

      if (
        parsed_ym === 0 ||
        Math.abs(parsed_ym - fym) < form.getValues("precision")
      ) {
        return;
      }

      Iterate({
        xl: isRight ? parsed_xm : fxl,
        xm: parsed_xm,
        xr: isRight ? fxr : parsed_xm,
        yl: isRight ? parsed_ym : fyl,
        ym: parsed_ym,
        yr: isRight ? fyr : parsed_ym,
        equation: equation,
      });
    };
  };

  return (
    <div className="">
      <div className="w-full bg-primary/90 text-white pt-4">
        <div className="max-w-screen-md mx-auto sm:p-10 p-6 ">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 ">
              <div className="flex">
                <FormField
                  control={form.control}
                  name="equation"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormControl>
                        <Input
                          placeholder="Enter equation"
                          onFocus={() => handleOpen()}
                          autoComplete="off"
                          className="sm:py-8 py-6 text-lg sm:text-xl text-black rounded-tr-none rounded-br-none drop-shadow-md"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-orange-100" />
                    </FormItem>
                  )}
                />

                <Button className="h-fullh h-auto px-6 rounded-tl-none rounded-bl-none drop-shadow-md">
                  Go
                </Button>
              </div>
              <div
                className={cn(
                  "w-full space-y-3 items-end max-h-0 overflow-hidden transition-all ease-in-out duration-300",
                  {
                    "max-h-96": open,
                  }
                )}
              >
                <div className="w-full flex gap-3">
                  <FormField
                    control={form.control}
                    name="xl"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel className="!text-white">
                          Initial Value for X
                          <span
                            style={{ verticalAlign: "sub" }}
                            className="text-xs"
                          >
                            L
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="0"
                            className="text-black"
                            type={"number"}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-orange-100" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="xr"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>
                          Initial Value for X
                          <span
                            style={{ verticalAlign: "sub" }}
                            className="text-xs"
                          >
                            R
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="0"
                            className="text-black"
                            type={"number"}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="w-full flex gap-3 items-end ">
                  <FormField
                    control={form.control}
                    name="precision"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>Precision</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="0.1"
                            className="text-black"
                            type={"number"}
                            {...field}
                            defaultValue={0.1}
                            step={0.1}
                            min={0.1}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="w-full space-y-2">
                    <Label className="">Round off</Label>
                    <Select onValueChange={(val) => setRoundOff(parseInt(val))}>
                      <SelectTrigger className="w-full text-black">
                        <SelectValue className="text-black" placeholder="4" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                        <SelectItem value="5">5</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="w-full space-y-2">
                    <Label className="">Root finding type</Label>

                    <Select
                      onValueChange={(val) =>
                        setType(val as Types["rootFinding"])
                      }
                    >
                      <SelectTrigger className="w-full text-black">
                        <SelectValue
                          className="text-black"
                          placeholder={type.charAt(0).toUpperCase() + type.slice(1)}
                        />
                      </SelectTrigger>
                      <SelectContent defaultValue={type}>
                        <SelectItem value="bisection">Bisection</SelectItem>
                        <SelectItem value="falsi">Falsi</SelectItem>
                        <SelectItem value="newton">
                          Newton Raphson
                        </SelectItem>
                        <SelectItem value="secant" disabled>
                          Secant
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </div>

      <div
        className={cn("max-w-screen-md mx-auto sm:p-10 p-6 hidden", {
          block: computation.length > 0,
        })}
      >
        <div className="mt-5">
          <h1 className="text-lg font-medium text-center">Computation</h1>
          <div className="mt-4">
            <ul className="w-full flex justify-between">
              {COLUMNS.map((item) => (
                <li className="w-full border text-center" key={item}>
                  {item.slice(0, 1)}
                  <span style={{ verticalAlign: "sub" }} className="text-xs">
                    {item.slice(1, 2)}
                  </span>
                </li>
              ))}
            </ul>
            <ul className="flex flex-col divide-y border-x border-b">
              {computation.map((items, index) => (
                <div
                  key={index}
                  className="flex justify-between text-black/70 text-xs sm:text-sm"
                >
                  <li className="w-full text-center py-3">{index + 1}</li>
                  {Object.keys(items).map((key, i) => (
                    <h1 className="w-full text-center py-3" key={i}>
                      {items[key as keyof IterationType]}
                    </h1>
                  ))}
                </div>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BisectionFalsi;
