import discord from 'discord.js'
import express from 'express'
import morgan from 'morgan'
import axios from 'axios'
import { Logbox } from './utils/Logbox'
// import path from 'path'

const { FLAGS } = discord.Intents

const app = express()

interface bot_var {
    owner: discord.User | null
    cl_ch_ids: {
        [id: string]: string
    }
}

const bot_var: bot_var = {
    owner: null,
    cl_ch_ids: {
        welcome: '751056203299291196',
    },
}

const db = {
    bot_var: bot_var,
    log: new Logbox(),
}

const getTimeTag = (d = new Date()) =>
    `<t:${d.getTime().toString().slice(0, 10)}>`

const getLink = (g: string, c: string, m: string) =>
    `https://discord.com/channels/${g}/${c}/${m}`

const getip = req =>
    req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress

let ip: string | null = null

app.use((req: express.Request) => {
    ip = getip(req)
})

app.use(
    morgan(process.env.NODE_ENV === 'production' ? 'dev' : 'dev', {
        stream: {
            write(str: string): void {
                const original = str.slice(0, str.length - 1)

                console.log(`(${ip}): ${original}`)

                db.log.log(original, 'SERVER')
            },
        },
    }),
)

app.use(express.static(process.cwd()))

app.get('/', (req: express.Request, res: express.Response) => {
    res.end('Im alive :)')
})

app.get('/log', (req: express.Request, res: express.Response) => {
    const types = Object.keys(req.query)

    // const types = type ? [type] : ['server', 'bot']

    const { log } = db
    const data = (types.length === 0 ? log : log.filter(types)).toString()

    res.setHeader('content-type', 'text/plain')
    res.send(data)
})

// app.get('/log', (req: express.Request, res: express.Response) => {
//     res.end(db.log.join('\n'))
// })

app.listen(process.env.PORT || 8080)

const bot = new discord.Client({
    intents: [
        FLAGS.GUILDS,
        FLAGS.GUILD_MEMBERS,
        FLAGS.GUILD_BANS,
        FLAGS.GUILD_EMOJIS_AND_STICKERS,
        FLAGS.GUILD_INTEGRATIONS,
        FLAGS.GUILD_WEBHOOKS,

        FLAGS.GUILD_INVITES,
        FLAGS.GUILD_VOICE_STATES,
        FLAGS.GUILD_PRESENCES,
        FLAGS.GUILD_MESSAGES,
        FLAGS.GUILD_MESSAGE_REACTIONS,
        FLAGS.GUILD_MESSAGE_TYPING,
        FLAGS.DIRECT_MESSAGES,
        FLAGS.DIRECT_MESSAGE_REACTIONS,
        FLAGS.DIRECT_MESSAGE_TYPING,
    ],
})
bot.on('ready', async () => {
    console.log(`😀 logined as ${bot?.user?.username}`)

    const o = (await bot?.application?.fetch?.())?.owner

    db.bot_var.owner = o instanceof discord.User ? o : null
    // @ts-ignore
    db.bot_var.owner?.send?.(
        `${getTimeTag()}\nMESSAGE: I'm awake!\nto check logs, head over to https://abiria-denesor-cowarong.azurewebsites.net/ and https://portal.azure.com/?websitesextension_ext=asd.featurePath%3Ddetectors%2FLinuxLogViewer#@63f4d0db-d42f-4d30-b20a-cc339a3d5477/resource/subscriptions/1bfa9837-304a-40d5-9a43-2d9c59a18b41/resourceGroups/appsvc_linux_centralus/providers/Microsoft.Web/sites/abiria-denesor-cowarong/logStream`,
    )
})

// msg_table: {
bot.on('messageCreate', async (msg: discord.Message) => {
    console.log(`${msg.author.tag}: ${msg.content}`)

    if (msg.author.id === '662201438621138954') {
        if (msg.content.startsWith('hey')) {
            msg.reply(`yeh${msg.content.slice(3)}`)

            if (msg.channel.type !== 'GUILD_TEXT') return

            db.log.log(`${msg.content} (#${msg.channel.name})`, 'BOT')
        }
    }
})

interface noticer {
    ignore_prefix: string
    prev_msg: discord.Message | null
    default_msg: string
    msg_table: {
        [id: string]: string
    }

    static_db_url: string
}

let noticer: noticer = {
    ignore_prefix: '!ign',
    prev_msg: null,
    default_msg: '관련 주제에 대해서 스레드를 만들어 주세요!',
    msg_table: {
        '771439601750900736': '질문에 대해서 스레드를 생성해 주세요!',
    },
    static_db_url:
        'https://raw.githubusercontent.com/abiriadev/db/main/table.json',
}

bot.on('messageCreate', async (msg: discord.Message) => {
    if (
        // @ts-ignore
        msg.author.id !== bot.user.id &&
        Object.keys(noticer.msg_table).includes(msg.channel.id) &&
        !msg.content.startsWith(noticer.ignore_prefix)
    ) {
        if (noticer.prev_msg) await noticer.prev_msg.delete()

        const my_msg = await msg.reply(
            noticer.msg_table[msg.channel.id] || noticer.default_msg,
        )

        if (msg.channel.type !== 'GUILD_TEXT') return

        db.log.log(
            `(@${msg.author.tag}) ${msg.content} (#${msg.channel.name})`,
            'THREAD',
        )

        setTimeout(() => my_msg.delete(), 5000)
    }
})

bot.on('guildMemberAdd', async (member: discord.GuildMember) => {
    const welcome_ch: discord.GuildChannel | discord.ThreadChannel | null =
        member.guild.channels.resolve(db.bot_var.cl_ch_ids.welcome)

    if (welcome_ch instanceof discord.ThreadChannel) {
        return
    }

    if (!(welcome_ch instanceof discord.TextChannel)) {
        return
    }

    const m = await welcome_ch.send(`${member} 님이 오셨어요!`)

    db.bot_var.owner?.send?.(
        `<@${member.id}> 가 왔다 이놈아!\n${getLink(
            member.guild.id,
            db.bot_var.cl_ch_ids.welcome,
            m.id,
        )}`,
    )

    db.log.log(member.user.tag, 'JOIN')

    if (member.user.bot) return

    const r: discord.Role | null =
        member.guild.roles.resolve('882591881115103232')

    if (r) {
        member.roles.add(r)
    }
})

bot.login().catch((err: Error) => {
    console.log('fail to login!')

    // process.exit(1)
})

setInterval(async () => {
    const {
        default_msg,
        msg_table,
        nonce = null,
    } = (await axios.get(noticer.static_db_url)).data

    noticer = { ...noticer, default_msg, msg_table }

    db.log.log(`default_msg: ${default_msg}, nonce: ${nonce}`, 'AXIOS')
}, 1000 * 60 * 5)
