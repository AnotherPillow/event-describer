import type { OutputFormat, Replacer } from "./types";

class Formatted {
    constructor(private format: OutputFormat) {}

    Header(h_number: number, text: string): string {
        return {
            markdown: `${'#'.repeat(h_number)} ${text}`,
            bbcode: `<font size="${7 - h_number}">${text}</font>`,
            wikitext: `${'='.repeat(h_number)} ${text} ${'='.repeat(h_number)}`,
        }[this.format]
    }

    List(itemsStringArray: string[]): string {
        return {
            markdown: '- ' + itemsStringArray.join('\n- '),
            bbcode: `[list][*] ${itemsStringArray.join('\n[*] ')}[/list]`,
            wikitext: '* ' + itemsStringArray.join('\n* '),
        }[this.format]
    }
    
    Code(text: string): string {
        return {
            markdown: '`' + text + '`',
            bbcode: `[font=Lucida Sans Unicode]${text}[/font]`,
            wikitext: `<code>${text}</code>`
        }[this.format]
    }
}

const parseTokens = (text: string, tokens: Map<RegExp, Replacer>) => {
    for (const key of tokens.keys()) {
        text = text.replaceAll(key, tokens.get(key)!)
    }
    return text
}

const chunk = <T>(arr: T[], size: number = 2): T[][] =>
    arr.reduce((result: T[][], item: T, index: number) => {
        if (index % size === 0) result.push([item]);
        else result[result.length - 1].push(item);
        return result;
    }, []);

const ngt = (isNegated: boolean) => isNegated ? ' not' : ''

