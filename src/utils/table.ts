import chalk from 'chalk'
import { HEXES } from '../constants'
import { MochiConfiguration } from '../types/mochi'

export const generateTableData = (configs: MochiConfiguration[]): Array<Array<string>> => {
    const headers = ['Template', 'Destination', 'Dependencies'].map((value) => chalk.hex(HEXES.mochi).bold(value))

    // prettier-ignore
    const body = configs.map(({ templateName, destination = 'N/A', include = [] }) => [
        chalk.bold(templateName),
        destination,
        include?.join(', ') ?? 'None',
    ])

    return [headers, ...body]
}
