import { z } from "zod";

type TrimmedStringMinMaxArgs = {
  min: number;
  max: number;
  minMessage: string;
  maxMessage: string;
};

export const trimmedStringMinMax = ({ min, max, minMessage, maxMessage }: TrimmedStringMinMaxArgs) => {
  return z
    .string()
    .trim()
    .min(min, { message: minMessage })
    .max(max, { message: maxMessage });
};
