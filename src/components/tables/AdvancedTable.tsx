import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { useAuth } from "./../../context/AuthContext";
interface FinancialYear {
  id: number;
  name: number;
  is_active: boolean;
}

interface Pledge {
  id: number;
  amount: number;
  financial_year: FinancialYear;
}

interface Tola {
  id: number;
  tola_name: string;
}

interface Contributor {
  id: number;
  name: string;
  contact: string | null;
  tola_id: number;
  created_at: string;
  updated_at: string;
  tola: Tola;
  pledges: Pledge[];
}

interface ContributorsTableProps {
  contributors: Contributor[];
}

export default function ContributorsTable({
  contributors,
}: ContributorsTableProps) {
  const { token } = useAuth();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const rowsPerPage = 20;

  // search filter
  const filtered = contributors.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.tola?.tola_name.toLowerCase().includes(search.toLowerCase())
  );

  // pagination
  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginated = filtered.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  return (
    <div className="rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700">
      {/* Header with search */}
      <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
        <h2 className="text-lg font-bold text-white tracking-wide">
          Contributors
        </h2>
        <input
          type="text"
          placeholder="Search contributors..."
          className="w-60 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder-white/60 focus:border-white focus:ring focus:ring-white/30"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {/* Table */}
      <div className="max-w-full overflow-x-auto bg-white dark:bg-gray-900">
        <Table className="w-full text-sm text-left">
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white uppercase tracking-wide text-xs">
              <TableCell isHeader className="px-6 py-3">
                Name
              </TableCell>
              <TableCell isHeader className="px-6 py-3">
                Tola
              </TableCell>
              {token && (
                <TableCell isHeader className="px-6 py-3">
                  Pledges
                </TableCell>
              )}
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginated.map((contributor, idx) => (
              <TableRow
                key={contributor.id}
                className={`transition-all ${
                  idx % 2 === 0
                    ? "bg-gray-50 dark:bg-gray-800"
                    : "bg-white dark:bg-gray-900"
                } hover:shadow-md hover:bg-indigo-50 dark:hover:bg-indigo-900/30`}
              >
                <TableCell className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                  {contributor.name}
                </TableCell>
                <TableCell className="px-6 py-4 text-gray-700 dark:text-gray-300">
                  {contributor.tola?.tola_name}
                </TableCell>

                {token && (
                  <>
                    <TableCell className="px-6 py-4">
                      {contributor.pledges.length > 0 ? (
                        <div className="flex flex-wrap gap-3">
                          {contributor.pledges.map((pledge, idx) => {
                            if (pledge.financial_year.is_active) {
                              const colors = [
                                "from-pink-500 to-rose-500",
                                "from-blue-500 to-cyan-500",
                                "from-green-500 to-emerald-500",
                                "from-purple-500 to-indigo-500",
                                "from-amber-500 to-orange-500",
                              ];
                              const bg = colors[idx % colors.length];
                              return (
                                <div
                                  key={pledge.id}
                                  className={`flex items-center gap-2 rounded-full bg-gradient-to-r ${bg} px-4 py-1.5 text-xs font-semibold text-white shadow-md transition-transform hover:scale-105`}
                                >
                                  <span>{pledge.financial_year?.name}</span>
                                  <span>₹ {pledge.amount}</span>
                                </div>
                              );
                            }
                          })}
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))}

            {paginated.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="px-6 py-6 text-center text-gray-500 dark:text-gray-400"
                >
                  No contributors found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Page {page} of {totalPages || 1}
        </span>
        <div className="flex space-x-2">
          <button
            className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 transition"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Prev
          </button>
          <button
            className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 transition"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
