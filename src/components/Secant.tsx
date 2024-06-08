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
import { getFx, getNewXb, roundOff, toDerivative } from "@/functions/root-finding";
import MethodDropdown from "./MethodDropdown";
import { Types } from "@/lib/types";
import RoundoffDropdown from "./RoundoffDropdown";

interface IterationType {
  xa: number;
  xb: number;
  fxa: number;
  fxb: number;
  rel: string;
  equation?: string;
}

const COLUMNS = ["i", "xa", "xb", "f(xa)", "f(xb)", "rel"];

const Secant = ({
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

  const formSchema = z.object({
    equation: z
      .string()
      .min(2, { message: "Invalid equation" })
      .max(50, { message: "Invalid equation" }),
    xa: z.coerce.number(),
    xb: z.coerce.number(),
    precision: z.coerce.number(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      equation: "",
      xa: 0,
      xb: 0,
      precision: 0.1,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setComputation([]);

      const { xa, xb, equation } = values;

      const fxa = getFx(equation, xa)
      const fxb = getFx(equation, xb)

      setComputation((prev) => [
        ...prev,
        {
          xa,
          xb,
          fxa,
          fxb,
          rel: `0%`,
        }
      ])

      const new_xb = getNewXb(xa, xb, fxa, fxb)
      const rel = Math.abs(round(((new_xb - xb) / new_xb) * 100, 2))

      Iterate({
        xa: round(xb, roundoff),
        xb: round(new_xb, roundoff),
        fxa: round(getFx(equation, xb), roundoff),
        fxb: round(getFx(equation, new_xb), roundoff),
        equation,
        rel
      })

    } catch (error) {
      console.log(error);
      form.setError("equation", { message: "Invalid equation" });
    }
  }

  const Iterate = ({
    xa,
    xb,
    fxa,
    fxb,
    equation,
    rel
  }: {
    xa: number;
    xb: number;
    fxa: number;
    fxb: number;
    equation: string;
    rel: number;
  }) => {
    const intervalId = setTimeout(() => {
      iterate_func();
    }, 400);

    const iterate_func = () => {

      setComputation((prev) => [
        ...prev,
        {
          xa,
          xb,
          fxa,
          fxb,
          rel: `${rel}%`,
        }
      ])

      const new_xb = getNewXb(xa, xb, fxa, fxb)
      const new_rel = Math.abs(round(((new_xb - xb) / new_xb) * 100, 2))

      if (Math.abs(rel) < form.getValues("precision")) {
        clearTimeout(intervalId)
        return
      }

      Iterate({
        xa: round(xb, roundoff),
        xb: round(new_xb, roundoff),
        fxa: round(getFx(equation, xb), roundoff),
        fxb: round(getFx(equation, new_xb), roundoff),
        equation,
        rel: new_rel
      })
    }
    
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
                    name="xa"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel className="!text-white">
                          Initial Value for X<sub className="text-xs">a</sub>
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
                    name="xb"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel className="!text-white">
                          Initial Value for X<sub className="text-xs">b</sub>
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
                </div>

                <div className="flex gap-3">
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
                  <RoundoffDropdown value={roundoff} setRoundOff={handleRound} />
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
                    <h1 className="w-full text-center py-3 truncate" key={i}>
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

export default Secant;
