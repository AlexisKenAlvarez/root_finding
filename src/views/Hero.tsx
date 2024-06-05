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

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";

import { useState } from "react";
import React from "react";

interface IterationType {
  xl: number;
  xm: number;
  xr: number;
  yl: number;
  ym: number;
  yr: number;
  equation?: string;
}

const Hero = () => {
  const [computation, setComputation] = useState<IterationType[]>([]);
  const iter = computation.length > 0;

  const formSchema = z
    .object({
      equation: z
        .string()
        .min(2, { message: "Invalid equation" })
        .max(50, { message: "Invalid equation" }),
      xl: z.coerce.number(),
      xr: z.coerce.number(),
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

  function areOppositeSigns(num1, num2) {
    return num1 * num2 < 0;
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      equation: "",
      xl: 0,
      xr: 0,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const xl_equation = values.equation
      .toLowerCase()
      .replace(/\^/g, "**")
      .replace(/x/g, `(${values.xl})`)
      .replace(/(\d)\(/g, "$1*(")
      .replace(/\)(\d)/g, ")*$1");

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

    const xm = (xl + xr) / 2;

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

    const isRight = (yl ^ ym) > 0;

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

    const new_xm = (fxl + fxr) / 2;

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
      const fxl = parseFloat(Number(xl).toFixed(4));
      const fxm = parseFloat(Number(xm).toFixed(4));
      const fxr = parseFloat(Number(xr).toFixed(4));
      const fyl = parseFloat(Number(yl).toFixed(4));
      const fym = parseFloat(Number(ym).toFixed(4));
      const fyr = parseFloat(Number(yr).toFixed(4));

      const new_xm = (fxl + fxr) / 2;

      const new_ym = eval(
        equation!
          .toLowerCase()
          .replace(/\^/g, "**")
          .replace(/x/g, `(${new_xm})`)
          .replace(/(\d)\(/g, "$1*(")
          .replace(/\)(\d)/g, ")*$1")
      );

      const parsed_ym = parseFloat(Number(new_ym).toFixed(4));
      const parsed_xm = parseFloat(Number(new_xm).toFixed(4));

      const isRight = areOppositeSigns(parsed_ym, fyr);
      console.log("🚀 ~ Iterate ~ isRight:", parsed_ym, fyr, isRight);

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

      if (parsed_ym === 0 || Math.abs(parsed_ym - fym) < 0.1) {
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
    <div>
      <h1 className="">Bisection method</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 ">
          <FormField
            control={form.control}
            name="equation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Equation</FormLabel>
                <FormControl>
                  <Input placeholder="x^2 - 4x + 4" {...field} />
                </FormControl>
                <FormDescription>Enter Equation</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex w-full gap-3">
            <FormField
              control={form.control}
              name="xl"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>
                    Initial Value for X
                    <span style={{ verticalAlign: "sub" }} className="text-xs">
                      L
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="0" type={"number"} {...field} />
                  </FormControl>
                  <FormMessage />
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
                    <span style={{ verticalAlign: "sub" }} className="text-xs">
                      R
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="0" type={"number"} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="submit">Submit</Button>
        </form>
      </Form>
      <div className="mt-10">
        <h1 className="">Computation</h1>
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
                className="flex justify-between text-black/70 text-sm"
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
  );
};

const COLUMNS = ["i", "XL", "Xm", "XR", "YL", "Ym", "YR"];

export default Hero;
