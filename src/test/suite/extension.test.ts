import * as assert from "assert";
import * as vscode from "vscode";
import * as extension from "../../extension";
import { before } from "mocha";

// TODO: revisit test suites

suite("Extension Test Suite", () => {
  vscode.window.showInformationMessage("Start all tests.");

  let context: vscode.ExtensionContext;

  before(() => {
    context = {
      extensionPath: "/mock-path",
      subscriptions: [],
    } as unknown as vscode.ExtensionContext; // Create a mock content object.
  });

  // test("activate function should initialize the extension", async () => {
  //   await extension.activate(context); // Call your activate function

  //   // Add assertions here to check if your extension has been initialized properly.
  //   // For example, you can assert that the status bar item has been created.
  //   assert.ok(extension.statusBarItem);
  // });

  test("deactivate function should clean up resources", () => {
    extension.deactivate(); // Call your deactivate function

    // Add assertions here to check if your extension's resources have been cleaned up properly.
  });

  test("startStampTimer should start the timer", () => {
    extension.startStampTimer(); // Call your startStampTimer function

    // Add assertions here to check if the timer has been started correctly.
    assert.strictEqual(extension.isTimerRunning, true);
  });

  test("stopStampTimer should stop the timer", () => {
    extension.stopStampTimer(); // Call your stopStampTimer function

    // Add assertions here to check if the timer has been stopped correctly.
    assert.strictEqual(extension.isTimerRunning, false);
  });

  // test("workStamp command should start or stop the timer", async () => {
  //   // Ensure the timer is not running initially
  //   // extension.isTimerRunning = false;

  //   // Call the workStamp command
  //   await vscode.commands.executeCommand(extension.cmdIds.start);

  //   // Add assertions here to check if the timer has been started.

  //   // Call the workStamp command again
  //   await vscode.commands.executeCommand(extension.cmdIds.start);

  //   // Add assertions here to check if the timer has been stopped.
  // });

  teardown(() => {
    vscode.window.showInformationMessage("All tests have finished.");
  });
});
