import { default as fileSystem } from 'fs'
import { default as operatingSystem } from 'os'
import { default as glob } from 'glob'
import { default as path } from 'path'

import type { AggregateMochiConfiguration, MochiConfiguration, TemplateScanResults } from '../types/mochi'

import { BACKTICKS_REGEX, MOCHI_CONFIG_REGEX, MOCHI_TEMPLATE_REGEX, MOCHI_TEMPLATE_FILE_GLOB } from '../constants'

export class TemplateService {
    private fs: typeof fileSystem
    private os: typeof operatingSystem
    private glob: typeof glob

    public constructor(options?: { fs?: typeof fileSystem; os?: typeof operatingSystem; glob?: typeof glob }) {
        this.fs = options?.fs ?? fileSystem
        this.os = options?.os ?? operatingSystem
        this.glob = options?.glob ?? glob
    }

    /**
     * Parses and returns a mochi configuration object from a specified file path
     *
     * @param filePath The file path of the configuration
     * @returns MochiConfiguration
     */
    public parse = (filePath: string): MochiConfiguration => {
        const contents = this.fs.readFileSync(filePath, { encoding: 'utf-8' })

        if (contents == null) {
            throw new Error(`Could not read mochi template at ${filePath}`)
        }

        const [rawMochiConfig] = contents?.match(MOCHI_CONFIG_REGEX) ?? []

        if (rawMochiConfig == null) {
            throw new Error(`Could not find mochi configuration in file ${filePath}`)
        }

        const sanitizedRawMochiConfig = rawMochiConfig.replace(BACKTICKS_REGEX, '')
        const mochiConfig = JSON.parse(sanitizedRawMochiConfig) as MochiConfiguration

        mochiConfig.template = contents.replace(MOCHI_TEMPLATE_REGEX, '')

        return mochiConfig
    }

    /**
     * Scans for a mochi template. If one exists with the given name, the config and the location are returned.
     *
     * @param templateName The name of the template to search for
     * @returns
     */
    public scan = (templateName: string): TemplateScanResults | null => {
        const tmpDir = this.os.tmpdir()
        const tmpDirPath = path.join(tmpDir, '.mochi')
        const tmpDirExists = this.fs.existsSync(tmpDirPath)

        if (!tmpDirExists) {
            // create this tmp dir for later
            this.fs.mkdirSync(tmpDirPath)

            // return null
            return null
        }

        const tmpDirFiles = this.glob.sync(tmpDirPath.concat(MOCHI_TEMPLATE_FILE_GLOB))

        for (const templateFile of tmpDirFiles) {
            const parsedMochiConfig = this.parse(templateFile)

            if (parsedMochiConfig?.templateName === templateName) {
                return [parsedMochiConfig, templateFile]
            }
        }

        return null
    }

    /**
     * Saves a mochi template to the local mochi repo
     *
     * @param templatePath The location of the template on disk
     * @returns
     */
    public save = async (templatePath: string): Promise<string> => {
        const contents = this.fs.readFileSync(templatePath, { encoding: 'utf-8' })

        if (contents == null) {
            throw new Error(`Could not read mochi template at ${templatePath}`)
        }

        const [rawMochiConfig] = contents?.match(MOCHI_CONFIG_REGEX) ?? []

        if (rawMochiConfig == null) {
            throw new Error(`Could not find mochi configuration in file ${templatePath}`)
        }

        const sanitizedRawMochiConfig = rawMochiConfig.replace(BACKTICKS_REGEX, '')
        const mochiConfig = JSON.parse(sanitizedRawMochiConfig) as MochiConfiguration

        // if our tmpDir does not exist, let's create it
        const tmpMochiDir = path.join(this.os.tmpdir(), '.mochi')

        if (!this.fs.existsSync(tmpMochiDir)) {
            this.fs.mkdirSync(tmpMochiDir)
        }

        const dest = path.join(tmpMochiDir, `${mochiConfig.templateName}.mochi.mdx`)

        this.fs.writeFileSync(dest, contents)

        return dest
    }

    /**
     * Crawls a Mochi configuration object scanning for nested templates and returns the aggregate
     *
     * @param config The inital config to scan
     * @param aggregateConfig The aggregate thusfar
     * @returns
     */
    public aggregate = (
        config: MochiConfiguration,
        aggregateConfig: AggregateMochiConfiguration = { compositeId: '', configs: [], map: {}, tokens: [] },
    ): AggregateMochiConfiguration => {
        let included = (config.include ?? []).filter((conf) => !Object.keys(aggregateConfig.map).includes(conf))

        if (aggregateConfig.map[config.templateName]) {
            return aggregateConfig
        }

        // always push the current config
        aggregateConfig = this.merge(config, aggregateConfig)

        for (const templateName of included) {
            const template = this.scan(templateName)

            if (template == null) {
                throw new Error(`Missing template ${templateName} found in ${config.templateName} or its dependencies`)
            }

            const [childConfiguration, location] = template

            aggregateConfig = this.aggregate({ ...childConfiguration, location }, aggregateConfig)
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
    private merge = (config: MochiConfiguration, aggregateConfig: AggregateMochiConfiguration) => {
        const tokens = config.tokens ?? []
        const filteredTokens = tokens.filter((token) => !aggregateConfig.tokens.includes(token))

        return {
            ...aggregateConfig,
            compositeId: aggregateConfig.compositeId.length ? `${aggregateConfig.compositeId}:${config.templateName}` : config.templateName,
            configs: [...aggregateConfig.configs, config],
            tokens: [...aggregateConfig.tokens, ...filteredTokens],
            map: { ...aggregateConfig.map, [config.templateName]: [...filteredTokens] },
        }
    }
}
