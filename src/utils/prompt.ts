import readline from 'readline'

export const prompt = async (message: string, options?: readline.ReadLineOptions): Promise<string> => {
    const readlineInterface = readline.createInterface({
        input: options?.input ?? process.stdin,
        output: options?.output ?? process.stdout,
    })

    return new Promise((resolve) => {
        readlineInterface.question(message, (answer: string) => {
            resolve(answer)
        })
    })
}
