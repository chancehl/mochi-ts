export type MochiConfiguration = {
    templateName: string
    tokens: string[]
    fileName: string
    include?: string[]
    destination?: string
}

export type TemplateScanResults = [MochiConfiguration, string] | null
