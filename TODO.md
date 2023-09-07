# TODO

## Features

- [x] store timestamps to file.
  - [x] store data locally or using sqlite3.
  - [ ] storage format should be easily readable/convertible from/to JSON or CSV.
  - [x] stored information **MUST** include `project name`, `duration`, `active duration`, `date`.
  - [x] optional data like `start time`, `end time`, etc. may be included.
- [ ] retrieve timestamp from file.
  - [ ] display timestamps in vscode webview.
- [ ] automatically start timer when on first-key-stroke _if_ a workspace is available.
- [ ] allow user to specify work time range by passing time string.
  - [ ] action can only be activated with a command.
  - [ ] inform users when the time has elapsed.
- [ ] add webview to preview work time on a project.
  - [ ] webview can only be activated with a command.
  - [ ] project name must be passed as input when command is activated.
- [ ] add webview to preview work time of all project.
  - [ ] log lists should be sorted from most recently added.
  - [ ] log view should be paginated.
- [ ] Add feature to post CSV or JSON data to external API or database.

## Issues
