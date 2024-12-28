import React from "react";

const BetTable = ({ betData }) => {
  return (
    <div>
      <table
        style={{
          border: "1px solid black",
          borderCollapse: "collapse",
          margin: "0 auto",
        }}
      >
        <thead>
          <tr>
            <th style={{ border: "1px solid black", padding: "8px" }}>
              User Name
            </th>
            <th style={{ border: "1px solid black", padding: "8px" }}>
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {betData &&
            Object.entries(betData).map(([key, value]) => (
              <tr key={key}>
                <td style={{ border: "1px solid black", padding: "8px" }}>
                  {key}
                </td>
                <td style={{ border: "1px solid black", padding: "8px" }}>
                  {value?.initialBet}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default BetTable;
