export type MochiConfiguration = {
    templateName: string
    tokens: string[]
    fileName: string
    include?: string[]
    destination?: string
    location?: string
    template: string
}

export type AggregateMochiConfiguration = {
    compositeId: string
    configs: MochiConfiguration[]
    tokens: string[]
    map: Record<string, string[]>
}

export type TemplateScanResults = [MochiConfiguration, string] | null
