export type MochiConfiguration = {
    templateName: string
    tokens: string[]
    fileName?: string
    include?: string[]
    destination?: string
}

export type TokenMap = Record<string, string>
