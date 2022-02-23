import fs from 'fs'
import path from 'path'
import chalk from 'chalk'

import type { Arguments, CommandBuilder } from 'yargs'

import { parseMochiConfig, parseMochiTemplate, scanForTemplate, prompt, aggregateMochiConfigs } from '../utils'
import { HEXES } from '../constants'

export type CreateOptions = { template: string; destination?: string }

export const command: string = 'create [template]'
export const desc: string = 'Create a file from the given template'

// prettier-ignore
export const builder: CommandBuilder<CreateOptions, CreateOptions> = (yargs) =>
    yargs
        .option('template', { type: 'string', alias: 't', demandOption: true })
        .option('destination', { type: 'string', alias: 'd' })

export const handler = async (argv: Arguments<CreateOptions>): Promise<void> => {
    const { template, destination } = argv

    const relativeFilePath = path.join(__dirname, template)
    const absoluteFilePath = path.join(template)

    let location = null
    let dest = destination ?? null
    let filesCreated: string[] = []

    if (fs.existsSync(relativeFilePath)) {
        location = relativeFilePath
    } else if (fs.existsSync(absoluteFilePath)) {
        location = absoluteFilePath
    } else {
        const [_, loc] = scanForTemplate(template) ?? []

        location = loc
    }

    if (location == null) {
        console.error(`Could not locate a mochi template file with the name ${chalk.bold(template)}`)
        process.exit(1)
    }

    // parse the initial config from the CLI and then feed this into the aggregate function
    const aggregatedConfig = aggregateMochiConfigs({ ...parseMochiConfig(location), location })

    // Only tell the user we're going to prompt them if we actually have something to prompt for
    if (aggregatedConfig.tokens.length) {
        console.log(
            `Mochi will now prompt you to provide values for the following tokens found in your ${chalk.bold('.mochi.mdx')} file(s): ${aggregatedConfig.tokens
                .map((token) => `${chalk.hex(HEXES.mochi).bold(token)}`)
                .join(', ')}\n`,
        )
    }

    // if we've made it here, we're good to greet the user and run mochi
    for (const config of aggregatedConfig.configs) {
        // if we've got this far and we don't have a location, we're in an error state
        if (config.location == null) {
            throw new Error(`Encountered an invalid configuration ${config.templateName} (missing location from aggregate).`)
        }

        let contents = parseMochiTemplate(config.location)

        for (const token of config?.tokens ?? []) {
            const resp = await prompt(`${chalk.hex(HEXES.mochi)(token)} => `)

            // replace contents
            contents = contents.replaceAll(token, resp)

            // if file name contains this key, update the fileName
            if (config.fileName.includes(token) && resp.length) {
                config.fileName = config.fileName.replaceAll(`[${token}]`, resp)
            }
        }

        try {
            // if dest was provided and it doesn't already exist, create that dir
            if (dest && !fs.existsSync(dest)) {
                fs.mkdirSync(dest)
            }

            let output = path.join(dest ?? '', config.fileName)

            fs.writeFileSync(output, contents)

            filesCreated.push(output)
        } catch (error: any) {
            console.log(error.message)
            process.exit(1)
        }
    }

    console.log(`\n🥳 ${chalk.hex(HEXES.mochi)('Success!')} The following files were created from this operation:\n`)
    console.log(`${filesCreated.map((file) => `* ${chalk.hex(HEXES.mochi).bold(file)}`).join('\n')}`)
    console.log(`\nThank you for using ${chalk.hex(HEXES.mochi).bold('@mochi/cli')} 😍`)
    process.exit(0)
}
