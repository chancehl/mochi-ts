import chalk from 'chalk'
import { table } from 'table'

import { HEXES, STRINGS } from '../constants'
import { AggregateMochiConfiguration } from '../types/mochi'
import { generateTableData } from './table'

export const reportCreateExpectingInput = (aggregatedConfig: AggregateMochiConfiguration) => {
    console.log(`${STRINGS.create.prompt}: ${aggregatedConfig.tokens.map((token) => `${chalk.hex(HEXES.mochi).bold(token)}`).join(', ')}\n`)
}

export const reportCreateSuccess = (files: string[], aggregatedConfig: AggregateMochiConfiguration) => {
    // TODO: figure out a better way to tokenize this
    console.log(`\n` + `${STRINGS.create.success} ${STRINGS.create.thankYou}`)

    const finalConfigurations = aggregatedConfig.configs.map((config, index) => ({ ...config, destination: files[index] }))

    console.log(table(generateTableData(finalConfigurations)))
}

export const reportSaveSuccess = (dest: string) => {
    console.log(STRINGS.save.success, `\n` + STRINGS.save.filesCreated, chalk.bold(dest))
}
