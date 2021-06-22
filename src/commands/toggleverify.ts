/* eslint-disable @typescript-eslint/no-unused-vars */
import { ChatClient } from "twitch-chat-client/lib";
import { STORAGE } from "../utils/globals";
import Storage from "../utils/storage";
import { TwitchPrivateMessage } from "twitch-chat-client/lib/StandardCommands/TwitchPrivateMessage";
import { checkPerms } from "../utils/events";

exports.run = async (chatClient: ChatClient,
    channel: string,
    user: string,
    message: string,
    msg: TwitchPrivateMessage,
    args: string[]): Promise<void> => {

    const author = msg.userInfo.displayName;
    const perms = checkPerms(msg);
    if (!perms) return chatClient.say(channel, `@${author} Sorry this command can only be used by staff`);

    switch (STORAGE.checkChat) {
        case true: {
            STORAGE.checkChat = false;
            Storage.saveConfig();
            return chatClient.say(channel, `@${author} I have disabled verification!`);
        }
        case false: {
            STORAGE.checkChat = true;
            Storage.saveConfig();
            return chatClient.say(channel, `@${author} I have enabled verification!`);
        }

        default:
            return chatClient.say(channel, `@${author} There was an error please report to https://twitch.tv/King_O_Karma!`);
    }

};