import * as assert from "assert";
import * as vscode from "vscode";
import {
  getCurrentWorkspaceName,
  formatElapsedTime,
  formatElapsedTimeMsg,
  getElapsedTime,
} from "@/src/utils";

let timeStamp: string = "00:00:00";
let minuteStamp: string = "00:00:00";
let hourStamp: string = "00:00:00";

suite("Utility Functions Tests", () => {
  test("getCurrentWorkspaceName should return the current project name", () => {});

  suite("formatElapsedTimeMsg", () => {
    test("formatElapsedTimeMsg should return not return a timestamp string", () => {});
    test("formatElapsedTimeMsg should return not return 'You've worked for less than on minute'", () => {});
    test("formatElapsedTimeMsg should return not return 'You've worked for 1 minute'", () => {});
    test("formatElapsedTimeMsg should return not return 'You've worked for 1 hour'", () => {});
    test("formatElapsedTimeMsg should return not return 'You've worked for 1 hour 30 minute'", () => {});
  });

  suite("getElapsedTime", () => {});

  suite("formatElapsedTime", () => {});

  suite("saveStampData", () => {});
});
