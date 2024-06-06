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
