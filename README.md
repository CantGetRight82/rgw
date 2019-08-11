# ripgrep-write (rgw)

> Search and replace in current directory.

This is a thin wrapper around ripgrep (rg) that allows you to save the proposed replacements.
For the moment in only allows you to specify the search and replace arguments and searches in the current directory.

## Install

Depends on ripgrep:

https://github.com/BurntSushi/ripgrep


```console
$ npm install rgw
```


## Usage

```console
$ rgw [search] [replace]
```

It will show the rg output of what would be replaced.

You can then choose to apply all changes, cancel or interactively apply per change.

