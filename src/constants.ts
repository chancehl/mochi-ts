/**
 * This regex is used to parse the file contents from a .mdx file
 */
export const MOCHI_TEMPLATE_REGEX = /\s+`{3}json(.|\n)+`{3}/gm

/**
 * This regex is used to parse the mochi config code block from a .mdx file
 */
export const MOCHI_CONFIG_REGEX = /`{3}json(.|\n)+`{3}/gm

/**
 * This regex parses the backticks for the code block out of a .mdx file
 */
export const BACKTICKS_REGEX = /`{3}(json)?/gm
