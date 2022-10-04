import fs from 'fs'
import os from 'os'
import glob from 'glob'

import { TemplateService } from '../../src/services/templateService'

// mock node internals
jest.mock('fs')
jest.mock('os')
jest.mock('glob')

const MOCK_FS = fs as jest.Mocked<typeof fs>
const MOCK_OS = os as jest.Mocked<typeof os>
const MOCK_GLOB = glob as jest.Mocked<typeof glob>

const MOCK_MOCHI_TEMPLATE_FILE = 'ReactComponent.mochi.mdx'
const MOCK_TEMPLATE_LOCATION = '/test'
const MOCK_TEMPLATE_NAME = 'ReactComponent'
const MOCK_INVALID_TEMPLATE_NAME = 'test/invalid-template'
const MOCK_FILE_NAME = 'test-file.js'
const MOCK_VALID_MOCHI_CONFIG_FILE_CONTENTS = `
    import React from 'react';
    
    export const MyReactComponent = () => <div>Hello, world!</div>

    \`\`\`mochi
    {
        "templateName": "${MOCK_TEMPLATE_NAME}",
        "fileName": "${MOCK_FILE_NAME}"
    }
    \`\`\`
`
const MOCK_INVALID_TEMPLATE_NAME_MOCHI_FILE_CONTENTS = `
    module.exports = { /* no-op */ };

    \`\`\`mochi
    {
        "templateName": "${MOCK_INVALID_TEMPLATE_NAME}",
        "fileName": "${MOCK_FILE_NAME}"
    }
    \`\`\`
`
const MOCK_VALID_MOCHI_CONFIG = { templateName: MOCK_TEMPLATE_NAME, fileName: MOCK_FILE_NAME }

describe('template service', () => {
    const templateService = new TemplateService({
        fs: MOCK_FS,
        os: MOCK_OS,
        glob: MOCK_GLOB,
    })

    beforeEach(() => jest.resetAllMocks())

    describe('save', () => {
        test('throws error if the provided file path does not exist', () => {
            MOCK_FS.readFileSync = jest.fn().mockImplementationOnce(() => null)

            expect(async () => {
                await templateService.save(MOCK_TEMPLATE_LOCATION)
            }).rejects.toThrowError(/Could not read mochi template/)
        })

        test('throws if the provided file does not contain a mochi config', () => {
            MOCK_FS.readFileSync = jest.fn().mockImplementationOnce(() => `I am not a valid mochi configuration`)

            expect(async () => {
                await templateService.save(MOCK_TEMPLATE_LOCATION) // this is invoked with an invalid file path, but since we're mocking the return value above, it doesn't matter
            }).rejects.toThrowError(/Could not find mochi configuration/)
        })

        test('throws if the provided file contains an invalid template name', () => {
            MOCK_FS.readFileSync = jest.fn().mockImplementationOnce(() => MOCK_INVALID_TEMPLATE_NAME_MOCHI_FILE_CONTENTS)

            expect(async () => {
                await templateService.save(MOCK_TEMPLATE_LOCATION) // this is invoked with an invalid file path, but since we're mocking the return value above, it doesn't matter
            }).rejects.toThrowError(new RegExp(`Template name must only contain alphanumeric characters: ${MOCK_INVALID_TEMPLATE_NAME}`))
        })
    })

    describe('parse', () => {
        test('throws error if the provided file path does not exist', () => {
            MOCK_FS.readFileSync = jest.fn().mockImplementationOnce(() => null)

            expect(() => {
                templateService.parse(MOCK_TEMPLATE_LOCATION)
            }).toThrowError(/Could not read mochi template/)
        })

        test('throws if the provided file does not contain a mochi config', () => {
            MOCK_FS.readFileSync = jest.fn().mockImplementationOnce(() => `I am not a valid mochi configuration`)

            expect(() => {
                templateService.parse(MOCK_TEMPLATE_LOCATION) // this is invoked with an invalid file path, but since we're mocking the return value above, it doesn't matter
            }).toThrowError(/Could not find mochi configuration/)
        })

        test('correctly parses a mochi config', () => {
            MOCK_FS.readFileSync = jest.fn().mockImplementationOnce(() => MOCK_VALID_MOCHI_CONFIG_FILE_CONTENTS)

            const config = templateService.parse(MOCK_TEMPLATE_LOCATION)

            expect(config).toBeDefined()
            expect(config.fileName).toEqual(MOCK_FILE_NAME)
            expect(config.templateName).toEqual(MOCK_TEMPLATE_NAME)
        })
    })

    describe('scan', () => {
        test(`returns null of the template can't be found`, () => {
            MOCK_OS.tmpdir = jest.fn().mockImplementationOnce(() => '/tmp')
            MOCK_FS.existsSync = jest.fn().mockImplementationOnce((_: string) => false)

            expect(templateService.scan(MOCK_TEMPLATE_NAME)).toEqual(null)
        })

        test('returns a tuple containing the config and the file location if found', () => {
            MOCK_OS.tmpdir = jest.fn().mockImplementationOnce(() => '/tmp')
            MOCK_FS.existsSync = jest.fn().mockImplementationOnce((_: string) => true)
            MOCK_GLOB.sync = jest.fn().mockImplementationOnce(() => [MOCK_MOCHI_TEMPLATE_FILE])

            templateService.parse = jest.fn().mockImplementationOnce(() => MOCK_VALID_MOCHI_CONFIG)

            const result = templateService.scan(MOCK_TEMPLATE_NAME)

            // it is safe to use the non-null assertion operator (!) because we're mocking the return value above. we know it won't be null.
            const [config, loc] = result!

            expect(config).toEqual(MOCK_VALID_MOCHI_CONFIG)
            expect(loc).toEqual(MOCK_MOCHI_TEMPLATE_FILE)
        })
    })
})
