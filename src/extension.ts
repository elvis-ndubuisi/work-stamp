import * as vscode from "vscode";
import {
  getCurrentWorkspaceName,
  formatElapsedTime,
  getElapsedTime,
  formatElapsedTimeMsg,
  joinTimeStamps,
} from "./utils";
import { initStorePath, writeStampToCsv, readStampData } from "./store";
import { getHtmlForWebView } from "./views";

export let datastore: string | null = "";
let projectName: string | undefined = "";
let startTime: number | null = null;
let activeStartTime: number | null = null;
let activeDuration: string = "00:00:00";
export let statusBarItem: vscode.StatusBarItem | null = null;
let intervalId: NodeJS.Timer | null = null;
let delayIntervalId: NodeJS.Timer | null = null;
let delayTimerId: NodeJS.Timeout | null = null;
export let isTimerRunning: boolean = false;
let hasStartedCoding: boolean = false;
let delayDuration: number | null = 0;

const currentWorkspace = getCurrentWorkspaceName();
export const cmdIds = {
  start: "work-stamp.stamp-work", // start stamp timer
  read: "work-stamp.stamp-read", // read stamp data
  project: "work-stamp.stamp-project", // read project stamp data
};
const settingIds = {
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
  let activeWebView: vscode.WebviewPanel | undefined = undefined;
  let projectWebView: vscode.WebviewPanel | undefined = undefined;

  // Read workspace configurations.
  const config = vscode.workspace.getConfiguration();
  const canAutoStart = config.get(settingIds.auto, true);
  const delayMinutes = config.get(settingIds.delay, 4);
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

  // Register command to view timestamp logs in webview.
  const readStamps = vscode.commands.registerCommand(cmdIds.read, () => {
    // Allow only a single webview
    if (activeWebView) {
      activeWebView.reveal(vscode.ViewColumn.One);
    } else {
      activeWebView = vscode.window.createWebviewPanel(
        "workStamp",
        "Work Stamp",
        vscode.ViewColumn.One,
        {
          enableScripts: true,
          localResourceRoots: [
            vscode.Uri.joinPath(context.extensionUri, "assets"),
          ],
        }
      );

      // Set Panel Configs
      activeWebView.iconPath = iconPath;

      // Process Log stamps into webview.
      if (!datastore) {
        vscode.window.showInformationMessage("No data saved yet!");
        return;
      }
      readStampData(datastore)
        .then((logs) => {
          activeWebView!.webview.html = getHtmlForWebView(
            activeWebView!.webview,
            context,
            logs
          );
        })
        .catch((err) => {
          // TODO: refactor.
          vscode.window.showErrorMessage("Error: ", err);
        });

      /** Handles webview message events */
      // activeWebView.webview.postMessage();
      // activeWebView.webview.onDidReceiveMessage((message) => {});
    }
  });

  // Register command to view a project's timestamp summary
  const projectStamps = vscode.commands.registerCommand(
    cmdIds.project,
    async () => {
      const projectName = await vscode.window.showInputBox({
        placeHolder: "project name",
        prompt: "Type the project name to get project timestamp logs",
        value: "",
      });

      // Allow only a single webview
      if (projectWebView) {
        projectWebView.reveal(vscode.ViewColumn.One);

        // Process Log stamps into webview.
        if (!datastore) {
          vscode.window.showInformationMessage("No data saved yet!");
          return;
        }

        // Read data from datastore
        readStampData(datastore)
          .then((logs) => {
            projectWebView!.webview.html = getHtmlForWebView(
              projectWebView!.webview,
              context,
              logs,
              projectName
            );
          })
          .catch((err) => {
            // TODO: refactor.
            vscode.window.showErrorMessage("Error: ", err);
          });
      } else {
        projectWebView = vscode.window.createWebviewPanel(
          "workStamp",
          "Project Work Stamp",
          vscode.ViewColumn.One,
          {
            enableScripts: true,
            localResourceRoots: [
              vscode.Uri.joinPath(context.extensionUri, "assets"),
            ],
          }
        );

        // Set Panel Configs
        projectWebView.iconPath = iconPath;

        // Process Log stamps into webview.
        if (!datastore) {
          vscode.window.showInformationMessage("No data saved yet!");
          return;
        }

        // Read data from datastore
        readStampData(datastore)
          .then((logs) => {
            projectWebView!.webview.html = getHtmlForWebView(
              projectWebView!.webview,
              context,
              logs,
              projectName
            );
          })
          .catch((err) => {
            // TODO: refactor.
            vscode.window.showErrorMessage("Error: ", err);
          });

        // projectWebView.onDidDispose(
        //   () => {
        //     projectWebView = undefined;
        //   },
        //   undefined,
        //   context.subscriptions
        // );
      }
    }
  );

  // Update status bar item initially
  updateStatusBarItem();

  // Message
  // context.subscriptions.push(vscode.commands.registerCommand())

  // Subscription contexts.
  context.subscriptions.push(workStamp);
  context.subscriptions.push(statusBarItem);
  context.subscriptions.push(checkActiveWorkTime);
  context.subscriptions.push(readStamps);
  context.subscriptions.push(projectStamps);
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

export function startStampTimer(): void {
  if (!intervalId) {
    isTimerRunning = true;
    intervalId = setInterval(updateStatusBarItem, 1000);
  }

  if (!delayIntervalId) {
    hasStartedCoding = false;
    delayIntervalId = setInterval(updateActiveWorkTime, 1000);
  }
}

export function stopStampTimer(): void {
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
