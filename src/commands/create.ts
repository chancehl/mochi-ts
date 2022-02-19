import fs from 'fs'
import path from 'path'

import type { Arguments, CommandBuilder } from 'yargs'

import { parseMochiConfig, parseMochiTemplate, scanForTemplate, prompt } from '../utils'

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

    const config = parseMochiConfig(location)
    let contents = parseMochiTemplate(location)

    for (const token of config.tokens) {
        const resp = await prompt(`${token}:`)

        // replace contents
        contents = contents.replaceAll(token, resp)

        // if file name contains this key, update the fileName
        if (config.fileName.includes(token)) {
            config.fileName = config.fileName.replaceAll(`[${token}]`, resp)
        }
    }

    try {
        // update dest
        if (dest && !fs.existsSync(dest)) {
            // create dest dir
            fs.mkdirSync(dest)
        }

        let output = path.join(dest ?? '', config.fileName)

        fs.writeFileSync(output, contents)

        process.stdout.write(`Created file => ${output}`)
    } catch (error) {
        console.log(error)
        process.exit(1)
    }

    process.exit(0)
}
