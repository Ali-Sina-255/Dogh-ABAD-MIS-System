const RevenueTable = ({ data }) => {
  // Ensure data exists
  if (!data) return null;

  return (
    <div className="mt-6 overflow-x-auto">
      <table className="w-full text-sm border rounded">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-right">Income Source</th>
            <th className="p-3 text-right">Amount (AF)</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-t">
            <td className="p-3">📘 Course Fees</td>
            <td className="p-3 text-right font-medium">AF {data.course}</td>
          </tr>
          <tr className="border-t">
            <td className="p-3">💳 Cards</td>
            <td className="p-3 text-right font-medium">AF {data.card}</td>
          </tr>
          <tr className="border-t">
            <td className="p-3">📚 Books</td>
            <td className="p-3 text-right font-medium">AF {data.book}</td>
          </tr>
          <tr className="border-t bg-green-50">
            <td className="p-3 font-bold">Total Income</td>
            <td className="p-3 text-right font-bold text-green-700">
              AF {data.total}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default RevenueTable;
