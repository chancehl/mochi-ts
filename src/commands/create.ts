import fs from 'fs'
import path from 'path'
import type { Arguments, CommandBuilder } from 'yargs'

type Options = {
    template: string
}

export const command: string = 'create [template]'
export const desc: string = 'Create a file from the given template'

// prettier-ignore
export const builder: CommandBuilder<Options, Options> = (yargs) =>
    yargs
        .option('template', { type: 'string', alias: 't', demandOption: true })

export const handler = (argv: Arguments<Options>): void => {
    const { template } = argv

    process.stdout.write(template)
    process.exit(0)
}
