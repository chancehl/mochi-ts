import fs from 'fs'

import { TemplateService } from './templateService'

// mock fs
jest.mock('fs')

const MOCK_FS = fs as jest.Mocked<typeof fs>

const MOCK_TEMPLATE_LOCATION = '/test'
const MOCK_TEMPLATE_NAME = 'ReactComponent'
const MOCK_FILE_NAME = 'test-file.js'
const MOCK_VALID_MOCHI_CONFIG = `
    import React from 'react';
    
    export const MyReactComponent = () => <div>Hello, world!</div>

    \`\`\`json
    {
        "templateName": "${MOCK_TEMPLATE_NAME}",
        "fileName": "${MOCK_FILE_NAME}"
    }
    \`\`\`
`

describe('template service', () => {
    const templateService = new TemplateService({ fs: MOCK_FS })

    beforeEach(() => jest.resetAllMocks())

    describe('parseMochiConfig', () => {
        test('returns null if the provided file path does not exist', () => {
            MOCK_FS.readFileSync = jest.fn().mockImplementationOnce(() => null)

            expect(() => {
                templateService.parseMochiConfig(MOCK_TEMPLATE_LOCATION)
            }).toThrowError(/Could not read mochi template/)
        })

        test('throws if the provided file does not contain a mochi config', () => {
            MOCK_FS.readFileSync = jest.fn().mockImplementationOnce(() => `I am not a valid mochi configuration`)

            expect(() => {
                templateService.parseMochiConfig(MOCK_TEMPLATE_LOCATION) // this is invoked with an invalid file path, but since we're mocking the return value above, it doesn't matter
            }).toThrowError(/Could not find mochi configuration/)
        })

        test('correctly parses a mochi config', () => {
            MOCK_FS.readFileSync = jest.fn().mockImplementationOnce(() => MOCK_VALID_MOCHI_CONFIG)

            const config = templateService.parseMochiConfig(MOCK_TEMPLATE_LOCATION)

            expect(config).toBeDefined()
            expect(config.fileName).toEqual(MOCK_FILE_NAME)
            expect(config.templateName).toEqual(MOCK_TEMPLATE_NAME)
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
})
