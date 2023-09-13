<p align="center">
<img src="/assets/timer.png" width="150" height="150" />
</p>

<p align="center">Keep track of your time while working on a particular project</p>

<h1 align="center">Work Stamp</h1>

<p align="center">
    <img src="https://img.shields.io/github/stars/elvis-ndubuisi/work-stamp" alt="GitHub Repo stars"/>
    <img src="https://img.shields.io/github/package-json/v/elvis-ndubuisi/work-stamp" alt="GitHub package.json version (subfolder of monorepo)"/>
    <img src="https://img.shields.io/github/license/elvis-ndubuisi/work-stamp" alt="Github"/>
</p>

Welcome to "Work Stamp," an extension designed to help you keep track of your time while working on specific projects or tasks within Visual Studio Code.

## Commands

- `WK: START/STOP`: starts or stops timer

## Features

- Tracks your active work time and total work time differently.
- Tracks coding activity automatically or via using a command.
- Automatically saves tracked time project when vscode is closed.
- Saves time stamp information locally.
- Display elapsed time in the status bar with tooltip message.

## Extension Settings

- `work-stamp.autoStart`: starts work stamp when typing begins if set to `true`. Default: `true`
- `work-stamp.delayDuration`: delay between typing activities before active work timer pauses(in minutes). Default: `10` minutes.

## TODO

- [ ] Preview all projects timestamp and summary logs in webview.
- [ ] Preview specific project timestamp and summary log
- [ ] Backup log information to custom REST endpoint _(only if specified by a user)_
- [ ] Display active work elapsed time and total elapsed time message tooltip message.
- [ ] Add break reminder

## Requirements

This extension does not have any specific requirements or dependencies.

## Known Issues

There are no known issues at the moment. If you encounter any problems, please [report them on GitHub](https://github.com/elvis-ndubuisi/work-stamp/issues).

## Attributions

[Timer stickers created by Gohsantosadrive - Flaticon](https://www.flaticon.com/free-stickers/timer)

**Enjoy tracking your work time with "Work Stamp"!**
