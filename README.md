# ripgrep-write (rgw)

> Search and replace in current directory.

This is a thin wrapper around ripgrep (rg) that allows you to save the proposed replacements.
For the moment in only allows you to specify the search and replace arguments and searches in the current directory.

## Install

1. Depends on ripgrep, so install if not already:
https://github.com/BurntSushi/ripgrep

2. Depends on nodejs, so install if not already:
https://nodejs.org/en/download/

3. Finally install rgw:

```console
$ npm install rgw
```


## Usage

```console
$ rgw [search] [replace]
```

It will show the rg output of what would be replaced.

You can then choose to apply all changes, cancel or interactively apply per change.

