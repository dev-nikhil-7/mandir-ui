import { useState, useEffect } from "react";
import { getPayments } from "../../api/contributions";
import { getVillages } from "../../api/tolas";

interface ContributorPayment {
  contributor_id: number;
  contributor_name: string;
  pledged_amount: number;
  paid_amount: number;
  percent_diff: number;
}

interface Summary {
  total_pledged: number;
  total_paid: number;
  total_percent_diff: number;
}

interface Tola {
  id: number;
  tola_name: string;
}

export default function PaymentsTable() {
  const [contributors, setContributors] = useState<ContributorPayment[]>([]);
  const [summary, setSummary] = useState<Summary>({
    total_pledged: 0,
    total_paid: 0,
    total_percent_diff: 0,
  });

  const [tolas, setTolas] = useState<Tola[]>([]);
  const [selectedTola, setSelectedTola] = useState<number | null>(null);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const rowsPerPage = 20;

  // Fetch tolas
  useEffect(() => {
    const fetchTolas = async () => {
      try {
        const res = await getVillages();
        setTolas(res);
        // ❌ don’t auto-select first tola
        // user must choose manually
      } catch (err) {
        console.error("Error fetching tolas:", err);
      }
    };
    fetchTolas();
  }, []);

  // Fetch payments for selected tola
  useEffect(() => {
    const fetchPayments = async () => {
      if (!selectedTola) return;
      setLoading(true);
      try {
        const data = await getPayments(selectedTola);
        setContributors(data.contributors);
        setSummary(data.summary);
      } catch (err) {
        console.error("Error fetching payments:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, [selectedTola]);

  // Filter + pagination
  const filtered = contributors.filter((c) =>
    c.contributor_name.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginated = filtered.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 shadow-sm">
      {/* Header with tola selector + search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between px-6 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 gap-3">
        <h2 className="text-lg font-bold text-white tracking-wide">Payments</h2>

        <div className="flex gap-3">
          <select
            value={selectedTola ?? ""}
            onChange={(e) =>
              setSelectedTola(e.target.value ? Number(e.target.value) : null)
            }
            className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white focus:border-white focus:ring focus:ring-white/30"
          >
            <option value="">-- Select Tola --</option>
            {tolas.map((tola) => (
              <option key={tola.id} value={tola.id} className="text-gray-900">
                {tola.tola_name}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Search contributors..."
            disabled={!selectedTola}
            className="w-60 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder-white/60 focus:border-white focus:ring focus:ring-white/30 disabled:opacity-50"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* Show message before selection */}
      {!selectedTola && (
        <div className="p-6 text-center text-gray-500 dark:text-gray-400">
          Please select a Tola to view payments.
        </div>
      )}

      {/* Show loader */}
      {loading && selectedTola && (
        <div className="p-6 text-center text-gray-500 dark:text-gray-400">
          Loading payments...
        </div>
      )}
      {/* Summary Stats */}
      {selectedTola && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col text-center bg-white dark:bg-gray-900 rounded-xl p-4 shadow">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Total Pledged
            </span>
            <span className="text-lg font-bold text-indigo-600">
              ₹ {summary.total_pledged.toFixed(2)}
            </span>
          </div>
          <div className="flex flex-col text-center bg-white dark:bg-gray-900 rounded-xl p-4 shadow">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Total Paid
            </span>
            <span className="text-lg font-bold text-green-600">
              ₹ {summary.total_paid.toFixed(2)}
            </span>
          </div>
          <div className="flex flex-col text-center bg-white dark:bg-gray-900 rounded-xl p-4 shadow">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              % Difference
            </span>
            <span
              className={`text-lg font-bold ${
                summary.total_percent_diff > 0
                  ? "text-green-600"
                  : summary.total_percent_diff < 0
                  ? "text-red-600"
                  : "text-blue-600"
              }`}
            >
              {summary.total_percent_diff === 0
                ? "✔ Fully Paid"
                : `${summary.total_percent_diff} %`}
            </span>
          </div>
        </div>
      )}

      {/* Show table only when data is loaded */}
      {!loading && selectedTola && contributors.length > 0 && (
        <>
          <table className="min-w-full text-left text-sm text-gray-600 dark:text-gray-300">
            <thead className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Contributor</th>
                <th className="px-4 py-3 text-right">Pledged (₹)</th>
                <th className="px-4 py-3 text-right">Paid (₹)</th>
                <th className="px-4 py-3 text-right">% Diff</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((c, index) => {
                const hasPaid = c.paid_amount > 0;
                const diffClass =
                  c.percent_diff >= 0 ? "text-green-600" : "text-red-600";
                const rowClass = hasPaid
                  ? "bg-green-100 dark:bg-green-900/40"
                  : "bg-red-100 dark:bg-red-900/40";

                return (
                  <tr
                    key={c.contributor_id}
                    className={`border-t border-gray-200 dark:border-gray-700 hover:opacity-90 transition ${rowClass}`}
                  >
                    <td className="px-4 py-3">
                      {(page - 1) * rowsPerPage + index + 1}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {c.contributor_name}
                    </td>
                    <td className="px-4 py-3 text-right">
                      ₹ {c.pledged_amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      ₹ {c.paid_amount.toFixed(2)}
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-semibold ${
                        c.percent_diff > 0
                          ? "text-green-600"
                          : c.percent_diff < 0
                          ? "text-red-600"
                          : "text-blue-600" // <-- exactly 0%
                      }`}
                    >
                      {c.percent_diff === 0
                        ? "✔ Fully Paid"
                        : `${c.percent_diff} %`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

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
        </>
      )}
    </div>
  );
}
