import * as vscode from "vscode";

// Get the name of the active workspace
export function getCurrentWorkspaceName(): string | undefined {
  const activeTextEditor = vscode.window.activeTextEditor; // Get the current active text editor
  const workspaceFolders = vscode.workspace.workspaceFolders; // Get the list of workspace folders in the currently open workspace
  let activeWorkspaceName: string | undefined = undefined;

  if (activeTextEditor) {
    // Get the workspace folder associated with the active text editor if any
    const activeWorkspace = vscode.workspace.getWorkspaceFolder(
      activeTextEditor.document.uri
    );
    if (activeWorkspace) {
      activeWorkspaceName = activeWorkspace.name; // Return the name of workspace if any was found
    }
  } else if (workspaceFolders && workspaceFolders.length > 0) {
    // If there are workspace folders, return the name of the first one.
    activeWorkspaceName = workspaceFolders[0].name;
  }
  //   Returns undefined if no active text editor or associated workspace folder is found
  return activeWorkspaceName;
}

export function formatElapsedTime(milliseconds: number): string {
  const seconds = Math.floor((milliseconds / 1000) % 60);
  const minutes = Math.floor((milliseconds / 1000 / 60) % 60);
  const hours = Math.floor(milliseconds / 1000 / 60 / 60);
  return `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`;
}

export function getElapsedTime(startTime: number): string {
  if (startTime) {
    const currentTime = Date.now();
    const elapsedTime = formatElapsedTime(currentTime - startTime);
    return elapsedTime;
  }
  return "00:00:00";
}

export function formatElapsedTimeMsg(timestamp: string): string {
  // Split the timestamp into hours, minutes, and seconds
  const [hoursStr, minutesStr, secondsStr] = timestamp.split(":");

  // Convert the parts to numbers
  const hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);
  const seconds = parseInt(secondsStr, 10);

  // Calculate the total number of seconds
  const totalSeconds = hours * 3600 + minutes * 60 + seconds;

  // Calculate hours, minutes, and remaining seconds
  const formattedHours = Math.floor(totalSeconds / 3600);
  const formattedMinutes = Math.floor((totalSeconds % 3600) / 60);

  // Create the formatted text
  let formattedText = "You've worked for ";

  if (formattedHours > 0) {
    formattedText += `${formattedHours} hour${formattedHours > 1 ? "s" : ""}`;
  }

  if (formattedMinutes > 0) {
    if (formattedHours > 0) {
      formattedText += " and ";
    }
    formattedText += `${formattedMinutes} minute${
      formattedMinutes > 1 ? "s" : ""
    }`;
  }

  if (formattedHours === 0 && formattedMinutes === 0) {
    formattedText += "less than a minute";
  }

  return formattedText;
}

export function joinTimeStamps(stamp1: string, stamp2: string): string {
  // Split the timestamps into hours, minutes, and seconds
  const [hours1, minutes1, seconds1] = stamp1.split(":").map(Number);
  const [hours2, minutes2, seconds2] = stamp2.split(":").map(Number);

  // Calculate the total seconds
  const totalSeconds =
    seconds1 +
    seconds2 +
    minutes1 * 60 +
    minutes2 * 60 +
    hours1 * 3600 +
    hours2 * 3600;

  // Calculate the new hours, minutes, and seconds
  const newHours = Math.floor(totalSeconds / 3600);
  const remainingSeconds = totalSeconds % 3600;
  const newMinutes = Math.floor(remainingSeconds / 60);
  const newSeconds = remainingSeconds % 60;

  // Format the result as "HH:MM:SS"
  const result = `${String(newHours).padStart(2, "0")}:${String(
    newMinutes
  ).padStart(2, "0")}:${String(newSeconds).padStart(2, "0")}`;

  return result;
}

function padZero(num: number): string {
  return num.toString().padStart(2, "0");
}
