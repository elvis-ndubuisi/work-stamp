import * as vscode from "vscode";
import {
  getCurrentWorkspaceName,
  formatElapsedTime,
  getElapsedTime,
  formatElapsedTimeMsg,
  joinTimeStamps,
} from "./utils";
import { initStorePath, writeStampToCsv, readStampData } from "./store";
import { genWebViewContent } from "./views";

let datastore: string | null = "";
let projectName: string | undefined = "";
let startTime: number | null = null;
let activeStartTime: number | null = null;
let activeDuration: string = "00:00:00";
let statusBarItem: vscode.StatusBarItem | null = null;
let intervalId: NodeJS.Timer | null = null;
let delayIntervalId: NodeJS.Timer | null = null;
let delayTimerId: NodeJS.Timeout | null = null;
let isTimerRunning: boolean = false;
let hasStartedCoding: boolean = false;
let delayDuration: number | null = 0;

const currentWorkspace = getCurrentWorkspaceName();
const cmdIds = {
  start: "work-stamp.stamp-work", // start stamp timer
  read: "work-stamp.stamp-read", // read stamp data
  project: "work-stamp.stamp-project", // read project stamp data
  auto: "work-stamp.autoStart", // timer auto start boolean from settings
  delay: "work-stamp.delayDuration", // delay duration from settings
};

// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "work-stamp" is now active!');

  datastore = initStorePath(); // Initialize stamp data storage source.
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

  // Read workspace configurations.
  const config = vscode.workspace.getConfiguration();
  const canAutoStart = config.get(cmdIds.auto, true);
  const delayMinutes = config.get(cmdIds.delay, 4);
  delayDuration = delayMinutes * 60 * 1000; // convert delay duration to milliseconds.

  // Create status bar item.
  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    80
  );
  statusBarItem.command = cmdIds.start;

  // Show statusBarItem if a workspace is active
  if (!currentWorkspace) {
    vscode.window.showErrorMessage(
      "No project or workspace is open. Start the timer with an open project"
    );
    return;
  } else {
    projectName = currentWorkspace;
    statusBarItem.show();
  }

  // Register command to start/stop timer - via statusBarItem or Command.
  const workStamp = vscode.commands.registerCommand(cmdIds.start, () => {
    if (isTimerRunning) {
      // Save data and stop timer
      if (projectName && startTime) {
        const endTime = Date.now();
        const elapsedTime = formatElapsedTime(endTime - startTime);
        if (datastore) {
          writeStampToCsv(datastore, {
            activeDurationStamp: activeDuration ? activeDuration : "00:00:00",
            date: Date.now(),
            endTime: endTime,
            projectName: projectName,
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
    updateActiveWorkTime();
  });

  // Listen for active work-time via document change
  const checkActiveWorkTime = vscode.workspace.onDidChangeTextDocument(() => {
    // Check if work stamp is not running & auto-start is enabled.
    if (!isTimerRunning && canAutoStart) {
      startTime = Date.now();
      startStampTimer();
    }

    if (!hasStartedCoding) {
      // Start the timer when coding activity begins - without auto start
      hasStartedCoding = true;
      activeStartTime = Date.now();
    }
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

  // Subscription contexts.
  context.subscriptions.push(statusBarItem);
  context.subscriptions.push(
    workStamp,
    readStamp,
    readProject,
    checkActiveWorkTime
  );
}

// This method is called when your extension is deactivated
export function deactivate() {
  // Save Stamp - (unexpected deactivation)
  if (isTimerRunning && startTime) {
    const endTime = Date.now();
    const elapsedTime = formatElapsedTime(endTime - startTime);
    if (datastore) {
      writeStampToCsv(datastore, {
        activeDurationStamp: activeDuration ? activeDuration : "00:00:00",
        date: Date.now(),
        endTime: endTime,
        projectName: projectName!,
        startTime: startTime,
        totalDurationStamp: elapsedTime,
      });
    }
  }

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

  if (!delayIntervalId) {
    hasStartedCoding = false;
    delayIntervalId = setInterval(updateActiveWorkTime, 1000);
  }
}

function stopStampTimer(): void {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    isTimerRunning = false;
    startTime = null;
  }

  if (delayTimerId) {
    clearTimeout(delayTimerId);
    delayTimerId = null;
  }
  if (delayIntervalId) {
    clearInterval(delayIntervalId);
    delayIntervalId = null;
  }

  hasStartedCoding = false;
  activeStartTime = null;
  activeDuration = "00:00:00";
}

function updateActiveWorkTime(): void {
  if (hasStartedCoding && activeStartTime) {
    const currentTime = Date.now();
    const elapsedTime = formatElapsedTime(currentTime - activeStartTime);

    // Update activeDuration - added elapsed time to previous activeDuration
    activeDuration = joinTimeStamps(activeDuration, elapsedTime);

    // Reset the activeStartTime.
    activeStartTime = currentTime;

    // Prevent further activeDuration if time of last keystroke > delayDuration.
    delayTimerId = setTimeout(() => {
      hasStartedCoding = false;
    }, delayDuration!);
  }
}
