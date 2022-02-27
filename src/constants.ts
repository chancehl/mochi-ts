import chalk from 'chalk'
import pkg from '../package.json'

/**
 * This regex is used to parse the file contents from a .mdx file
 */
export const MOCHI_TEMPLATE_REGEX = /\s+`{3}mochi(.|\n)+`{3}/gm

/**
 * This regex is used to parse the mochi config code block from a .mdx file
 */
export const MOCHI_CONFIG_REGEX = /`{3}mochi(.|\n)+`{3}/gm

/**
 * This regex parses the backticks for the code block out of a .mdx file
 */
export const BACKTICKS_REGEX = /`{3}(mochi)?/gm

/**
 * Color hexes for chalk
 */
export const HEXES = {
    mochi: '#98FF98',
}

/**
 * This glob represents what we expect to be living in tmp dir
 */
export const MOCHI_TEMPLATE_FILE_GLOB = '**/*.mochi.mdx'

/**
 * The strings used within the application
 */
export const STRINGS = {
    create: {
        prompt: `Mochi will now prompt you to provide values for the following tokens found in your ${chalk.bold('.mochi.mdx')} file(s)`,
        success: `🥳 ${chalk.hex(HEXES.mochi)('Success!')}`,
        filesCreated: `The following files were created from this operation:`,
        thankYou: `Thank you for using ${chalk.hex(HEXES.mochi).bold(pkg.name)} 😍`,
    },
    save: {
        success: `🥳 ${chalk.hex(HEXES.mochi)('Success!')}`,
        filesCreated: `${chalk.hex(HEXES.mochi).bold(pkg.name)} saved your template to`,
    },
}
