import * as vscode from "vscode";

type LogsType = {
  date: string;
  projectName: string;
  totalDuration: string;
  activeDuration: string;
  startTime: string;
  endTime: string;
};

export function getHtmlForWebView(
  webview: vscode.Webview,
  context: vscode.ExtensionContext,
  logs: any,
  projectName?: string
) {
  // Get local paths to assets, convert to special URI for webview.
  const mainScriptPath = webview.asWebviewUri(
    vscode.Uri.joinPath(context.extensionUri, "assets", "main.js")
  );
  const vsStylesPath = webview.asWebviewUri(
    vscode.Uri.joinPath(context.extensionUri, "assets", "vscode.css")
  );
  const mainStylesPath = webview.asWebviewUri(
    vscode.Uri.joinPath(context.extensionUri, "assets", "main.css")
  );

  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Work Stamp Logs</title>
      <link rel="stylesheet" href="${mainStylesPath}" />
      <link rel="stylesheet" href="${vsStylesPath}" />
      <meta
        http-equiv="Content-Security-Policy"
        content="default-src 'none'; img-src ${
          webview.cspSource
        } https script-src ${webview.cspSource}; frame-src 'self'; style-src ${
    webview.cspSource
  };"
      />
    </head>
    <body>
      <h1 class="heading">Heading</h1>
      <section class="table_container">
        <table>
          <thead>
            <td>Date</td>
            <td>Project Name</td>
            <td>Duration</td>
            <td>Active</td>
            <td>Start Time</td>
            <td>End Time</td>
          </thead>
          <tbody>${spreadLogs(logs, projectName && projectName)}</tbody>
        </table>
      </section>
      <script src="${mainScriptPath}"></script>
    </body>
  </html>`;
}

function spreadLogs(logs: LogsType[], filter?: string): string | null {
  const html = logs.map((log) => {
    if (filter) {
      if (filter === log.projectName) {
        return `<tr>
          <td>${log.date}</td>
          <td>${log.projectName}</td>
          <td>${log.totalDuration}</td>
          <td>${log.activeDuration}</td>
          <td>${log.startTime}</td>
          <td>${log.endTime}</td>
        </tr>`;
      } else {
        throw Error("Project not found");
      }
    }
    return `<tr>
      <td>${log.date}</td>
      <td>${log.projectName}</td>
      <td>${log.totalDuration}</td>
      <td>${log.activeDuration}</td>
      <td>${log.startTime}</td>
      <td>${log.endTime}</td>
    </tr>`;
  });
  return `${html}`;
}
