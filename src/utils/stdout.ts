import chalk from 'chalk'

import { HEXES, STRINGS } from '../constants'
import { AggregateMochiConfiguration } from '../types/mochi'

export const reportCreateExpectingInput = (aggregatedConfig: AggregateMochiConfiguration) => {
    console.log(`${STRINGS.create.prompt}: ${aggregatedConfig.tokens.map((token) => `${chalk.hex(HEXES.mochi).bold(token)}`).join(', ')}\n`)
}

export const reportCreateSuccess = (files: string[]) => {
    // TODO: figure out a better way to tokenize this
    console.log(
        `\n` + `${STRINGS.create.success} ${STRINGS.create.filesCreated}\n`,
        `\n` + `${files.map((file) => `* ${chalk.hex(HEXES.mochi).bold(file)}`).join('\n')}.\n`,
        `\n` + STRINGS.create.thankYou,
    )
}

export const reportSaveSuccess = (dest: string) => {
    console.log(STRINGS.save.success, `\n` + STRINGS.save.filesCreated, chalk.bold(dest))
}
