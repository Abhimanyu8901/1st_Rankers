interface DataTableProps<T> {
  columns: { header: string; render: (row: T) => React.ReactNode }[];
  data: T[];
}

export const DataTable = <T,>({ columns, data }: DataTableProps<T>) => (
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
      <thead>
        <tr>
          {columns.map((column) => (
            <th
              key={column.header}
              className="px-3 py-3 text-left font-semibold text-slate-600 dark:text-slate-300"
            >
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
        {data.map((row, index) => (
          <tr key={index}>
            {columns.map((column) => (
              <td key={column.header} className="px-3 py-3 text-slate-700 dark:text-slate-200">
                {column.render(row)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
