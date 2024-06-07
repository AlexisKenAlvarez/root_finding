"use client";

import { Button } from "@/components/ui/button";
import {
  atan2,
  chain,
  derivative,
  e,
  evaluate,
  log,
  pi,
  pow,
  round,
  sqrt,
} from "mathjs";

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
import { getFx, roundOff, toDerivative } from "@/functions/root-finding";

interface IterationType {
  x: number;
  fx: number;
  fx_prime: number;
  rel: string;
  equation?: string;
}

interface Types {
  rootFinding: "bisection" | "falsi" | "newton" | "secant";
}

const COLUMNS = ["i", "x", "f(x)", "f'(x)", "rel"];

const NewtonSecant = ({
  setType,
  type,
  open,
  handleOpen,
}: {
  setType: (type: Types["rootFinding"]) => void;
  type: Types["rootFinding"];
  handleOpen: () => void;
  open: boolean;
}) => {
  const [computation, setComputation] = useState<IterationType[]>([]);
  const [roundoff, setRound] = useState(4);

  const formSchema = z.object({
    equation: z
      .string()
      .min(2, { message: "Invalid equation" })
      .max(50, { message: "Invalid equation" }),
    xo: z.coerce.number(),
    precision: z.coerce.number(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      equation: "",
      xo: 0,
      precision: 0.1,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setComputation([]);

    const fx = getFx(values.equation, values.xo);

    const fx_prime = toDerivative(values.equation, values.xo);

    const next_x = values.xo - fx / fx_prime;
    const rel = ((next_x - values.xo) / next_x) * 100;

    setComputation((prev) => [
      ...prev,
      {
        x: values.xo,
        fx,
        fx_prime,
        rel: "0%",
      },
    ]);

    Iterate({
      x: round(next_x, roundoff),
      fx: round(getFx(values.equation, next_x), roundoff),
      fx_prime: round(toDerivative(values.equation, next_x), roundoff),
      equation: values.equation,
      rel,
    });
  }

  const Iterate = ({
    x,
    fx,
    fx_prime,
    equation,
    rel,
  }: {
    x: number;
    fx: number;
    fx_prime: number;
    equation: string;
    rel: number;
  }) => {
    const intervalId = setTimeout(() => {
      iterate_func();
    }, 400);

    const iterate_func = () => {
      const next_x = x - fx / fx_prime;

      setComputation((prev) => [
        ...prev,
        {
          x: round(x, roundoff),
          fx: round(fx, roundoff),
          fx_prime: round(fx_prime, roundoff),
          rel: `${Math.abs(round(rel, 3))}%`,
        },
      ]);
      const new_rel = ((next_x - x) / next_x) * 100;

      const condition = Math.abs(round(rel, 2)) < form.getValues("precision");

      if (condition) {
        clearTimeout(intervalId);
        return;
      }

      Iterate({
        x: round(next_x, roundoff),
        fx: round(getFx(equation, next_x), roundoff),
        fx_prime: round(toDerivative(equation, next_x), roundoff),
        equation: equation,
        rel: Math.abs(round(new_rel, 3)),
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
                    name="xo"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel className="!text-white">
                          Initial Value for X<sub className="text-xs">o</sub>
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
                    <Label className="">Root finding type</Label>

                    <Select
                      onValueChange={(val) =>
                        setType(val as Types["rootFinding"])
                      }
                    >
                      <SelectTrigger className="w-full text-black">
                        <SelectValue
                          className="text-black"
                          placeholder={
                            type.charAt(0).toUpperCase() + type.slice(1)
                          }
                        />
                      </SelectTrigger>
                      <SelectContent defaultValue={type}>
                        <SelectItem value="bisection">Bisection</SelectItem>
                        <SelectItem value="falsi">Falsi</SelectItem>
                        <SelectItem value="newton">Newton Raphson</SelectItem>
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
                  {item}
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

export default NewtonSecant;
