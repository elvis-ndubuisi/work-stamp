import * as vscode from "vscode";
import {
  getCurrentWorkspaceName,
  formatElapsedTime,
  getElapsedTime,
  formatElapsedTimeMsg,
} from "./utils";
import { initStorePath, writeStampToCsv } from "./store";

let isTimerRunning: boolean = false;
let startTime: number | null = null;
let statusBarItem: vscode.StatusBarItem | null = null;
let intervalId: NodeJS.Timer | null = null;
const cmdIds = {
  start: "work-stamp.stamp-work", // start stamp timer
  read: "work-stamp.stamp-store", // read stamp data
  project: "work-stamp.stamp-project", // read project stamp data
};
const currentWorkspace = getCurrentWorkspaceName();

// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "work-stamp" is now active!');
  let datastore = initStorePath();

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

  // const readStamp = vscode.commands.registerCommand(cmdIds.read, () => {});

  // Update status bar item initially
  updateStatusBarItem();

  context.subscriptions.push(workStamp);
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
