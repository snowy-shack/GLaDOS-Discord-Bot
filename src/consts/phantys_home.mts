import { isBeta } from "#src/envloader.mts";

// BETA : PRODUCTION
export const guildID: string = isBeta ? "1221613837384417300" : "704266427577663548";

export const channels: {[key: string]: string} = { // BETA : PRODUCTION
    Announcements: isBeta ? "1235600733093761156" : "876132326101360670",
    Arcade:        isBeta ? "1366358167159701594" : "704308600784420904",
    Art:           isBeta ? "1235600701602791455" : "981527027142262824",
    Counting:      isBeta ? "1349405350859640852" : "987038089144860765",
    Exclusive:     isBeta ? "1300736193524273192" : "1014798819306786856",
    Faq:           isBeta ? "1235583512413732904" : "1005100370135101474",
    General:       isBeta ? "1221613837837664276" : "848980948695777300",
    Logs:          isBeta ? "1228745405957804072" : "1223785821157462086",
    News:          isBeta ? "1253797518555353239" : "878221699844309033",
    Rules:         isBeta ? "1235585239355621457" : "1235585239355621457",
    Updates:       isBeta ? "1236025540331442227" : "1005103628882804776",
    ModDiscussion: isBeta ? "1325419973186682930" : "876477593245868114",
}

export const roles: {[key: string]: string} = { // BETA : PRODUCTION
    Booster: isBeta ? "1221614507466686574" : "852838462469308428",
    Donator: isBeta ? "1350808190400335935" : "925025905166938162",
    SpamBot: isBeta ? "1344660484984410132" : "1332249541705207901",
    Silly:   isBeta ? "1372130773435416687" : "1115577781632368772",
}

// Actual markdown emojis - BETA : PRODUCTION
export const emojis: {[key: string]: string} = {
    Booster:    isBeta ? "<:booster:1266753101793198144>"      : "<:booster:1264162949753212928>",
    Downvote:   isBeta ? "<:downvote:1266753173784100865>"     : "<:downvote:1264163504173224006>",
    Home:       isBeta ? "<:phantys_home:1266753148794703954>" : "<:phantys_home:1264163401962229780>",
    Like:       isBeta ? "<:like:1266753131925082194>"         : "<:like:1264163067655229510>",
    PortalMod:  isBeta ? "<:portalmod:1266753118205509663>"    : "<:portalmod:1264163032876060756>",
    Supporter:  isBeta ? "<:supporter:1266753072168697938>"    : "<:supporter:1264162874465456200>",
    Translator: isBeta ? "<:translator:1349437899568975914>"   : "<:translator:1335008128323944528>",
    Upvote:     isBeta ? "<:upvote:1266753165265473580>"       : "<:upvote:1264163489073860620>",
    Yo:         isBeta ? "<:yo:1349437575659524239>"           : "<:yo:1349437436719005749>",
    Tada:       isBeta ? "<:tada:1351512055059972157>"         : "<:tada:1351511867503149117>",
}

/**
 * Extract the ID part of a markdown emoji
 * @param input - The emoji in Markdown format
 * @return the emoji ID
 */
export function emojiId(input: string): string|null {
    const match = input.match(/\d+/);
    return match ? match[0] : null;
}

/**
 * Server emojis in ID form, **not** Markdown
 */
export const serverEmojis = {
    Delete: isBeta ? "1265683388069707776" : "1264171028125323327",
}

/**
 * Whether likes should be added to media in a channel
 * @param channel - The input channel in ID form
 */
export function addLikesToMedia(channel: string): boolean {
    return [
        channels.Art,
    ].includes(channel);
}

/**
 * Whether likes should be added to any message in a channel
 * @param channel - The input channel in ID form
 */
export function addLikes(channel: string): boolean {
    return [
        channels.Announcements,
        channels.News,
        channels.Updates,
    ].includes(channel);
}

/**
 * Whether up- and downvotes should be added to any message in a channel
 * @param channel - The input channel in ID form
 */
export function addVotes(channel: string): boolean {
    return [
        channels.Updates,
    ].includes(channel);
}