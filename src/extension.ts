import * as vscode from "vscode";
import {
  getCurrentWorkspaceName,
  formatElapsedTime,
  saveStampData,
  getElapsedTime,
  formatElapsedTimeMsg,
} from "./utils";

let isTimerRunning: boolean = false;
let startTime: number | null = null;
let statusBarItem: vscode.StatusBarItem | null = null;
let intervalId: NodeJS.Timer | null = null;
const cmdId: string = "work-stamp.stamp-work";
const currentWorkspace = getCurrentWorkspaceName();

// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "work-stamp" is now active!');

  // Create status bar item.
  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    80
  );
  statusBarItem.command = cmdId;
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
  const workStamp = vscode.commands.registerCommand(cmdId, () => {
    if (isTimerRunning) {
      // Save data ans stop timer
      if (currentWorkspace && startTime) {
        const endTime = Date.now();
        const elapsedTime = formatElapsedTime(endTime - startTime);
        saveStampData(currentWorkspace, elapsedTime, startTime, endTime);
      }
      stopStampTimer();
    } else {
      // Start timer
      startTime = Date.now();
      startStampTimer();
    }
    updateStatusBarItem();
  });

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
