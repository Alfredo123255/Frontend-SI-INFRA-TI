import { Fragment, useState } from "react";
import { IconChevronDown } from "../../components/icons";
import DetailTable from "./DetailTable";

function DetailExpandableTable({ columns, rows = [], nestedColumns, nestedKey, nestedLabel }) {
  const [openRows, setOpenRows] = useState({});

  const toggleRow = (rowId) => {
    setOpenRows((prev) => ({ ...prev, [rowId]: !prev[rowId] }));
  };

  return (
    <div className="detail-table-wrap">
      <table className="detail-table detail-table--expandable">
        <thead>
          <tr>
            <th className="detail-table__toggle-col" aria-hidden="true" />
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length + 1} className="detail-table__empty">
                No hay componentes registrados.
              </td>
            </tr>
          )}
          {rows.map((row, index) => {
            const rowId = row.id ?? index;
            const isOpen = Boolean(openRows[rowId]);
            const nestedRows = row[nestedKey] ?? [];
            return (
              <Fragment key={rowId}>
                <tr
                  className={`detail-table__row--parent ${isOpen ? "is-open" : ""}`}
                  onClick={() => toggleRow(rowId)}
                >
                  <td className="detail-table__toggle-col">
                    <IconChevronDown
                      className={`detail-table__row-caret ${isOpen ? "is-open" : ""}`}
                    />
                  </td>
                  {columns.map((col) => (
                    <td key={col.key}>{row[col.key]}</td>
                  ))}
                </tr>
                {isOpen && (
                  <tr className="detail-table__nested-row">
                    <td aria-hidden="true" />
                    <td colSpan={columns.length}>
                      <div className="detail-table__nested">
                        {nestedLabel && (
                          <div className="detail-table__nested-label">
                            <span className="detail-table__nested-dot" aria-hidden="true" />
                            {nestedLabel}
                          </div>
                        )}
                        <DetailTable columns={nestedColumns} rows={nestedRows} />
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default DetailExpandableTable;
