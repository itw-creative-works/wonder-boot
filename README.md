<p align="center">
  <a href="https://itwcreativeworks.com">
    <img src="https://cdn.itwcreativeworks.com/assets/itwcreativeworks/images/logo/itwcreativeworks-brandmark-black-x.svg" width="100px">
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/github/package-json/v/itw-creative-works/wonder-boot.svg">
  <br>
  <img src="https://img.shields.io/librariesio/release/npm/wonder-boot.svg">
  <img src="https://img.shields.io/bundlephobia/min/wonder-boot.svg">
  <img src="https://img.shields.io/codeclimate/maintainability-percentage/itw-creative-works/wonder-boot.svg">
  <img src="https://img.shields.io/npm/dm/wonder-boot.svg">
  <img src="https://img.shields.io/node/v/wonder-boot.svg">
  <img src="https://img.shields.io/website/https/itwcreativeworks.com.svg">
  <img src="https://img.shields.io/github/license/itw-creative-works/wonder-boot.svg">
  <img src="https://img.shields.io/github/contributors/itw-creative-works/wonder-boot.svg">
  <img src="https://img.shields.io/github/last-commit/itw-creative-works/wonder-boot.svg">
  <br>
  <br>
  <a href="https://itwcreativeworks.com">Site</a> | <a href="https://www.npmjs.com/package/wonder-boot">NPM Module</a> | <a href="https://github.com/itw-creative-works/wonder-boot">GitHub Repo</a>
  <br>
  <br>
  <strong>wonder-boot</strong> is the official npm module of <a href="https://itwcreativeworks.com">Wonder Boot</a>, a free CLI utility that automatically restarts crashed processes (not regular errors) with customizable timeout and trigger levels.
</p>

## 🦄 Features
* Automatically restart crashed processes only (default behavior)
* Configurable restart triggers: `crash` (default), `all`, or custom signals
* Customizable restart timeout
* Distinguishes between crashes and regular errors

## 📦 Install Wonder Boot
### Install via npm
Install with npm if you plan to use `wonder-boot` in a Node project or in the browser.
```shell
npm install wonder-boot -g
```

## ⚡️ Usage
```shell
# Basic usage (restarts on crashes only)
wonderboot --process="your-command-here"

# With custom timeout (milliseconds)
wonderboot --process="node server.js" --timeout=5000

# Restart on errors only (not crashes)
wonderboot --process="npm start" --trigger="error"

# Restart on all non-zero exits (errors AND crashes)
wonderboot --process="npm run dev" --trigger="all"

# Restart on specific signals only
wonderboot --process="./app.js" --trigger="SIGTERM,SIGINT"
```

## 📘 Command Line Options

### `--process` (required)
The command or process to run and monitor.
- **Type**: String
- **Default**: None (required)
- **Examples**: 
  - `--process="node server.js"`
  - `--process="npm start"`
  - `--process="python app.py"`

### `--trigger`
Defines when the process should be restarted.
- **Type**: String
- **Default**: `crash`
- **Options**:
  - `crash` - Restart only on actual crashes (SIGSEGV, SIGABRT, SIGBUS, SIGFPE, SIGILL)
  - `error` - Restart only on errors (non-zero exits that aren't crashes)
  - `all` - Restart on any non-zero exit code
  - Custom signals - Comma-separated list (e.g., `"SIGTERM,SIGINT"`)
- **Examples**:
  - `--trigger=crash` (default behavior)
  - `--trigger=error` 
  - `--trigger=all`
  - `--trigger="SIGTERM,SIGINT,SIGHUP"`

### `--timeout`
Time to wait before restarting the process (in milliseconds).
- **Type**: Number
- **Default**: `1000` (1 second)
- **Examples**:
  - `--timeout=5000` (5 seconds)
  - `--timeout=100` (100 milliseconds)
  - `--timeout=30000` (30 seconds)

## 📝 What Can Wonder Boot do?
Wonder Boot monitors your processes and automatically restarts them when they crash. By default, it only restarts on actual crashes (segmentation faults, aborts, etc.), not on regular errors or exit codes. This ensures your critical processes stay running without restarting unnecessarily.

### Trigger Options
- **`crash` (default)**: Only restart on actual crashes (SIGSEGV, SIGABRT, SIGBUS, etc.)
- **`error`**: Only restart on errors (non-zero exits that aren't crashes)
- **`all`**: Restart on any non-zero exit code (errors OR crashes)
- **Custom signals**: Specify exact signals to trigger restart (e.g., "SIGTERM,SIGINT")

## 🗨️ Final Words
If you are still having difficulty, we would love for you to post
a question to [the Wonder Boot issues page](https://github.com/itw-creative-works/wonder-boot/issues). It is much easier to answer questions that include your code and relevant files! So if you can provide them, we'd be extremely grateful (and more likely to help you find the answer!)

## 📚 Projects Using this Library
* [ITW Creative Works](https://itwcreativeworks.com)
* [Somiibo](https://somiibo.com)
* [Slapform](https://slapform.com)
* [StudyMonkey](https://studymonkey.ai)
* [DashQR](https://dashqr.com)
* [Replyify](https://replyify.app)
* [SoundGrail](https://soundgrail.com)
* [Trusteroo](https://trusteroo.com)

Ask us to have your project listed! :)
