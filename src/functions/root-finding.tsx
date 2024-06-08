import {
  derivative,
  evaluate
} from "mathjs";

export const bisectionXm = (a: number, b: number) => (a + b) / 2;

export const falsiXm = ({
  xl,
  xr,
  yl,
  yr,
}: {
  xl: number;
  xr: number;
  yl: number;
  yr: number;
}) => xl - (yl * (xr - xl)) / (yr - yl);

export const roundOff = (number: number, decimalPlaces: number) =>
  parseFloat(Number(number).toFixed(decimalPlaces));

export const parseEquation = (equation: string, x: number) =>
  equation
    .toLowerCase()
    .replace(/\^/g, "**")
    .replace(/x/g, `(${x})`)
    .replace(/(\d)\(/g, "$1*(")
    .replace(/\)(\d)/g, ")*$1");

export const toDerivative = (equation: string, value: number) =>
  evaluate(derivative(equation, "x").toString(), {
    x: value,
  });

export const getFx = (equation: string, x: number) =>
  evaluate(equation, {
    x
  });

export const getNewXb = (xa: number, xb: number, fxa: number, fxb: number) => {
  return xa - ((fxa * (xa - xb)) / (fxa - fxb))
}