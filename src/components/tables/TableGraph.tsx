import React from "react";

type TolaWiseData = {
  tola_name: string;
  total_pledged: number;
  total_collected: number;
};

interface Props {
  data: TolaWiseData[];
}

const TolaWiseCollection: React.FC<Props> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white shadow rounded-xl p-6 text-gray-500">
        No data available
      </div>
    );
  }

  // Totals
  const totalPledged = data.reduce((s, t) => s + t.total_pledged, 0);
  const totalCollected = data.reduce((s, t) => s + t.total_collected, 0);
  const percentTotal =
    totalPledged > 0 ? Math.round((totalCollected / totalPledged) * 100) : 0;

  return (
    <div>
      {/* Grand total card */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl shadow p-4 mb-6">
        <h3 className="text-lg font-semibold mb-2">Overall Collection</h3>
        <p className="text-sm">
          Pledged: ₹ {totalPledged.toLocaleString()} | Collected: ₹{" "}
          {totalCollected.toLocaleString()}
        </p>
        <div className="w-full bg-white/20 h-3 rounded mt-2 overflow-hidden">
          <div
            className={`h-3 ${
              percentTotal >= 100
                ? "bg-green-400"
                : percentTotal > 0
                ? "bg-blue-400"
                : "bg-red-400"
            }`}
            style={{ width: `${percentTotal}%` }}
          />
        </div>
        <p className="text-sm mt-1">
          {percentTotal === 100
            ? "✔ Fully Collected"
            : `${percentTotal}% Collected`}
        </p>
      </div>

      {/* Grid of tola cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {data.map((tola, idx) => {
          const percent =
            tola.total_pledged > 0
              ? Math.round((tola.total_collected / tola.total_pledged) * 100)
              : 0;

          return (
            <div
              key={idx}
              className="bg-white shadow rounded-xl p-4 hover:shadow-md transition"
            >
              <h4 className="text-lg font-semibold mb-1">{tola.tola_name}</h4>
              <p className="text-sm text-gray-600">
                Pledged: ₹ {tola.total_pledged.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">
                Collected: ₹ {tola.total_collected.toLocaleString()}
              </p>

              {/* Progress bar */}
              <div className="w-full bg-gray-200 h-3 rounded mt-2 overflow-hidden">
                <div
                  className={`h-3 ${
                    percent >= 100
                      ? "bg-green-500"
                      : percent > 0
                      ? "bg-blue-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${percent}%` }}
                />
              </div>
              <p
                className={`text-sm mt-1 font-medium ${
                  percent >= 100
                    ? "text-green-600"
                    : percent > 0
                    ? "text-blue-600"
                    : "text-red-600"
                }`}
              >
                {percent === 100
                  ? "✔ Fully Collected"
                  : `${percent}% Collected`}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TolaWiseCollection;
