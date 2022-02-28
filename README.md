# Install

```
# Locally
npm install --save-dev mochi-cli

# Globally
npm install -g mochi-cli
```

# Usage

## Mochi templates

A mochi template is simply a `.mdx` file with a _super fancy_ extension: `.mochi.mdx`. The template is broken into two parts:

-   The template **definition**
-   The template **body**

### Mochi template defintions

A mochi template definition complies to the following type when serialized via `JSON.serialize()`:

```
export type MochiConfiguration = {
    /**
     * The template name
     */
    templateName: string

    /**
     * The tokens to be replaced wtihin the file
     */
    tokens: string[]

    /**
     * The name of the output file (without the path)
     */
    fileName: string

    /**
     * Other mochi template names to be included in the execution
     */
    include?: string[]

    /**
     * The output directory of the mochi run
     */
    destination?: string
}
```

An example Mochi configuration may look like this:

````
```mochi
{
    # The name of the template
    "templateName": "react-component/ts",

    # The file output name (note: COMPONENT_NAME is included in the tokens array, so it will be replaced as well!)
    "fileName": "[COMPONENT_NAME].tsx".

    # The folder to place the output file(s) within
    "destination": "./src",

    # If I also have a template named react-component/typeDefs saved, it will be included in this mochi run
    "include": ["react-component/typeDefs"],

    # The tokens that mochi will prompt you for
    "tokens": ["COMPONENT_NAME"]
}
```
````

### Mochi template bodies

A Mochi template body can be, well... _anything_. The Mochi template definition will be parsed off at runtime, so anything that isn't within the `mochi` block of the `.mochi.mdx` file will be included in your output files.

Example:

Take this Mochi template definition:

````
# react-component.mochi.mdx
import React from 'react';

const COMPONENT_NAME = () => {
    return (
        <>
            Hello world, I am COMPONENT_NAME!
        <>
    )
}

```mochi
{
    "templateName": "react-component/ts",
    "tokens": ["COMPONENT_NAME"],
    "fileName": "[COMPONENT_NAME].tsx"
}
```
````

And you provided the value "Calendar" (we'll circle back to how you give Mochi values in a second), your output would be everything in the template file (`react-component.mochi.mdx`) _minus_ the mochi definition.

# Commands

## Summary

```
mochi-cli [command]

Commands:
  mochi-cli create [template]  Create a file from the given template
  mochi-cli save [template]    Saves the specified mochi configuration in a tmp
                               directory

Options:
      --version  Show version number                                   [boolean]
  -h, --help     Show help                                             [boolean]
```

## Create

Executes Mochi from a given template. A mochi execution is broken down into three steps:

-   Template aggregation
-   Prompting the user for tokens
-   File I/O

**Template aggregation**: Mochi will recursively crawl the provided template looking for other templates (specified by the `include` array) to include in the execution.

**Prompting the user for tokens**: Mochi will ask the user to provide values for the tokens found within the aggregated mochi configuration.

Example:

```
~/workshop/mochi/cli$ mochi-cli create "react-component" --destination ./tmp

Mochi will now prompt you to provide values for the following tokens found in your .mochi.mdx file(s): COMPONENT_NAME, TYPE_NAME

COMPONENT_NAME => Calendar
TYPE_NAME => CalendarView

🥳 Success! Thank you for using mochi-cli 😍
╔═══════════════════════╤═══════════════════════════╤═══════════════════════╗
║ Template              │ Destination               │ Dependencies          ║
╟───────────────────────┼───────────────────────────┼───────────────────────╢
║ react-component       │ tmp/Calendar.tsx          │ react-component-types ║
╟───────────────────────┼───────────────────────────┼───────────────────────╢
║ react-component-types │ tmp/CalendarView.types.ts │ react-component       ║
╚═══════════════════════╧═══════════════════════════╧═══════════════════════╝
```

```
mochi-cli create [template]

Create a file from the given template

Options:
      --version      Show version number                               [boolean]
  -t, --template                                             [string] [required]
  -d, --destination                                                     [string]
  -h, --help         Show help                                         [boolean]
```

### Examples

Minimum:

```
mochi-cli create prettierrc
```

With destination:

```
mochi-cli create prettierrc --destination="./src"
```

With file path (instead of template name):

```
mochi-cli create /home/users/chancehl/workspace/templates/prettierrc.mochi.mdx
```

## Save

Saves the mochi template to the `os.tmpdir` directory (this is where mochi will look for templates by default).

Use this when you want to cache the templates on disk, rather than in your project directly or in the mochi remote repository (coming soon).

```
mochi-cli save [template]

Saves the specified mochi configuration in a tmp directory

Options:
      --version   Show version number                                  [boolean]
  -t, --template                                             [string] [required]
  -h, --help      Show help                                            [boolean]
```

### Examples

Minimal:

```
mochi save /home/users/chancehl/workspace/templates/prettierrc.mochi.mdx
```

## [Experimental] Push

Coming soon!

## [Experimental] Pull

Coming soon!

## [Experimental] Login

Coming soon!
