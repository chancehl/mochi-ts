import fs from 'fs'
import path from 'path'
import chalk from 'chalk'

import type { Arguments, CommandBuilder } from 'yargs'

import { parseMochiConfig, parseMochiTemplate, scanForTemplate, prompt } from '../utils'
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

    if (fs.existsSync(relativeFilePath)) {
        location = relativeFilePath
    } else if (fs.existsSync(absoluteFilePath)) {
        location = absoluteFilePath
    } else {
        const [_, loc] = scanForTemplate(template) ?? []

        location = loc
    }

    if (location == null) {
        console.error(`Could not locate a mochi template file with the name ${template}`)
        process.exit(1)
    }

    // if we've made it here, we're good to greet the user and run mochi
    console.log(`Thank you for using ${chalk.hex(HEXES.mochi).bold('Mochi')} 😍`)
    console.log(`Mochi will now prompt you to provide values for the tokens in your ${chalk.bold('.mochi.mdx')} file\n`)

    const config = parseMochiConfig(location)
    let contents = parseMochiTemplate(location)

    for (const token of config.tokens) {
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

        console.log(`\nWoohoo! I just created ${chalk.hex(HEXES.mochi).bold(output)} for you 🥳`)
        process.exit(0)
    } catch (error: any) {
        console.log(error.message)
        process.exit(1)
    }
}
