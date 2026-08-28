import { Fragment, useState } from "react";
import { IconChevronDown } from "../../components/icons";
import DetailTable from "./DetailTable";

function DetailExpandableTable({ columns, rows, nestedColumns, nestedKey, nestedLabel }) {
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
          {rows.map((row, index) => {
            const rowId = row.id ?? index;
            const isOpen = Boolean(openRows[rowId]);
            const nestedRows = row[nestedKey] ?? [];
            return (
              <Fragment key={rowId}>
                <tr className="detail-table__row--parent" onClick={() => toggleRow(rowId)}>
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
                    <td />
                    <td colSpan={columns.length}>
                      {nestedLabel && <div className="detail-table__nested-label">{nestedLabel}</div>}
                      <DetailTable columns={nestedColumns} rows={nestedRows} />
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