const QUERIES = new Map<string, (value: string, isNegated: boolean) => string>([
    ['GameStateQuery', (value: string, isNegated: boolean) => `Some GSQ (${value}). negated=${isNegated}. i can't parse that yw`],
    ['ActiveDialogueEvent', (value: string, isNegated: boolean) => `The special dialogue event ${value} is${ngt(isNegated)} active.`],
    ['DayOfMonth', (value: string, isNegated: boolean) => `The day of the month is${ngt(isNegated)} one of ${value}.`],
    ['DayOfWeek', (value: string, isNegated: boolean) => `The day of the week is${ngt(isNegated)} one of ${value}.`],
    ['FestivalDay', (value: string, isNegated: boolean) => `It is currently${ngt(isNegated)} a festival day.`],
    ['GoldenWalnuts', (value: string, isNegated: boolean) => `Players in total have${ngt(isNegated)} found at least ${value} golden walnuts.`],
    ['InUpgradedHouse', (value: string, isNegated: boolean) => `The current location is${ngt(isNegated)} a farmhouse or cabin, and it has been upgraded at least ${value || '2'} times.`],
    ['NPCVisible', (value: string, isNegated: boolean) => `The NPC ${value} is${ngt(isNegated)} visible in any location.`],
    ['NPCVisibleHere', (value: string, isNegated: boolean) => `The NPC ${value} is${ngt(isNegated)} visible in the current location.`],
    ['Random', (value: string, isNegated: boolean) => `A random ${isNegated ? 100 - (parseFloat(value) * 100) : parseFloat(value) * 100}% chance passes.`],
    ['Season', (value: string, isNegated: boolean) => `The current season is${ngt(isNegated)} one of ${value}.`],
    ['Time', (value: string, isNegated: boolean) => `The current time is${ngt(isNegated)} between ${value.split(' ').join(' and ')}`],
    ['UpcomingFestival', (value: string, isNegated: boolean) => `A festival will${ngt(isNegated)} occur within ${value} days.`],
    ['Weather', (value: string, isNegated: boolean) => `The current location's weather is${ngt(isNegated)} ${value}`],
    ['WorldState', (value: string, isNegated: boolean) => `The world state ID ${value} is${ngt(isNegated)} active anywhere.`],
    ['Year', (value: string, isNegated: boolean) => value.trim() == '1' ? `It must${ngt(isNegated)} be the first year.` : `The current year must${ngt(isNegated)} be at least ${value}`],
    ['ChoseDialogueAnswers', (value: string, isNegated: boolean) => `The current player has${ngt(isNegated)} chosen all of the following: dialogue answer IDs ${value}.`],
    ['Dating', (value: string, isNegated: boolean) => `The current player is${ngt(isNegated)} dating ${value}.`],
    ['EarnedMoney', (value: string, isNegated: boolean) => `The current player has ${ngt(isNegated)} earned at least ${value}.`],
    ['FreeInventorySlots', (value: string, isNegated: boolean) => `The current player has${ngt(isNegated)} at least ${value} free inventory slots.`],
    ['Friendship', (value: string, isNegated: boolean) => {
        console.log('friendship', value, isNegated)
        const pairs = chunk(value.split(' ').filter(x => x.trim()), 2)
        const hpairs = pairs.map(([name, points]) => `${(parseInt(points) / 250).toFixed(2).replace(/\.00$/, '')} hearts with ${name}`)
        return `The current player ${isNegated ? 'does not' : 'has'} at least${hpairs.length == 1 ? '' : ':'} ${hpairs.join(', ')}.`
    }],
    ['Gender', (value: string, isNegated: boolean) => `The current player is${ngt(isNegated)} ${value.toLowerCase().trim() == 'male' ? 'male' : 'not male'}.`],
    ['HasItem', (value: string, isNegated: boolean) => `The current player has${ngt(isNegated)} got the item ${value} in their inventory.`],
    ['HasMoney', (value: string, isNegated: boolean) => `The current player has${ngt(isNegated)} got at least ${value} money on hand.`],
    ['LocalMail', (value: string, isNegated: boolean) => `The current player has${ngt(isNegated)} received the mail ${value}.`],
    ['ReachedMineBottom', (value: string, isNegated: boolean) => `The current player has${ngt(isNegated)} reached the bottom of the mine ${value || '1'} times.`],
    ['Roommate', (value: string, isNegated: boolean) => `The current player is${ngt(isNegated)} roommates with any NPC.`],
    ['SawEvent', (value: string, isNegated: boolean) => `The current player has${ngt(isNegated)} seen any of the events ${value}.`],
    ['SawSecretNote', (value: string, isNegated: boolean) => `The current player has${ngt(isNegated)} seen secret note ${value}.`],
    ['Shipped', (value: string, isNegated: boolean) => {
        console.log('shipped', value, isNegated)
        const pairs = chunk(value.split(' ').filter(x => x.trim()), 2)
        const hpairs = pairs.map(([amount, name]) => `${amount} of ${name}`)
        return `The current player has${ngt(isNegated)} shipped at least${hpairs.length == 1 ? '' : ':'} ${hpairs.join(', ')}.`
    }],
    ['Skill', (value: string, isNegated: boolean) => `The current player has${ngt(isNegated)} reached level ${value.split(' ').toReversed().join(' in ')}.`],
    ['Spouse', (value: string, isNegated: boolean) => `The current player is${ngt(isNegated)} married or engaged to ${value}.`],
    ['SpouseBed', (value: string, isNegated: boolean) => `The current player has${ngt(isNegated)} got a double bed in their house (or a single bed with a roommate).`], // will never match with krobus. maybe should specify? eh.
    ['Tile', (value: string, isNegated: boolean) => {
        console.log('tile', value, isNegated)
        const pairs = chunk(value.split(' ').filter(x => x.trim()), 2)
        return `The current player is${ngt(isNegated)} standing on the tile ${pairs.join(', ')}.`
    }],
    ['CommunityCenterOrWarehouseDone', (value: string, isNegated: boolean) => `The host player has${ngt(isNegated)} completed the Community Centre/Joja Warehouse`],
    ['DaysPlayed', (value: string, isNegated: boolean) => `The host player has${ngt(isNegated)} played at least ${value} days.`],
    ['HostMail', (value: string, isNegated: boolean) => `The host player has${ngt(isNegated)} received the mail ${value}.`],
    ['HostOrLocalMail', (value: string, isNegated: boolean) => `The host player or the current player has${ngt(isNegated)} received the mail ${value}.`],
    ['IsHost', (value: string, isNegated: boolean) => `The current player is${ngt(isNegated)} the host.`],
    ['JojaBundlesDone', (value: string, isNegated: boolean) => `All joja bundles are${ngt(isNegated)} completed.`],
])

