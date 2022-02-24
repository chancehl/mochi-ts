import { default as fileSystem } from 'fs'
import path from 'path'
import os from 'os'
import glob from 'glob'

import type { AggregateMochiConfiguration, MochiConfiguration, TemplateScanResults } from '../types/mochi'

import { BACKTICKS_REGEX, MOCHI_CONFIG_REGEX, MOCHI_TEMPLATE_REGEX } from '../constants'

export class TemplateService {
    private fs: typeof fileSystem

    public constructor(options?: { fs?: typeof fileSystem }) {
        this.fs = options?.fs ?? fileSystem
    }

    /**
     * Parses and returns a mochi configuration object from a specified file path
     *
     * @param filePath The file path of the configuration
     * @returns MochiConfiguration
     */
    public parseMochiConfig = (filePath: string): MochiConfiguration => {
        const contents = this.fs.readFileSync(filePath, { encoding: 'utf-8' })

        if (contents == null) {
            throw new Error(`Could not read mochi template at ${filePath}`)
        }

        const [rawMochiConfig] = contents?.match(MOCHI_CONFIG_REGEX) ?? []

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
    public parseMochiTemplate = (filePath: string): string => this.fs.readFileSync(filePath, { encoding: 'utf-8' }).replace(MOCHI_TEMPLATE_REGEX, '')

    /**
     * Scans for a mochi template. If one exists with the given name, the config and the location are returned.
     *
     * @param templateName The name of the template to search for
     * @returns
     */
    public scanForTemplate = (templateName: string): TemplateScanResults => {
        const tmpDir = os.tmpdir()
        const tmpDirPath = path.join(tmpDir, '.mochi')
        const tmpDirExists = this.fs.existsSync(tmpDirPath)

        if (!tmpDirExists) {
            // create this tmp dir for later
            this.fs.mkdirSync(tmpDirPath)

            // return null
            return null
        }

        const tmpDirFiles = glob.sync(tmpDirPath.concat('**/*.mochi.mdx'))

        for (const templateFile of tmpDirFiles) {
            const parsedMochiConfig = this.parseMochiConfig(templateFile)

            if (parsedMochiConfig?.templateName === templateName) {
                return [parsedMochiConfig, templateFile]
            }
        }

        return null
    }

    /**
     * Crawls a Mochi configuration object scanning for nested templates and returns the aggregate
     *
     * @param config The inital config to scan
     * @param aggregateConfig The aggregate thusfar
     * @returns
     */
    public aggregateMochiConfigs = (
        config: MochiConfiguration,
        aggregateConfig: AggregateMochiConfiguration = { compositeId: '', configs: [], map: {}, tokens: [] },
    ): AggregateMochiConfiguration => {
        let included = (config.include ?? []).filter((conf) => !Object.keys(aggregateConfig.map).includes(conf))

        if (aggregateConfig.map[config.templateName]) {
            return aggregateConfig
        }

        // always push the current config
        aggregateConfig = this.mergeConfigIntoAggregate(config, aggregateConfig)

        for (const templateName of included) {
            const template = this.scanForTemplate(templateName)

            if (template == null) {
                throw new Error(`Missing template ${templateName} found in ${config.templateName} or its dependencies`)
            }

            const [childConfiguration, location] = template

            return this.aggregateMochiConfigs({ ...childConfiguration, location }, aggregateConfig)
        }

        return aggregateConfig
    }

    /**
     * Merges a Mochi configuration object into an aggregate config object
     *
     * @param config The config being merged
     * @param aggregateConfig The aggregate config which will have `config` merged into it
     * @returns
     */
    private mergeConfigIntoAggregate = (config: MochiConfiguration, aggregateConfig: AggregateMochiConfiguration) => {
        const tokens = config.tokens ?? []

        return {
            ...aggregateConfig,
            compositeId: aggregateConfig.compositeId.length ? `${aggregateConfig.compositeId}:${config.templateName}` : config.templateName,
            configs: [...aggregateConfig.configs, config],
            tokens: [...aggregateConfig.tokens, ...tokens],
            map: { ...aggregateConfig.map, [config.templateName]: [...tokens] },
        }
    }
}
