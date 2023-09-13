import * as store from "../../store";
import * as assert from "assert";
import * as path from "node:path";
import { beforeEach, afterEach } from "mocha";
import * as fs from "node:fs";

suite("Data store utility functions test", () => {
  // Define a temporary directory for testing.
  const tempDir = path.join(__dirname, "temp");
  const tempDatastorePath = path.join(tempDir, "datastore.csv");

  beforeEach(() => {
    // Create a temporary directory before each test.
    fs.mkdirSync(tempDir, { recursive: true });
  });

  afterEach(() => {
    // Cleanup: Delete the temporary directory after each test.
    fs.rmSync(tempDir, { recursive: true });
  });

  test("initStorePath should initialize the datastore directory", () => {
    const datastorePath = store.initStorePath();
    // Verify that the directory is created and the path is correct.
    assert.ok(fs.existsSync(datastorePath!));
  });

  test("writeStampToCsv should create a new CSV file and write stamp data to file", () => {
    // Sample stamp data
    const stamp = {
      date: Date.now(),
      activeDurationStamp: "00:30:00",
      totalDurationStamp: "01:00:00",
      projectName: "Test Project",
      startTime: Date.now(),
      endTime: Date.now() + 3600000, // 1 hour later
    };

    store.writeStampToCsv(tempDatastorePath, stamp);

    // Verify that the file exists and has the correct content.
    assert.ok(fs.existsSync(tempDatastorePath));

    const fileContent = fs.readFileSync(tempDatastorePath, "utf-8");
    const expectedCsvContent =
      "projectName,totalDuration,activeDuration,startTime,endTime,date\n" +
      store.formatCsv(stamp);
    assert.strictEqual(fileContent, expectedCsvContent);
  });

  test("readStampData should read stamp data from CSV file", async () => {
    // Sample stamp data
    const stamp = {
      date: Date.now(),
      activeDurationStamp: "00:30:00",
      totalDurationStamp: "01:00:00",
      projectName: "Test Project",
      startTime: Date.now(),
      endTime: Date.now() + 3600000, // 1 hour later
    };

    const expectedStamp = {
      projectName: stamp.projectName,
      date: new Date(stamp.date).toDateString(),
      startTime: new Date(stamp.startTime).toLocaleTimeString(),
      endTime: new Date(stamp.endTime).toLocaleTimeString(),
      activeDuration: stamp.activeDurationStamp,
      totalDuration: stamp.totalDurationStamp,
    };

    // Create the CSV file with the sample stamp data
    store.writeStampToCsv(tempDatastorePath, stamp);

    // Read the stamp data
    const stampLogs = await store.readStampData(tempDatastorePath);

    // Verify that the data matches the written stamp
    assert.strictEqual(stampLogs.length, 1);
    const readStamp = stampLogs[0];
    assert.deepStrictEqual(readStamp, expectedStamp);
  });

  test("formatCsv should format stamp data into CSV string", () => {
    // Sample stamp data
    const stamp = {
      date: Date.now(),
      activeDurationStamp: "00:30:00",
      totalDurationStamp: "01:00:00",
      projectName: "Test Project",
      startTime: Date.now(),
      endTime: Date.now() + 3600000, // 1 hour later
    };

    const csvString = store.formatCsv(stamp);

    // Verify that the formatted CSV string matches expectations
    const expectedCsvContent = `${stamp.projectName},${
      stamp.totalDurationStamp
    },${stamp.activeDurationStamp},${new Date(
      stamp.startTime
    ).toLocaleTimeString()},${new Date(
      stamp.endTime
    ).toLocaleTimeString()},${new Date(stamp.date).toDateString()}\n`;

    assert.strictEqual(csvString, expectedCsvContent);
  });
});
