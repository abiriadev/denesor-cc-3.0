"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = __importDefault(require("discord.js"));
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const axios_1 = __importDefault(require("axios"));
const Logbox_1 = require("./utils/Logbox");
// import path from 'path'
const { FLAGS } = discord_js_1.default.Intents;
const app = (0, express_1.default)();
const bot_var = {
    owner: null,
    cl_ch_ids: {
        welcome: '751056203299291196',
    },
};
const db = {
    bot_var: bot_var,
    log: new Logbox_1.Logbox(),
};
const getTimeTag = (d = new Date()) => `<t:${d.getTime().toString().slice(0, 10)}>`;
const getLink = (g, c, m) => `https://discord.com/channels/${g}/${c}/${m}`;
app.use((0, morgan_1.default)(process.env.NODE_ENV === 'production' ? 'combined' : 'dev', {
    stream: {
        write(str) {
            const original = str.slice(0, str.length - 1);
            console.log(original);
            db.log.log(original, 'SERVER');
        },
    },
}));
app.use(express_1.default.static(process.cwd()));
app.get('/', (req, res) => {
    res.end('Im alive :)');
});
app.get('/log', (req, res) => {
    const types = Object.keys(req.query);
    // const types = type ? [type] : ['server', 'bot']
    const { log } = db;
    const data = (types.length === 0 ? log : log.filter(types)).toString();
    res.setHeader('content-type', 'text/plain');
    res.send(data);
});
// app.get('/log', (req: express.Request, res: express.Response) => {
//     res.end(db.log.join('\n'))
// })
app.listen(process.env.PORT || 8080);
const bot = new discord_js_1.default.Client({
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
});
bot.on('ready', async () => {
    var _a, _b, _c, _d, _e, _f;
    console.log(`😀 logined as ${(_a = bot === null || bot === void 0 ? void 0 : bot.user) === null || _a === void 0 ? void 0 : _a.username}`);
    const o = (_d = (await ((_c = (_b = bot === null || bot === void 0 ? void 0 : bot.application) === null || _b === void 0 ? void 0 : _b.fetch) === null || _c === void 0 ? void 0 : _c.call(_b)))) === null || _d === void 0 ? void 0 : _d.owner;
    db.bot_var.owner = o instanceof discord_js_1.default.User ? o : null;
    // @ts-ignore
    (_f = (_e = db.bot_var.owner) === null || _e === void 0 ? void 0 : _e.send) === null || _f === void 0 ? void 0 : _f.call(_e, `${getTimeTag()}\nMESSAGE: I'm awake!\nto check logs, head over to https://abiria-denesor-cowarong.azurewebsites.net/ and https://portal.azure.com/?websitesextension_ext=asd.featurePath%3Ddetectors%2FLinuxLogViewer#@63f4d0db-d42f-4d30-b20a-cc339a3d5477/resource/subscriptions/1bfa9837-304a-40d5-9a43-2d9c59a18b41/resourceGroups/appsvc_linux_centralus/providers/Microsoft.Web/sites/abiria-denesor-cowarong/logStream`);
});
// msg_table: {
bot.on('messageCreate', async (msg) => {
    console.log(`${msg.author.tag}: ${msg.content}`);
    if (msg.author.id === '662201438621138954') {
        if (msg.content.startsWith('hey')) {
            msg.reply(`yeh${msg.content.slice(3)}`);
            if (msg.channel.type !== 'GUILD_TEXT')
                return;
            db.log.log(`${msg.content} (#${msg.channel.name})`, 'BOT');
        }
    }
});
let noticer = {
    ignore_prefix: '!ign',
    prev_msg: null,
    default_msg: '관련 주제에 대해서 스레드를 만들어 주세요!',
    msg_table: {
        '771439601750900736': '질문에 대해서 스레드를 생성해 주세요!',
    },
    static_db_url: 'https://raw.githubusercontent.com/abiriadev/db/main/table.json',
};
bot.on('messageCreate', async (msg) => {
    if (
    // @ts-ignore
    msg.author.id !== bot.user.id &&
        Object.keys(noticer.msg_table).includes(msg.channel.id) &&
        !msg.content.startsWith(noticer.ignore_prefix)) {
        if (noticer.prev_msg)
            await noticer.prev_msg.delete();
        const my_msg = await msg.reply(noticer.msg_table[msg.channel.id] || noticer.default_msg);
        if (msg.channel.type !== 'GUILD_TEXT')
            return;
        db.log.log(`(@${msg.author.tag}) ${msg.content} (#${msg.channel.name})`, 'THREAD');
        setTimeout(() => my_msg.delete(), 5000);
    }
});
bot.on('guildMemberAdd', async (member) => {
    var _a, _b;
    const welcome_ch = member.guild.channels.resolve(db.bot_var.cl_ch_ids.welcome);
    if (welcome_ch instanceof discord_js_1.default.ThreadChannel) {
        return;
    }
    if (!(welcome_ch instanceof discord_js_1.default.TextChannel)) {
        return;
    }
    const m = await welcome_ch.send(`${member} 님이 오셨어요!`);
    (_b = (_a = db.bot_var.owner) === null || _a === void 0 ? void 0 : _a.send) === null || _b === void 0 ? void 0 : _b.call(_a, `<@${member.id}> 가 왔다 이놈아!\n${getLink(member.guild.id, db.bot_var.cl_ch_ids.welcome, m.id)}`);
    db.log.log(member.user.tag, 'JOIN');
    if (member.user.bot)
        return;
    const r = member.guild.roles.resolve('882591881115103232');
    if (r) {
        member.roles.add(r);
    }
});
bot.login().catch((err) => {
    console.log('fail to login!');
    // process.exit(1)
});
setInterval(async () => {
    const { default_msg, msg_table, nonce = null, } = (await axios_1.default.get(noticer.static_db_url)).data;
    noticer = { ...noticer, default_msg, msg_table };
    db.log.log(`default_msg: ${default_msg}, nonce: ${nonce}`, 'AXIOS');
}, 1000 * 60 * 5);
