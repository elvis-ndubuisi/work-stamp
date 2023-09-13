import * as assert from "assert";
import * as vscode from "vscode";
import {
  getCurrentWorkspaceName,
  formatElapsedTime,
  formatElapsedTimeMsg,
  getElapsedTime,
  joinTimeStamps,
} from "../../utils";

suite("Utility Functions Tests", () => {
  suite("getCurrentWorkspaceName", () => {
    test("should return the current project name", () => {
      // Get the workspace from which the util.test lives in.
      const workspaceName = vscode.window.activeTextEditor;
      const fnWorkspace = getCurrentWorkspaceName();

      assert.strictEqual(workspaceName, fnWorkspace);
    });
  });

  suite("formatElapsedTime", () => {
    test("should format milliseconds into HH:MM:SS", () => {
      const testData = [
        { milliseconds: 0, expected: "00:00:00" },
        { milliseconds: 1000, expected: "00:00:01" },
        { milliseconds: 60000, expected: "00:01:00" },
        { milliseconds: 3600000, expected: "01:00:00" },
        { milliseconds: 3661000, expected: "01:01:01" },
      ];

      testData.forEach((data) => {
        const result = formatElapsedTime(data.milliseconds);
        assert.strictEqual(data.expected, result);
      });
    });
  });

  suite("getElapsedTime", () => {
    test("should return elapsed time in HH:MM:SS format", () => {
      const startTime = Date.now() - 10000;
      const result = getElapsedTime(startTime);

      const matchRegex = /^\d{2}:\d{2}:\d{2}$/;

      assert.match(result, matchRegex);
    });

    test("should return '00:00:00' if startTime is not provided", () => {
      const result = getElapsedTime(23256754.32456);
      assert.notEqual(result, "00:00:00");
    });
  });

  suite("formatElapsedTimeMsg", () => {
    test("should return 'You've worked for less than on minute' and typeOf string", () => {
      const alert = formatElapsedTimeMsg("00:00:00");
      assert.deepStrictEqual(typeof alert, typeof "");
      assert.strictEqual("You've worked for less than a minute", alert);
    });

    test("should return 'You've worked for 1 minute'", () => {
      const alert = formatElapsedTimeMsg("00:01:023");
      assert.strictEqual("You've worked for 1 minute", alert);
    });

    test("should return a plural minute 'You've worked for 1 minutes'", () => {
      const alert = formatElapsedTimeMsg("00:20:023");
      assert.strictEqual("You've worked for 20 minutes", alert);
    });

    test("should not return 'You've worked for 20 hour'", () => {
      const alert = formatElapsedTimeMsg("20:01:00");
      assert.notStrictEqual("You've worked for 20 hours", alert);
    });

    test("should return not return 'You've worked for 20 hour and 20 minutes'", () => {
      const alert = formatElapsedTimeMsg("20:20:023");
      assert.strictEqual("You've worked for 20 hours and 20 minutes", alert);
    });
  });

  suite("joinTimeStamps", () => {
    test("should correctly join two time stamps", () => {
      const testData = [
        { stamp1: "00:00:00", stamp2: "00:00:01", expected: "00:00:01" },
        { stamp1: "00:00:59", stamp2: "00:00:01", expected: "00:01:00" },
        { stamp1: "00:59:59", stamp2: "00:00:01", expected: "01:00:00" },
        { stamp1: "01:59:59", stamp2: "00:00:01", expected: "02:00:00" },
        { stamp1: "23:59:59", stamp2: "00:00:01", expected: "24:00:00" },
      ];

      testData.forEach((data) => {
        const result = joinTimeStamps(data.stamp1, data.stamp2);
        assert.strictEqual(result, data.expected);
      });
    });
  });
});
