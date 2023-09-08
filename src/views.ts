import * as vscode from "vscode";

type ILogs = {
  projectName: string;
  date: string;
  totalDuration: string;
  activeDuration: string;
  startTime: string;
  endTime: string;
};

export function genWebViewContent(
  logs: ILogs[],
  assets: {
    icon?: vscode.Uri;
    style?: vscode.Uri;
    app?: vscode.Uri;
    cspSource: any;
  }
) {
  let view = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta
      http-equiv="Content-Security-Policy"
      content="default-src 'none'; img-src ${
        assets.cspSource
      } https:; script-src ${assets.cspSource}; style-src ${assets.cspSource};"
    />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta
    <link rel="stylesheet" href="${assets.style}">
    <title>Stamp Table</title>
  </head>
  <body>
    <header class="header">
      <h1>Stamp Table</h1>
    </header>

    <section class="container">
      <table id="stamp_table">
        <thead>
        <td>Date</td>
        <td>Project Name</td>
        <td>Active Duration</td>
        <td>Total Duration</td>
        <td>Start Time</td>
        <td>End Time</td>
        </thead>
        ${genTableBody(logs)}
      </table>
      <section class="pagination">
        <button id="prev_btn">Prev</button>
        <p id="page_count">0</p>
        <button id="next_btn">Next</button>
      </section>
    </section>
  </body>
</html>`;

  return view;
}

function genTableBody(logs: ILogs[]): string {
  return `<tbody>${logs.map((log) => {
    return `<tr>
      <td>${log["date"]}</td>
      <td>${log["projectName"]}</td>
      <td>${log["activeDuration"]}</td>
      <td>${log["totalDuration"]}</td>
      <td>${log["startTime"]}</td>
      <td>${log["endTime"]}</td>
  </tr>`;
  })}</tbody>`;
}
// ${genTableBody(logs)}
