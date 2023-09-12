import * as assert from "assert";
import * as vscode from "vscode";
import {
  getCurrentWorkspaceName,
  formatElapsedTime,
  formatElapsedTimeMsg,
  getElapsedTime,
} from "../../utils";

let timeStamp: string = "00:00:00";
let minuteStamp: string = "00:00:00";
let hourStamp: string = "00:00:00";

suite("Utility Functions Tests", () => {
  test("getCurrentWorkspaceName should return the current project name", () => {
    // Get the workspace from which the util.test lives in.
    const workspaceName = vscode.window.activeTextEditor;
    const fnWorkspace = getCurrentWorkspaceName();

    assert.strictEqual(workspaceName, "ss");
  });

  // suite("formatElapsedTimeMsg", () => {
  //   test("should return 'You've worked for less than on minute' and typeOf string", () => {
  //     const alert = formatElapsedTimeMsg("00:00:00");
  //     assert.deepStrictEqual(typeof alert, typeof "");
  //     assert.strictEqual("You've worked for less than a minute", alert);
  //   });
  //   test("should return not return 'You've worked for less than on minute'", () => {});
  //   test("should return not return 'You've worked for 1 minute'", () => {});
  //   test("should return not return 'You've worked for 1 hour'", () => {});
  //   test("should return not return 'You've worked for 1 hour 30 minute'", () => {});
  // });

  suite("getElapsedTime", () => {});

  suite("formatElapsedTime", () => {});

  suite("saveStampData", () => {});
});
