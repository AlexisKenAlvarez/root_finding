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

import { bisectionXm, falsiXm, getFx } from "@/functions/root-finding";
import { evaluate, round } from "mathjs";
import MethodDropdown from "./MethodDropdown";
import RoundoffDropdown from "./RoundoffDropdown";
import { Types } from "@/lib/types";

interface IterationType {
  xl: number;
  xm: number;
  xr: number;
  yl: number;
  ym: number;
  yr: number;
  equation?: string;
}

const COLUMNS = ["i", "XL", "Xm", "XR", "YL", "Ym", "YR"];

const BisectionFalsi = ({
  setType,
  type,
  handleOpen,
  open,
  roundoff,
  handleRound,
}: {
  setType: (type: Types["rootFinding"]) => void;
  type: Types["rootFinding"];
  handleOpen: () => void;
  open: boolean;
  roundoff: number;
  handleRound: (round_value: number) => void;
}) => {
  const [computation, setComputation] = useState<IterationType[]>([]);
  const [invalid, setInvalid] = useState("");

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
        setInvalid("xl must be less than xr");

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
    try {
      setComputation([]);
      setInvalid("");

      const { xl, xr, equation } = values;

      const yl = getFx(equation, xl);
      const yr = getFx(equation, xr);

      if (!areOppositeSigns(yl, yr)) {
        setInvalid("Signs of f(xl) and f(xr) must be opposite");
        return;
      }

      const xm =
        type === "bisection"
          ? bisectionXm(xl, xr)
          : falsiXm({
              xl: xl,
              xr: xr,
              yl: yl,
              yr: yr,
            });

      const ym = getFx(equation, xm);

      const fxl = round(xl, roundoff);
      const fxm = round(xm, roundoff);
      const fxr = round(xr, roundoff);
      const fyl = round(yl, roundoff);
      const fym = round(ym, roundoff);
      const fyr = round(yr, roundoff);

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

      const new_ym = getFx(equation, new_xm);

      const parsed_ym = round(new_ym, roundoff);
      const parsed_xm = round(new_xm, roundoff);

      Iterate({
        xl: isRight ? parsed_xm : fxl,
        xm: parsed_xm,
        xr: isRight ? fxr : parsed_xm,
        yl: isRight ? parsed_ym : fyl,
        ym: parsed_ym,
        yr: isRight ? fyr : parsed_ym,
        equation: equation,
      });
    } catch (error) {
      console.log(error);
      form.setError("equation", {
        message: "Invalid equation",
      });
    }
  }

  const Iterate = ({ xl, xm, xr, yl, ym, yr, equation }: IterationType) => {
    const fxl = round(xl, roundoff);
    const fxm = round(xm, roundoff);
    const fxr = round(xr, roundoff);
    const fyl = round(yl, roundoff);
    const fym = round(ym, roundoff);
    const fyr = round(yr, roundoff);

    const new_xm =
      type === "bisection"
        ? bisectionXm(fxl, fxr)
        : falsiXm({
            xl: fxl,
            xr: fxr,
            yl: fyl,
            yr: fyr,
          });

    const new_ym = getFx(equation!, new_xm);

    const parsed_ym = round(new_ym, roundoff);
    const parsed_xm = round(new_xm, roundoff);

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

  return (
    <div className="">
      <div className="w-full bg-primary/90 text-white">
        <div className="max-w-screen-md mx-auto sm:pb-10 bp-6 ">
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

                <Button className="h-16 px-6 rounded-tl-none rounded-bl-none drop-shadow-md">
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

                  <RoundoffDropdown
                    setRoundOff={handleRound}
                    value={roundoff}
                  />

                  <MethodDropdown type={type} setType={setType} />
                </div>
              </div>
            </form>
          </Form>
        </div>
      </div>

      <div
        className={cn("max-w-screen-md mx-auto sm:p-10 p-6 hidden", {
          block: invalid !== "",
        })}
      >
        <div className="mt-5 text-center">
          <h1 className="">Validty of assumptions: False</h1>
          <p className="">Reason: {invalid}</p>
        </div>
      </div>

      <div
        className={cn("max-w-screen-md mx-auto sm:p-10 p-6 hidden", {
          block: computation.length > 0,
        })}
      >
        <div className="mt-5">
          <h1 className="text-lg font-medium text-center">Iteration</h1>
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
          <div className="mt-2 rounded-md py-3 px-2 w-fit mx-auto flex items-center gap-1">
            <h1 className="font-medium">Root Value:</h1>
            <h2 className="font-bold text-sm bg-slate-100 py-2 px-3 rounded-md text-primary">
              {computation[computation.length - 1]?.xm}
            </h2>
          </div>

          <h1 className="text-center">Validty of assumptions: All condition have been passed.</h1>
        </div>
      </div>
    </div>
  );
};

export default BisectionFalsi;
