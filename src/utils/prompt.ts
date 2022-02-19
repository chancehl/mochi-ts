import readline from 'readline'

const readlineInterface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
})

export const prompt = async (message: string): Promise<string> => {
    return new Promise((resolve) => {
        readlineInterface.question(message, (answer: string) => {
            resolve(answer)
        })
    })
}
