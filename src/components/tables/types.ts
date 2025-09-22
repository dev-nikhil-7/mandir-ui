// src/types.ts

export type TableRow = {
  [key: string]: any;
};

export type Column = {
  key: string;
  label: string;
  render?: (value: any, row: TableRow) => React.ReactNode;
};
