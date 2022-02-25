# README

This is what a bitburner project with the necessary integrations looks like, on Windows.

## Requirements:

-   you will need NPM installed and accessible.
-   you will need the Steam version of Bitburner.
-   `code` should be a reachable command on powershell
-   This project does not work on WSL unfortunately

## Steps:

1. Run the Setup.ps1 script, that will add the extensions you would want for this
    1. This will install the BitBurner and Prettier extensions
2. run `npm i`
    1. This will install prettier
3. Run bitburner, and activate the api server and copy the api key as directed by the extension docs. Paste the key in the appropriate field in `./.vscode/settings.json` (property should be obvious)
4. Restart Visual Studio Code, the workspace configuration should take care of everything

## Results:

What should happen is that:

-   You will have VSCode, that can
    -   fix formatting
    -   intellisense Netcode 2.0
    -   auto-forward your code onto your running bitburner game
-   With the advantage that:
    -   You can commit to source control
    -   You can leverage other tools (like, say, eslint)
    -   You can have customizable code highlighting, refactoring, and organization settings as you would any other code project

All you should need to do is make scripts in the `./scripts` directory. Upon saving, the game will update or create the same scripts onto your `home` server's root. You may have sub-directories in you scripts folder, but they will not be reflected in BitBurner, everything lives on root on `home`.

A reminder that there is no way to get the scripts _out_ of BitBurner, only VSCode to BB.

## An Important Note:

The top comment in bitburner is alerting the IDE to a TypeScript typdef, without the Typescript fixings.  However, the context is a little different.  You will need to replace the first line that is:

``` javascript
/** @param {NS} ns **/
```
And instead, direct vscode to use the file itself:
``` javascript
/** @param {import("../NetscriptDefinitions").NS} ns **/
```

With that done, you should be able to leverage VSCode's intellisense as you would any other programming project.  If you decide to add const's or other definitions to the top of the file, this magic comment needs to float with the `main` function definition.  
