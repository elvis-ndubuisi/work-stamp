import * as vscode from "vscode";
import {
  getCurrentWorkspaceName,
  formatElapsedTime,
  getElapsedTime,
  formatElapsedTimeMsg,
} from "./utils";
import { initStorePath, writeStampToCsv, readStampData } from "./store";
import { genWebViewContent } from "./views";

let isTimerRunning: boolean = false;
let startTime: number | null = null;
let statusBarItem: vscode.StatusBarItem | null = null;
let intervalId: NodeJS.Timer | null = null;
const cmdIds = {
  start: "work-stamp.stamp-work", // start stamp timer
  read: "work-stamp.stamp-read", // read stamp data
  project: "work-stamp.stamp-project", // read project stamp data
};
const currentWorkspace = getCurrentWorkspaceName();

// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "work-stamp" is now active!');
  let datastore = initStorePath();
  let iconPath = vscode.Uri.joinPath(
    context.extensionUri,
    "assets",
    "timer.png"
  );
  let stylePath = vscode.Uri.joinPath(
    context.extensionUri,
    "views",
    "style.css"
  );
  const scriptPath = vscode.Uri.joinPath(
    context.extensionUri,
    "views",
    "app.ts"
  );

  // Create status bar item.
  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    80
  );
  statusBarItem.command = cmdIds.start;
  context.subscriptions.push(statusBarItem);

  // Stop timer if no workspace is active
  if (!currentWorkspace) {
    vscode.window.showErrorMessage(
      "No project or workspace is open. Start the timer with an open project"
    );
    return;
  } else {
    statusBarItem.show();
  }

  // Register command to start/stop timer
  const workStamp = vscode.commands.registerCommand(cmdIds.start, () => {
    if (isTimerRunning) {
      // Save data ans stop timer
      if (currentWorkspace && startTime) {
        const endTime = Date.now();
        const elapsedTime = formatElapsedTime(endTime - startTime);
        if (datastore) {
          writeStampToCsv(datastore, {
            activeDurationStamp: "00:00:00",
            date: Date.now(),
            endTime: endTime,
            projectName: currentWorkspace,
            startTime: startTime,
            totalDurationStamp: elapsedTime,
          });
          vscode.window.showInformationMessage("🚀Saved timestamp🕥.");
        }
      }
      stopStampTimer();
    } else {
      // Start timer
      startTime = Date.now();
      startStampTimer();
    }
    updateStatusBarItem();
  });

  // Register command to view timestamp logs.
  const readStamp = vscode.commands.registerCommand(cmdIds.read, () => {
    const panel = vscode.window.createWebviewPanel(
      "workStamp",
      "Work Stamp",
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [
          vscode.Uri.joinPath(context.extensionUri, "views"),
          vscode.Uri.joinPath(context.extensionUri, "assets"),
        ],
      }
    );
    panel.iconPath = iconPath;

    // Read Log stamps.
    if (!datastore) {
      vscode.window.showErrorMessage("No data source found");
      return;
    }

    readStampData(datastore)
      .then((logs) => {
        panel.webview.html = genWebViewContent(logs, {
          icon: panel.webview.asWebviewUri(iconPath),
          style: panel.webview.asWebviewUri(stylePath),
          app: panel.webview.asWebviewUri(scriptPath),
          cspSource: panel.webview.cspSource,
        });
      })
      .catch((err) => {
        vscode.window.showErrorMessage(err);
      });
  });

  const readProject = vscode.commands.registerCommand(cmdIds.project, () => {
    const panel = vscode.window.createWebviewPanel(
      "",
      `projectName`,
      vscode.ViewColumn.One
    );
  });

  // Update status bar item initially
  updateStatusBarItem();

  context.subscriptions.push(workStamp);
  context.subscriptions.push(readStamp);
  context.subscriptions.push(readProject);
}

// This method is called when your extension is deactivated
export function deactivate() {
  stopStampTimer();
}

function updateStatusBarItem(): void {
  // Show formatted message tooltip
  statusBarItem!.tooltip = formatElapsedTimeMsg(
    startTime ? getElapsedTime(startTime) : "00:00:00"
  );

  if (isTimerRunning) {
    statusBarItem!.text = `$(flame) ${
      startTime ? getElapsedTime(startTime) : "00:00:00"
    }`;
  } else {
    statusBarItem!.text = `$(watch) Start Stamp`;
  }
  statusBarItem!.show();
}

function startStampTimer(): void {
  if (!intervalId) {
    isTimerRunning = true;
    intervalId = setInterval(updateStatusBarItem, 1000);
  }
}

function stopStampTimer(): void {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    isTimerRunning = false;
    startTime = null;
  }
}
