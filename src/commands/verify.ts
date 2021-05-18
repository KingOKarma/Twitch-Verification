/* eslint-disable @typescript-eslint/no-unused-vars */
import { CONFIG, STORAGE } from "../utils/globals";
import Storage, { Verifiy } from "../utils/storage";
import { ChatClient } from "twitch-chat-client/lib";
import { TwitchPrivateMessage } from "twitch-chat-client/lib/StandardCommands/TwitchPrivateMessage";
import { nanoid } from "nanoid";

exports.run = async (chatClient: ChatClient,
    channel: string,
    user: string,
    message: string,
    msg: TwitchPrivateMessage,
    args: string[]): Promise<void> => {

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

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (args[0] === undefined) {
        foundUser.attempts += 1;
        Storage.saveConfig();

        chatClient.deleteMessage(channel, msg).catch(console.error);
        return chatClient.say(channel, `Please type in chat ${CONFIG.prefix}verify ${foundUser.id},`
        + " Fail this 3 times and you'll be banned");
    }

    if (foundUser.attempts > 3) {
        chatClient.ban(channel, user, "Did not verify, you can still appeal though!").catch(console.error);
        foundUser.attempts = 0;
        foundUser.hasVerified = false;
        Storage.saveConfig();
        return chatClient.say(channel, `@${msg.userInfo.displayName} was banned for being unable to verify!`);
    }

    if (foundUser.id === args.join(" ")) {
        foundUser.attempts = 0;
        foundUser.hasVerified = true;
        Storage.saveConfig();
        return chatClient.say(channel, `@${msg.userInfo.displayName} has cleared verification! feel free to talk!`);
    }

    foundUser.attempts += 1;
    Storage.saveConfig();

    chatClient.deleteMessage(channel, msg).catch(console.error);
    return chatClient.say(channel, `@${msg.userInfo.displayName} has failed verification! You may try again`);
};