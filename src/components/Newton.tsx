"use client";

import { Button } from "@/components/ui/button";
import { round } from "mathjs";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";

import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { getFx, toDerivative } from "@/functions/root-finding";
import { Types } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useState } from "react";
import MethodDropdown from "./MethodDropdown";
import RoundoffDropdown from "./RoundoffDropdown";

interface IterationType {
  x: number;
  fx: number;
  fx_prime: number;
  rel: string;
  equation?: string;
}

interface StepType {
  title: string;
  value: string;
  iteration: number
}

const COLUMNS = ["i", "x", "f(x)", "f'(x)", "rel"];

const Newton = ({
  setType,
  type,
  open,
  handleOpen,
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
  const [step, setStep] = useState<StepType[]>([]);

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
    try {
      setComputation([]);
      const { xo, equation } = values;

      const fx = round(getFx(equation, xo), roundoff);

      const fx_prime = round(toDerivative(equation, xo), roundoff);

      const next_x = xo - fx / fx_prime;

      setStep((prev) => [
        ...prev,
        {
          title: "To solve for next x",
          value: `xi+1(Next x) = x - f(x) / f'(x) = ${xo} - ${fx} / ${fx_prime} = ${next_x}`,
          iteration: 2
        },
      ]);

      const rel = ((next_x - xo) / next_x) * 100;

      setStep((prev) => [
        ...prev, {
          title: "For the next f(x)",
          value: `f(x) = ${equation.replaceAll("x", `(${round(next_x, roundoff)})`)} = ${round(getFx(equation, round(next_x, roundoff)), roundoff)}`,
          iteration: 2
        }
      ])
  
      setStep((prev) => [
        ...prev, {
          title: "For the next f'(x)",
          value: `f'(x) Just substitute x to derivative = ${round(toDerivative(equation, next_x), 4)}`,
          iteration: 2
        }
      ])

      setStep((prev) => [
        ...prev,
        {
          title: "For the next relative error",
          value: `Relative error = (next_x - x) / next_x * 100 \n Relative error = (${next_x} - ${xo}) / ${next_x} * 100 \n Relative error = ${Math.abs(
            round(rel, 2)
          )}%`,
          iteration: 2
        },
      ]);

      setComputation((prev) => [
        ...prev,
        {
          x: xo,
          fx,
          fx_prime,
          rel: "N/A",
        },
      ]);

      Iterate({
        x: round(next_x, roundoff),
        fx: round(getFx(equation, next_x), roundoff),
        fx_prime: round(toDerivative(equation, next_x), roundoff),
        equation: equation,
        rel,
      });
    } catch (error) {
      console.log("Invalid equation");
      form.setError("equation", { message: "Invalid equation" });
    }
  }

  const Iterate = ({
    x,
    fx,
    fx_prime,
    equation,
    rel,
    iteration = 3
  }: {
    x: number;
    fx: number;
    fx_prime: number;
    equation: string;
    rel: number;
    iteration?: number
  }) => {
    const next_x = round(x - fx / fx_prime, roundoff)

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
      return;
    }

    setStep((prev) => [
      ...prev,
      {
        title: "To solve for next x",
        value: `xi+1(Next x) = x - f(x) / f'(x) = ${x} - ${fx} / ${round(fx_prime, roundoff)} = ${next_x}`,
        iteration
      },
    ]);

    setStep((prev) => [
      ...prev, {
        title: "For the next f(x)",
        value: `f(x) = ${equation.replaceAll("x", `(${next_x})`)} = ${round(getFx(equation, next_x), roundoff)}`,
        iteration
      }
    ])

    setStep((prev) => [
      ...prev, {
        title: "For the next f'(x)",
        value: `f'(x) Just substitute x to derivative = ${round(toDerivative(equation, next_x), roundoff)}`,
        iteration
      }
    ])

    setStep((prev) => [
      ...prev,
      {
        title: "For the next relative error",
        value: `Relative error = (next_x - x) / next_x * 100 \n Relative error = (${next_x} - ${x}) / ${next_x} * 100 \n Relative error = ${Math.abs(
          round(new_rel, 3)
        )}%`,
        iteration
      },
    ]);



    Iterate({
      x: next_x,
      fx: round(getFx(equation, next_x), roundoff),
      fx_prime: round(toDerivative(equation, next_x), roundoff),
      equation: equation,
      rel: Math.abs(round(new_rel, 2)),
      iteration: iteration ? (iteration + 1) : 2
    });
  };

  return (
    <div className="">
      <div className="w-full bg-primary/90 text-white">
        <div className="max-w-screen-md mx-auto sm:pb-10 bp-6">
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
                            step={0.01}
                            min={0.01}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <RoundoffDropdown
                    value={roundoff}
                    setRoundOff={handleRound}
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
          block: computation.length > 0,
        })}
      >
        <div className="mt-5">
          <h1 className="text-lg font-medium text-center">Iteration</h1>
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
          <div className="mt-2 rounded-md py-3 px-2 w-fit mx-auto flex items-center gap-1">
            <h1 className="font-medium">Root Value:</h1>
            <h2 className="font-bold text-sm bg-slate-100 py-2 px-3 rounded-md text-primary">
              {computation[computation.length - 1]?.x}
            </h2>
          </div>
        </div>
      </div>

      <div className=" max-w-screen-md mx-auto p-6">
        <h1 className="text-2xl font-bold">Step by step solution below: </h1>
        <div className="mt-2 space-y-2">
          {step.map((item, index) => (
            <div className="" key={index}>
              <h1 className="font-bold">{`(${item.iteration})`}{item.title}</h1>
              <h2 className="">{item.value}</h2>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Newton;
