const { Client , Intents , Collection}  = require('discord.js')
const client = new Client({intents:32767})
const fs = require('fs')
const mongoose = require("mongoose")

mongoose.connect("mongodb+srv://taegeon:taegeon3833@cluster0.yyewayb.mongodb.net/?retryWrites=true&w=majority", {
useNewUrlParser: true ,  useUnifiedTopology: true 
}).then(console.log("데이터베이스 연결 완료"))

const {prefix , token} = require('./config.json')
client.once('ready',()=>{
    console.log("봇이 준비되었습니다")
})

client.on('messageCreate' , message=>{
    if(message.content == "hello"){
        message.reply("let's go ddc")
    }
})

client.login("MTAzNDQzMDM4MDY5NjE0NTk0MA.GQu5fi._1btz8Is8AcRHrDS5dMFcYylKrJt3hTGUl0tiU")

client.commands = new Collection()

const commandsFile = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))

for(const file of commandsFile){
    const command = require(`./commands/${file}`)
    client.commands.set(command.name , command)
}

client.on('messageCreate' , message=>{
    if(!message.content.startsWith(prefix)) return
    const args = message.content.slice(prefix.length).trim().split(/ +/)
    const commandName = args.shift()
    const command = client.commands.get(commandName)
    if (!command) return
    try{
        command.execute(message,args)
    } catch (error) {
        console.error(error)
    }
})

client.on('voiceStateUpdate', async (newState, oldState) => {
    const channel = newState.guild.channels.cache.find(c => c.name === "통화방 생성");
    if (newState.member.voice.channel) {
        if (!channel) return
        if (newState.member.voice.channel.id !== channel.id) return
        newState.guild.channels.create(`${newState.member.user.username}의 음성방`, {
            type: "GUILD_VOICE",
            parent: oldState.channel.parent
        }).then(ch => {
            if (!ch) return
            newState.member.voice.setChannel(ch)
            const interval = setInterval(() => {
                if (ch.deleted == true) {
                    clearInterval(interval)
                    return;
                }
                if (ch.members.size == 0) {
                    ch.delete()
                    console.log("채널 삭제됨")
                    return;
                }
            }, 5000);
        })
    }
})
