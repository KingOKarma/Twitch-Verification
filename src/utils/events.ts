import { CONFIG, STORAGE } from "../utils/globals";
import Storage, { Verifiy } from "./storage";
import { ChatClient } from "twitch-chat-client";
import { StaticAuthProvider } from "twitch-auth";
import { TwitchPrivateMessage } from "twitch-chat-client/lib/StandardCommands/TwitchPrivateMessage";
import { nanoid } from "nanoid";


const { clientID } = CONFIG;
const { botAccessToken } = CONFIG;
const { prefix } = CONFIG;

// Auth Consts
const authChatProvider = new StaticAuthProvider(clientID, botAccessToken);


export async function intiChatClient(): Promise<void> {

    const chatClient = new ChatClient(authChatProvider, { channels: [CONFIG.twitchUsername] });
    // Listen to more events...
    await chatClient.connect().then(void console.log("Sucessfully connected bot client!"));


    chatClient.onMessage(async (channel: string, user: string, message: string, msg: TwitchPrivateMessage) => {
        console.log(STORAGE);

        if (user === CONFIG.botUsername) return;
        if (msg.userInfo.isBroadcaster) return;
        if (msg.userInfo.isVip) return;
        if (msg.userInfo.isMod) return;
        if (msg.userInfo.isSubscriber) return;


        const args = message.slice(prefix.length).trim().split(/ +/g);

        const cmd = args.shift()?.toLowerCase();

        if (!message.startsWith(`${CONFIG.prefix}verify`)) {

            const foundUser = STORAGE.verify.find((chan) => chan.channel === user);

            if (foundUser === undefined) {
                const newVerifiy: Verifiy = {
                    attempts: 0,
                    channel: user,
                    hasVerified: false,
                    id: nanoid()
                };

                STORAGE.verify.push(newVerifiy);
                Storage.saveConfig();
                chatClient.deleteMessage(channel, msg).catch(console.error);
                return chatClient.say(channel, `You are not verified @${msg.userInfo.displayName}`
            + ` Please type in chat ${CONFIG.prefix}verify ${newVerifiy.id}, Fail this 3 times and you'll be banned`);

            }

            foundUser.attempts += 1;

            Storage.saveConfig();

            if (foundUser.attempts > 3) {
                chatClient.ban(channel, user, "Did not verify, you can still appeal though!").catch(console.error);
                foundUser.attempts = 0;
                foundUser.hasVerified = false;
                Storage.saveConfig();
                return chatClient.say(channel, `@${msg.userInfo.displayName} was banned for being unable to verify!`);
            }

            if (!foundUser.hasVerified) {
                chatClient.deleteMessage(channel, msg).catch(console.error);
                return chatClient.say(channel, `You are not verified @${msg.userInfo.displayName}`
            + ` Please type in chat ${CONFIG.prefix}verify ${foundUser.id}, Fail this 3 times and you'll be banned`);

            }
        }


        try {

            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const commandFile = require(`../commands/${cmd}.js`);
            commandFile.run(chatClient, channel, user, message, msg, args);

        } catch (err) {

        }

    });

    chatClient.onBan(async (channel: string, user: string) => {
        const foundUser = STORAGE.verify.find((chan) => chan.channel === user);
        if (foundUser === undefined) return;

        foundUser.attempts = 0;
        foundUser.hasVerified = false;
        foundUser.id = nanoid();
        Storage.saveConfig();


    });

}