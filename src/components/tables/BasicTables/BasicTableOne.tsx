import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";

interface Column<T> {
  Header: string;
  accessor: keyof T | string;
  render?: (row: T) => React.ReactNode;
}

interface BasicTableProps<T> {
  columns: Column<T>[];
  data: T[];
  striped?: boolean;
}

export default function BasicTableOne<T>({
  columns,
  data,
  striped = true,
}: BasicTableProps<T>) {
  return (
    <div className="rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700">
      {/* Gradient Header Bar */}
      <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
        <h2 className="text-lg font-bold text-white tracking-wide">All Tols</h2>
      </div>

      <div className="max-w-full overflow-x-auto bg-white dark:bg-gray-900">
        <Table className="w-full text-sm text-left">
          {/* Table Header */}
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white uppercase tracking-wide text-xs">
              {columns.map((col) => (
                <TableCell
                  key={col.Header}
                  isHeader
                  className="px-6 py-3 font-semibold"
                >
                  {col.Header}
                </TableCell>
              ))}
            </TableRow>
          </TableHeader>

          {/* Table Body */}
          <TableBody>
            {data.map((row, idx) => (
              <TableRow
                key={idx}
                className={`transition-all ${
                  striped
                    ? idx % 2 === 0
                      ? "bg-gray-50 dark:bg-gray-800"
                      : "bg-white dark:bg-gray-900"
                    : "bg-white dark:bg-gray-900"
                } hover:shadow-md hover:bg-indigo-50 dark:hover:bg-indigo-900/30`}
              >
                {columns.map((col) => (
                  <TableCell
                    key={col.Header}
                    className="px-6 py-4 text-gray-800 dark:text-gray-200"
                  >
                    {col.render
                      ? col.render(row) // ✅ custom render support
                      : String((row as any)[col.accessor] ?? "—")}
                  </TableCell>
                ))}
              </TableRow>
            ))}

            {data.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="px-6 py-6 text-center text-gray-500 dark:text-gray-400"
                >
                  No data found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
