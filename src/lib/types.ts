export type OutputFormat = 'markdown' | 'bbcode' | 'wikitext'

// very cursed
export type ReplaceAll = String["replaceAll"];

export type Replacer =
    ReplaceAll extends (
        search: any,
        replacer: infer R
    ) => any
        ? R
        : never;