const rewriteQueryName = (name: string) => {
    return {
        q: 'ChoseDialogueAnswers',
        C: 'CommunityCenterOrWarehouseDone',
        D: 'Dating',
        u: 'DayOfMonth',
        j: 'DaysPlayed',
        m: 'EarnedMoney',
        c: 'FreeInventorySlots',
        f: 'Friendship',
        G: 'GameStateQuery',
        g: 'Gender',
        N: 'GoldenWalnuts',
        i: 'HasItem',
        M: 'HasMoney',
        Hn: 'HostMail',
        "*n": 'HostOrLocalMail',
        L: 'InUpgradedHouse',
        H: 'IsHost',
        J: 'JojaBundlesDone',
        n: 'LocalMail',
        h: 'MissingPet',
        v: 'NPCVisible',
        p: 'NpcVisibleHere',
        r: 'Random',
        b: 'ReachedMineBottom',
        R: 'Roommate',
        e: 'SawEvent',
        S: 'SawSecretNote',
        s: 'Shipped',
        O: 'Spouse',
        B: 'SpouseBed',
        a: 'Tile',
        t: 'Time',
        w: 'Weather',
        "*": 'WorldState',
        y: 'Year',
        NotActiveDialogueEvent: '!ActiveDialogueEvent',
        A: '!ActiveDialogueEvent',
        NotCommunityCenterOrWarehouseDone: '!CommunityCenterOrWarehouseDone',
        X: '!CommunityCenterOrWarehouseDone',
        NotDayOfWeek: '!DayOfWeek',
        d: '!DayOfWeek',
        NotFestivalDay: '!FestivalDay',
        F: '!FestivalDay',
        NotHostMail: '!HostMail',
        Hl: '!HostMail',
        NotHostOrLocalMail: '!HostOrLocalMail',
        '*l': '!HostOrLocalMail',
        NotLocalMail: '!LocalMail',
        l: '!LocalMail',
        NotRoommate: '!Roommate',
        Rf:	'!Roommate',
        NotSawEvent: '!SawEvent',
        k: '!SawEvent',
        NotSeason: '!Season',
        z: '!Season',
        NotSpouse: '!Spouse',
        o: '!Spouse',
        NotUpcomingFestival: '!UpcomingFestival',
        U: '!UpcomingFestival',
    }[name] ?? name
}

export default function describeEvent(parsedContentPatcher: {Format?: string, Changes: any[], ConfigSchema?: any, DynamicTokens?: any}, mode: OutputFormat, uniqueid: string): string {
    const TOKENS = new Map<RegExp, Replacer>([
        [/{{ModId}}/g, () => uniqueid],
        [/{{Range:\s*?(\d+),\s*?(\d+)\s*?(\|step=(\d+))?}}/g, (fullMatch: string, capture1: string, capture2: string, fullStepCapture?: string, stepCount?: string) => {
            console.log(fullMatch)
            const min = parseInt(capture1)
            const max = parseInt(capture2)
            const step = stepCount ? parseInt(stepCount) : 1
            
            let arr = [];
            for (let i = min; i < max + 1; i += step) { arr.push(i) }

            return arr.join(', ')
        }],
    ]);

    const F = new Formatted(mode)

    let output = ''

    for (const change of parsedContentPatcher.Changes) {
        if (!change.Target.startsWith('Data/Events')) continue;
        if (change.Action != 'EditData') continue;
        if (change.When) continue; // no. just no. there are preconditions for a reason probably
        if (!change.Entries) continue;

        const location = change.Target.split('/').at(-1)

        for (const key of Object.keys(change.Entries)) {
            const keyParts = key.split('/')
            const isForked = keyParts.length == 1
            const eventId = parseTokens(keyParts[0], TOKENS)
            const preconditions = isForked ? null : keyParts.slice(1)

            output += `${F.Header(2, `${eventId}${isForked ? ' (fork!)' : ''}`)}\n\n`
            
            output += `${F.Header(3, `Location`)}\n\n`
            output += `Takes place in: ${F.Code(parseTokens(location, TOKENS))}\n\n`

            output += `${F.Header(3, `Requirements`)}\n\n`
            if (preconditions == null) output += `none! it's a fork of another event, so that has to call it\n\n`
            else {
                let humanArray: string[] = []
                
                for (const unparsedPrecondition of preconditions) {
                    const parsedPrecondition = parseTokens(unparsedPrecondition, TOKENS)
                    console.log({parsedPrecondition})
                    const queryNameRaw = parsedPrecondition.split(' ')[0]
                    const queryNameSemi = rewriteQueryName(queryNameRaw)
                    console.log({queryNameSemi})
                    const isNegated = queryNameSemi.startsWith('!')
                    const queryName = isNegated ? queryNameSemi.slice(1) : queryNameSemi
                    console.log({queryName})
                    const queryValue = parsedPrecondition.slice(queryNameRaw.length).trimStart()
                    console.log({queryValue})

                    if (QUERIES.has(queryName)) {
                        const queryHuman = QUERIES.get(queryName)!(queryValue, isNegated)
                        humanArray.push(queryHuman)
                    } else {
                        humanArray.push(parsedPrecondition)
                    }
                }
                
                output += `${F.List(humanArray)}\n\n`
            }


        }

    }

    return output || 'oopsie doopsies'
}