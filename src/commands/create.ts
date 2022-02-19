import fs from 'fs'
import path from 'path'

import type { Arguments, CommandBuilder } from 'yargs'

import { parseMochiConfig, parseMochiTemplate, scanForTemplate } from '../utils/parser'
import { prompt } from '../utils/prompt'
import { TokenMap } from '../types/mochi'

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

    let fileName = config.fileName ?? 'mochifile.txt'
    let tokenMap = {} as TokenMap

    for (const token of config.tokens) {
        tokenMap[token] = await prompt(`${token}:`)
    }

    // replace tokens
    Object.keys(tokenMap).forEach((key) => {
        // replace contents
        contents = contents.replaceAll(key, tokenMap[key])

        // if file name contains this key, update the fileName
        if (fileName?.includes(key)) {
            fileName = fileName.replaceAll(`[${key}]`, tokenMap[key])
        }
    })

    try {
        // update dest
        if (dest && !fs.existsSync(dest)) {
            // create dest dir
            fs.mkdirSync(dest)
        }

        let output = path.join(dest ?? '', fileName)

        fs.writeFileSync(output, contents, { flag: 'a+' })

        console.log(`Created file ${output}`)
    } catch (error) {
        console.log(error)
        process.exit(1)
    }

    process.exit(0)
}
