import { useEffect, useState } from "react";
import { getExpenses, Expense } from "../../api/expenses";
import { useAuth } from "../../context/AuthContext";

const getPaymentModeBadge = (mode: string) => {
  const base =
    "inline-flex px-2 py-1 rounded-full text-xs font-medium capitalize";
  switch (mode?.toLowerCase()) {
    case "cash":
      return (
        <span className={`${base} bg-yellow-100 text-yellow-700`}>{mode}</span>
      );
    case "upi":
      return (
        <span className={`${base} bg-green-100 text-green-700`}>{mode}</span>
      );
    case "bank transfer":
      return (
        <span className={`${base} bg-blue-100 text-blue-700`}>{mode}</span>
      );
    case "cheque":
      return (
        <span className={`${base} bg-purple-100 text-purple-700`}>{mode}</span>
      );
    default:
      return (
        <span className={`${base} bg-gray-100 text-gray-600`}>{mode}</span>
      );
  }
};

export default function ExpensesTable() {
  const { token } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const rowsPerPage = 20;

  const filtered = expenses.filter(
    (e) =>
      e.description?.toLowerCase().includes(search.toLowerCase()) ||
      e.paid_by?.toLowerCase().includes(search.toLowerCase()) ||
      e.approved_by?.toLowerCase().includes(search.toLowerCase()) ||
      e.expense_type?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginated = filtered.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getExpenses();
        setExpenses(data);
      } catch (err) {
        console.error("Error fetching expenses:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-6 text-gray-600 dark:text-gray-300">
        Loading expenses...
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600">
        <h2 className="text-lg font-bold text-white tracking-wide">Expenses</h2>
        <input
          type="text"
          placeholder="Search expenses..."
          className="w-60 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder-white/60 focus:border-white focus:ring focus:ring-white/30"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>
      <table className="min-w-full text-left text-sm text-gray-600 dark:text-gray-300">
        <thead className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-500 text-white">
          <tr>
            <th className="px-4 py-3">#</th>
            {/* <th className="px-4 py-3">Type</th> */}
            <th className="px-4 py-3">Description</th>
            {/* <th className="px-4 py-3">Paid By</th> */}
            {/* <th className="px-4 py-3">Approved By</th> */}
            <th className="px-4 py-3">Payment Mode</th>
            {/* <th className="px-4 py-3">Date</th> */}
            <th className="px-4 py-3 text-right">Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          {paginated.length === 0 ? (
            <tr>
              <td
                colSpan={8}
                className="px-4 py-6 text-center text-gray-500 dark:text-gray-400"
              >
                No expenses found
              </td>
            </tr>
          ) : (
            paginated.map((e, index) => (
              <tr
                key={e.id}
                className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <td className="px-4 py-3">
                  {(page - 1) * rowsPerPage + index + 1}
                </td>
                {/* <td className="px-4 py-3">{e.expense_type}</td> */}
                <td className="px-4 py-3">{e.description}</td>
                {/* <td className="px-4 py-3">{e.paid_by}</td>
                <td className="px-4 py-3">{e.approved_by}</td> */}
                <td className="px-4 py-3">
                  {getPaymentModeBadge(e.payment_mode)}
                </td>
                {/* <td className="px-4 py-3">
                  {e.date_of_expense
                    ? new Date(e.date_of_expense).toLocaleDateString("en-IN")
                    : "-"}
                </td> */}
                {token ? (
                  <td className="px-4 py-3 text-right font-semibold">
                    ₹ {new Intl.NumberFormat("en-IN").format(e.amount)}
                  </td>
                ) : (
                  <td className="px-4 py-3 text-right font-semibold">
                    ₹ *****
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
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
