import type { Arguments, CommandBuilder } from 'yargs'

export type TemplateOptions = { operation: string; name?: string }

export const command: string = 'template [operation] [name]'
export const desc: string = 'Pushes or pulls a template to/from the Mochi repository'

// prettier-ignore
export const builder: CommandBuilder<TemplateOptions, TemplateOptions> = (yargs) =>
    yargs
        .option('operation', { type: 'string', alias: 'o', demandOption: true })
        .option('name', { type: 'string', alias: 'n' })

// mochi template push ReactComponent
// mochi template push ./home/templates/ReactComponent.mochi.mdx
// mochi template push ReactComponent --name @chancehl/ReactComponent
// mochi template push ./home/templates/ReactComponent.mochi.mdx --name @chancehl/
// mochi template pull ReactComponent
export const handler = async (argv: Arguments<TemplateOptions>): Promise<void> => {
    const { operation, name } = argv

    console.log({ operation, name })

    if (operation === 'push') {
        console.log(`I should be pushing template ${name}`)
        process.exit(0)
    }

    if (operation === 'pull') {
        console.log(`I should be pulling template ${name}`)
        process.exit(0)
    }

    console.error(`Invalid operation: ${operation}`)
    process.exit(1)
}
