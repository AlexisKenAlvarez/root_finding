"use client";

import accurate from "@/assets/accurate.json";
import fast from "@/assets/fast.json";
import reliable from "@/assets/reliable.json";
import BisectionFalsi from "@/components/BisectionFalsi";
import Newton from "@/components/Newton";
import Secant from "@/components/Secant";
import { Types } from "@/lib/types";
import { cn } from "@/lib/utils";
import Lottie from "lottie-react";
import { useState, useCallback } from "react";

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

const Hero = () => {
  const [open, setOpen] = useState(false);

  const [type, setType] = useState<Types["rootFinding"]>("bisection");
  const [roundoff, setRound] = useState(4);

  const handleOpen = useCallback(() => {
    setOpen(true);
  }, []);

  const handleRound = useCallback((round_value: number) => {
    setRound(round_value);
  }, []);

  const handleType = useCallback((type: Types["rootFinding"]) => {
    setType(type);
  }, []);

  const VIEWS = [
    {
      methods: ["bisection", "false Position"],
      component: BisectionFalsi,
    },
    {
      methods: ["newton Raphson"],
      component: Newton,
    },
    {
      methods: ["secant"],
      component: Secant,
    },
  ];

  return (
    <div className="">
      <div className="h-12 w-full bg-primary/90"></div>
      <div
        className={cn(
          "max-h-0 overflow-hidden transition-all ease-in-out duration-300",
          { "max-h-24": open }
        )}
      >
        <h1 className="md:text-2xl text-xl font-bold text-center bg-primary/90 pb-6 capitalize text-white ">
          {type} method
        </h1>
      </div>

      <div className="">
        {VIEWS.map((item, index) => {
          if (item.methods.includes(type)) {
            return (
              <item.component
                roundoff={roundoff}
                handleRound={handleRound}
                setType={handleType}
                type={type}
                handleOpen={handleOpen}
                open={open}
                key={index}
              />
            );
          }
        })}
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

export default Hero;
