import { ZodType } from 'zod';

export const createRowParser = <TRow>(schema: ZodType<TRow>) => {
  return (row: unknown): TRow => schema.parse(row);
};
