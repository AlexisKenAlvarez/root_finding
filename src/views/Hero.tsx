"use client";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";

import { useState } from "react";
import React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

import Lottie from "lottie-react";
import fast from "@/assets/fast.json";
import accurate from "@/assets/accurate.json";
import reliable from "@/assets/reliable.json";
import { bisectionXm, falsiXm } from "@/functions/root-finding";

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

const Hero = () => {
  const [computation, setComputation] = useState<IterationType[]>([]);
  const [clicked, setClicked] = useState(false);
  const [type, setType] = useState<Types["rootFinding"]>("bisection");
  console.log("🚀 ~ Hero ~ type:", type)
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

    const xl_equation = values.equation
      .toLowerCase()
      .replace(/\^/g, "**")
      .replace(/x/g, `(${values.xl})`)
      .replace(/(\d)\(/g, "$1*(")
      .replace(/\)(\d)/g, ")*$1");
    console.log("🚀 ~ onSubmit ~ xl_equation:", xl_equation)

    const xr_equation = values.equation
      .toLowerCase()
      .replace(/\^/g, "**")
      .replace(/x/g, `(${values.xr})`)
      .replace(/(\d)\(/g, "$1*(")
      .replace(/\)(\d)/g, ")*$1");

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

    const ym = eval(
      values.equation
        .toLowerCase()
        .replace(/\^/g, "**")
        .replace(/x/g, `(${xm})`)
        .replace(/(\d)\(/g, "$1*(")
        .replace(/\)(\d)/g, ")*$1")
    );
    const fxl = parseFloat(Number(xl).toFixed(4));
    const fxm = parseFloat(Number(xm).toFixed(4));
    const fxr = parseFloat(Number(xr).toFixed(4));
    const fyl = parseFloat(Number(yl).toFixed(4));
    const fym = parseFloat(Number(ym).toFixed(4));
    const fyr = parseFloat(Number(yr).toFixed(4));

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

    const new_ym = eval(
      values.equation
        .toLowerCase()
        .replace(/\^/g, "**")
        .replace(/x/g, `(${new_xm})`)
        .replace(/(\d)\(/g, "$1*(")
        .replace(/\)(\d)/g, ")*$1")
    );

    const parsed_ym = parseFloat(Number(new_ym).toFixed(4));
    const parsed_xm = parseFloat(Number(new_xm).toFixed(4));

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
      const fxl = parseFloat(Number(xl).toFixed(roundoff));
      const fxm = parseFloat(Number(xm).toFixed(roundoff));
      const fxr = parseFloat(Number(xr).toFixed(roundoff));
      const fyl = parseFloat(Number(yl).toFixed(roundoff));
      const fym = parseFloat(Number(ym).toFixed(roundoff));
      const fyr = parseFloat(Number(yr).toFixed(roundoff));

      const new_xm =
        type === "bisection"
          ? bisectionXm(fxl, fxr)
          : falsiXm({
              xl: fxl,
              xr: fxr,
              yl: fyl,
              yr: fyr,
            });

      const new_ym = eval(
        equation!
          .toLowerCase()
          .replace(/\^/g, "**")
          .replace(/x/g, `(${new_xm})`)
          .replace(/(\d)\(/g, "$1*(")
          .replace(/\)(\d)/g, ")*$1")
      );

      const parsed_ym = parseFloat(Number(new_ym).toFixed(roundoff));
      const parsed_xm = parseFloat(Number(new_xm).toFixed(roundoff));

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
                          onFocus={() => setClicked(true)}
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
                    "max-h-96": clicked,
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
                          placeholder="Bisection"
                        />
                      </SelectTrigger>
                      <SelectContent defaultValue={"bisection"}>
                        <SelectItem value="bisection">Bisection</SelectItem>
                        <SelectItem value="falsi">Falsi</SelectItem>
                        <SelectItem value="newton" disabled>
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

      <div className="max-w-screen-lg mx-auto sm:p-10 p-6">
        <h1 className="md:text-2xl text-xl font-bold text-center">
          RootFinder, Making root finding easier.
        </h1>

        <div className="flex justify-center sm:flex-row flex-col gap-5 sm:gap-10 lg:gap-20 mt-10">
          {FEATUERS.map((item) => (
            <div key={item.title}>
              <div
                className="w-full max-w-44 sm:max-w-full h-fit rounded-lg mx-auto"
                style={{ backgroundColor: item.bg }}
              >
                <Lottie animationData={item.icon} loop={true} />
              </div>
              <div className="text-center mt-6">
                <h1 className="text-lg font-medium">{item.title}</h1>

                <p className="mt-2 text-sm opacity-70 max-w-sm mx-auto">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const FEATUERS = [
  {
    title: "Fast",
    desc: "Ensuring that calculations are performed quickly to save you valuable time.",
    icon: fast,
    bg: "#22c55e",
  },

  {
    title: "Accurate",
    desc: "Achieve high accuracy, providing precise solutions to your equations.",
    icon: accurate,
    bg: "#22d3ee",
  },
  {
    title: "Reliable",
    desc: "Utilize the root finding methods for their robust and reliable approach.",
    icon: reliable,
    bg: "#3b82f6",
  },
];

const COLUMNS = ["i", "XL", "Xm", "XR", "YL", "Ym", "YR"];

export default Hero;
