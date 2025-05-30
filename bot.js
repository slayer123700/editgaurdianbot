require('dotenv').config();
const { Telegraf } = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN);

// In-memory storage for authorized users
const authorizedUsers = new Map(); // { chatId: Set(userIds) }

// Function to get the group owner's ID
async function getGroupOwner(ctx) {
    try {
        const chatAdmins = await ctx.getChatAdministrators();
        const owner = chatAdmins.find(admin => admin.status === "creator");
        return owner ? owner.user.id : null;
    } catch (error) {
        console.error("❌ Error fetching group owner:", error.message);
        return null;
    }
}

// Function to check if a user is an admin
async function isAdmin(ctx) {
    try {
        const chatAdmins = await ctx.getChatAdministrators();
        return chatAdmins.some(admin => admin.user.id === ctx.from.id);
    } catch (error) {
        console.error("❌ Error checking admin status:", error.message);
        return false;
    }
}

// Function to check if the command is used in a group
function isGroupChat(ctx) {
    if (ctx.chat.type !== "supergroup" && ctx.chat.type !== "group") {
        ctx.reply("❌ This command can only be used in groups.", { reply_to_message_id: ctx.message.message_id });
        return false;
    }
    return true;
}

// 🔹 Delete edited messages (except for authorized users and reactions)
bot.on('edited_message', async (ctx) => {
    if (!isGroupChat(ctx)) return;
    try {
        const user = ctx.from.first_name || "Unknown User";
        const userId = ctx.from.id;
        const chatId = ctx.chat.id;
        const messageId = ctx.editedMessage.message_id;

        if (authorizedUsers.has(chatId) && authorizedUsers.get(chatId).has(userId)) {
            console.log(`✅ ${user} is authorized and allowed to edit messages.`);
            return;
        }

        if (!ctx.editedMessage.text && !ctx.editedMessage.caption) {
            console.log(`✅ Ignoring reaction edit from ${user}.`);
            return;
        }

        console.log(`🛑 Deleting edited message from ${user}`);
        await ctx.deleteMessage(messageId);
        console.log(`✅ Deleted edited message from ${user}`);

        const buttons = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '✘ ᴜᴘᴅᴀᴛᴇ', url: 'https://t.me/SpicyXNetwork' },
                     { text: " ✘ sᴜᴘᴘᴏʀᴛ", url: "https://t.me/LOVEZONE_GC" }],
                    [{ text: '➕ Add Me To Your Group', url: 'https://t.me/SpicyEditGuardianBot?startgroup=true' }]
                ]
            }
        };

        const warningMessage = `🚨 <b>WARNING!</b> 🚨  
❌ <b>${user}</b> edited a message, so I deleted it!  
🚫 Editing messages is not allowed!`;

        await ctx.reply(warningMessage, { parse_mode: 'HTML', ...buttons });

    } catch (error) {
        console.error("❌ Error deleting edited message or sending warning:", error.message);
    }
});

// Function to handle the /start command
bot.command('start', async (ctx) => {
    try {
        const user = ctx.from.first_name || "Unknown User";

        const welcomeMessage = `ʜᴇʟʟᴏ👋 ᴡᴇʟᴄᴏᴍᴇ, <b>${user}</b>!  
ɪ ᴀᴍ ʏᴏᴜʀ ꜰʀɪᴇɴᴅʟʏ ᴍᴇꜱꜱᴀɢᴇ ɢᴜᴀʀᴅɪᴀɴ ʙᴏᴛ! 🎉

ɪ ᴇɴꜱᴜʀᴇ ᴛʜᴀᴛ ɴᴏ ᴏɴᴇ ᴄᴀɴ ᴇᴅɪᴛ ᴍᴇꜱꜱᴀɢᴇꜱ ɪɴ ᴛʜᴇ ɢʀᴏᴜᴘ ᴡɪᴛʜᴏᴜᴛ ᴘᴇʀᴍɪꜱꜱɪᴏɴ. ɪꜰ ʏᴏᴜ ɴᴇᴇᴅ ʜᴇʟᴘ, ꜰᴇᴇʟ ꜰʀᴇᴇ ᴛᴏ ᴄᴏɴᴛᴀᴄᴛ ꜱᴜᴘᴘᴏʀᴛ ᴏʀ ᴀᴅᴅ ᴍᴇ ᴛᴏ ʏᴏᴜʀ ɢʀᴏᴜᴘ ꜰᴏʀ ᴍᴏʀᴇ ᴘʀᴏᴛᴇᴄᴛɪᴏɴ!`;

        const buttons = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '✘ ᴜᴘᴅᴀᴛᴇ', url: 'https://t.me/SpicyXNetwork' },
                     { text: " ✘ sᴜᴘᴘᴏʀᴛ", url: "https://t.me/LOVEZONE_GC" }],
                    [{ text: '➕ Add Me To Your Channel ➕', url: 'https://t.me/SpicyEditGuardianBot?startgroup=true' }]
                ]
            }
        };

        const imageUrl = 'https://files.catbox.moe/nxm37r.jpg';

        await ctx.replyWithPhoto(imageUrl, {
            caption: welcomeMessage,
            parse_mode: 'HTML',
            ...buttons
        });

    } catch (error) {
        console.error("❌ Error handling /start command:", error.message);
    }
});

bot.launch();
