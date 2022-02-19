import fs from 'fs'

import type { MochiConfiguration } from '../types/mochi'

export const MOCHI_TEMPLATE_REGEX = /\s+`{3}json(.|\n)+`{3}/gm
export const MOCHI_CONFIG_REGEX = /`{3}json(.|\n)+`{3}/gm
export const BACKTICKS_REGEX = /`{3}(json)?/gm

/**
 * Parses and returns a mochi configuration object from a specified file path
 *
 * @param filePath The file path of the configuration
 * @returns MochiConfiguration
 */
export const parseMochiConfig = (filePath: string): MochiConfiguration => {
    const contents = fs.readFileSync(filePath, { encoding: 'utf-8' })

    const [rawMochiConfig] = contents.match(MOCHI_CONFIG_REGEX) ?? []

    if (rawMochiConfig == null) {
        throw new Error(`Could not find mochi configuration in file ${filePath}`)
    }

    const sanitizedRawMochiConfig = rawMochiConfig.replace(BACKTICKS_REGEX, '')
    const mochiConfig = JSON.parse(sanitizedRawMochiConfig)

    return mochiConfig
}

/**
 * Parses the mochi template
 *
 * @param filePath The path to the file to parse
 * @returns string
 */
export const parseMochiTemplate = (filePath: string) => fs.readFileSync(filePath, { encoding: 'utf-8' }).replace(MOCHI_TEMPLATE_REGEX, '')
