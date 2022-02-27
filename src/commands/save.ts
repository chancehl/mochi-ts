import fs from 'fs'
import path from 'path'
import chalk from 'chalk'

import type { Arguments, CommandBuilder } from 'yargs'

import { TemplateService } from '../services/templateService'
import { reportSaveSuccess } from '../utils/stdout'

export type SaveOptions = { template: string }

export const command: string = 'save [template]'
export const desc: string = 'Saves the specified mochi configuration in a tmp directory'

// prettier-ignore
export const builder: CommandBuilder<SaveOptions, SaveOptions> = (yargs) =>
    yargs
        .option('template', { type: 'string', alias: 't', demandOption: true })

export const handler = async (argv: Arguments<SaveOptions>): Promise<void> => {
    const templateService = new TemplateService()

    const { template } = argv

    const relativeFilePath = path.join(__dirname, template)
    const absoluteFilePath = path.join(template)

    let location = null

    if (fs.existsSync(relativeFilePath)) {
        location = relativeFilePath
    } else if (fs.existsSync(absoluteFilePath)) {
        location = absoluteFilePath
    }

    if (location == null) {
        console.error(`Could not locate a mochi template file with the name ${chalk.bold(template)}`)
        process.exit(1)
    }

    // If we've made it this far, we're safe to move this file
    const destination = await templateService.save(location)

    reportSaveSuccess(destination)

    process.exit(0)
}
