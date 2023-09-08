import * as fs from "node:fs";
import * as path from "node:path";
import * as vscode from "vscode";
import * as csv from "csv-parser";

type IStamp = {
  date: number;
  activeDurationStamp: string;
  totalDurationStamp: string;
  projectName: string;
  startTime: number;
  endTime: number;
};

const EXT_ID = "ElvisNdubuisi.work-stamp";

export function initStorePath(): string | null {
  const extensionPath = vscode.extensions.getExtension(EXT_ID)!.extensionPath;
  let dataFolderPath = path.join(extensionPath, ".stamp-data");

  // Make dir if none exists
  if (!fs.existsSync(dataFolderPath)) {
    fs.mkdirSync(dataFolderPath);
    vscode.window.showInformationMessage("Initialized datastore directory");
  }

  // Define file path.
  const filePath = path.join(dataFolderPath, "datastore.csv");

  return filePath;
}

export function writeStampToCsv(datastore: string, stamp: IStamp): void {
  // Check if datastore has been created.
  if (!fs.existsSync(datastore)) {
    fs.writeFileSync(
      datastore,
      "projectName,totalDuration,activeDuration,startTime,endTime,date\n",
      "utf-8"
    );
  }

  // Append stamp data to data-source
  fs.appendFileSync(datastore, formatCsv(stamp));
}

export function readStampData(datastore: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const stampLogs: IStamp[] = [];

    fs.createReadStream(datastore)
      .pipe(csv())
      .on("data", (log) => {
        stampLogs.push(log);
      })
      .on("end", () => {
        resolve(stampLogs);
      })
      .on("error", (err: any) => {
        reject(err);
      });
  });
}

export function readAllStampData(): void {}

function formatCsv(stamp: IStamp): string {
  const date = new Date(stamp.date).toDateString();
  const startTime = new Date(stamp.startTime).toLocaleTimeString();
  const endTime = new Date(stamp.endTime).toLocaleTimeString();
  return `${stamp.projectName},${stamp.totalDurationStamp},${stamp.activeDurationStamp},${startTime},${endTime},${date}\n`;
}
