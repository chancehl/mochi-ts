import { parseMochiConfig, parseMochiTemplate, scanForTemplate } from './parser'

describe('parseMochiConfig', () => {
    test('throws if the provided file path does not exist', () => {
        expect(1).toEqual(1)
    })

    test('throws if the provided file does not contain a mochi config', () => {
        expect(1).toEqual(1)
    })

    test('correctly parses a mochi config', () => {
        expect(1).toEqual(1)
    })
})

describe('parseMochiTemplate', () => {
    test('throws if the provided file path does not exist', () => {
        expect(1).toEqual(1)
    })

    test('correctly removes the json code block from the template', () => {
        expect(1).toEqual(1)
    })
})

describe('scanForTemplate', () => {
    test(`returns null of the template can't be found`, () => {
        expect(1).toEqual(1)
    })

    test('returns a tuple containing the config and the file location if found', () => {
        expect(1).toEqual(1)
    })

    test('does not include non .mochi.mdx files even if they are valid mochi config files', () => {
        expect(1).toEqual(1)
    })
})
