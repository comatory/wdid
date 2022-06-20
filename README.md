![wdid logo](docs/logo.svg)

# wdid

**W**hat **did** **I** **d**o is a command line tool for preparing and
recording your daily SCRUM stand-ups.

### [https://comatory.github.io/wdid](https://comatory.github.io/wdid/)

<img src="docs/wdid.gif" width="481" alt="demonstrating wdid on command line" />

## Why?

I want to recall the work I've done during my previous work day during
daily stand-up meetings.

I also wanted to have ability to see linear record of my stand-ups.

## Installation

`wdid` is written in Javascript for NodeJS environments. It should be
installed globally so it's accessible as an executable. The required
version of NodeJS is at least v18.

The entries are stored in sqlite database file.

### NPM

`npm i -G wdid`

### Git repository

1. Clone this repository
2. CD into the cloned folder
3. `npm install --global .` or `npm link`

### brew

_TBD_

## Initial setup

`wdid init` is required before using the tool. It sets you up with
configuration file and database file.

_TBD_

## How does it work?

Run `wdid --help` to get hints or append `--help` flag to any command
`wdid` offers.

The tool operates under certain assumptions and is very opinionated. It has
two modes of operation that map to type of stand-up entry:

* stand-up (command: `wdid new`)
* reminder (command: `wdid remind`)

You should record your _stand-up_ at the beginning of your work day. That
way you can share it or report it during stand-up meeting.

_Reminder_ should be recorded at the end of your work day. The reminder
helps you with _stand-up_ which happens next day as it helps you recall
the work you did during the work day.

You can re-run each command to edit the entries.

## List my stand-ups

Run `wdid log` to get ordered list of all stand-ups. `wdid log --last` will
show the latest stand-up.

You can also get list of reminders by including `-r` flag. See `wdid log --help`
for more options.
