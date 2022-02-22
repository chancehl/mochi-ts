import { Interface as ReadLineInterface, ReadLineOptions, createInterface } from 'readline'

/**
 * Singleton wrapper around the readline class.
 *
 * More information on why this is necessary here: https://stackoverflow.com/questions/30174078/how-to-define-singleton-in-typescript
 */
class ReadLineInterfaceSingleton {
    private static interface: ReadLineInterface

    private constructor() {}

    public static getInterface = (options?: ReadLineOptions) => {
        if (this.interface == null) {
            this.interface = createInterface({
                input: options?.input ?? process.stdin,
                output: options?.output ?? process.stdout,
            })
        }

        return this.interface
    }
}

/**
 * Prompts the user for input
 *
 * @param message The message to prompt for
 * @param options ReadLineOptions object
 * @returns
 */
export const prompt = async (message: string, options?: ReadLineOptions): Promise<string> => {
    const readlineInterface = ReadLineInterfaceSingleton.getInterface(options)

    return new Promise((resolve) => {
        readlineInterface.question(message, (answer: string) => {
            resolve(answer)
        })
    })
}
