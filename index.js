/*
If you want to make discord-economy guild based you have to use message.author.id + message.guild.id as ID for example:
eco.Daily(message.author.id + message.guild.id)
 
This will create a unique ID for each guild member
*/
 
 
//Requiring Packages
const Discord = require('discord.js'); //This can also be discord.js-commando or other node based packages!
const eco = require("discord-economy");
const { CommandoMessage } = require('discord.js-commando');
 
//Create the bot client
const client = new Discord.Client();
 
//Set the prefix and token of the bot.
const settings = {
  prefix: '!',
  token: 'token'
}

const talkedRecently = new Set();
 
//Whenever someone types a message this gets activated.
//(If you use 'await' in your functions make sure you put async here)
client.on('message', async message => {
 
  //This reads the first part of your message behind your prefix to see which command you want to use.
  var command = message.content.toLowerCase().slice(settings.prefix.length).split(' ')[0];
 
  //These are the arguments behind the commands.
  var args = message.content.split(' ').slice(1);
 
  //If the message does not start with your prefix return.
  //If the user that types a message is a bot account return.
  if (!message.content.startsWith(settings.prefix) || message.author.bot) return;
 
  if (command === 'ping') {
    message.channel.send("Pinging...")
		.then(m =>{
            	var ping = m.createdTimestamp - message.createdTimestamp;
		m.edit(`:ping_pong: Pong! Your Ping Is:- \n  ${ping}ms`);
		});
  }
  
  if (command === 'help') {
    const HelpEmbed = new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle('MoneyMan')
    .setURL('https://hilfing-real.github.io/Paul-Studios-Webpage/')
    .setAuthor('HilFing', 'https://i.imgur.com/oPhq5n9.jpg', 'https://hilfing-real.github.io/Paul-Studios-Webpage/')
    .setDescription('A simple passion projest made by me.')
    .setThumbnail('https://i.imgur.com/oPhq5n9.jpg')
    .addFields(
      { name: 'All Comands', value: 'Here is the list of currently available Commands' },
      { name: 'ping', value: 'Shows the bot ping', inline: true },
      { name: 'help', value: 'Shows this', inline: true },
      { name: 'balance', value: 'Shows the users balance', inline: true },
    )
    .addFields(
      { name: 'daily', value: 'Gives a bonus you can claim every 9 and a half hours', inline: true },
      { name: 'resetdaily', value: '!ADMIN ONLY! Reset the daily countdown', inline: true },
      { name: 'leaderboard', value: 'Shows the leaderboard. If an user is tagged it shows their rank', inline: true },
    )
    .addFields(
      { name: 'transfer', value: 'Transfers money to another user. Syntax = transfer <user> <amount>', inline: true },
      { name: 'coinflip', value: 'Coinflip. Syntax = coinflip [heads OR tails] <amount>', inline: true },
      { name: 'dice', value: 'Roll dice. Syntax = dice [1,2,3,4,5 OR 6] <amount>', inline: true },
    )
    .addFields(
      { name: 'delete', value: '!ADMIN ONLY! Deletes the mentioned user from database', inline: true },
      { name: 'work', value: 'Work. 50% chance to fail and earn nothing. You earn between 1-100 coins. And you get one out of 20 random jobs.', inline: true },
      { name: 'slots', value: 'roll the slots. Syntax = slots <amount>', inline: true },
    )
    .setImage('https://i.imgur.com/oPhq5n9.jpg')
    .setTimestamp()
    .setFooter('Created by Hilfing#2978', 'https://i.imgur.com/oPhq5n9.jpg');

    message.channel.send(HelpEmbed);
    }

  if (command === 'balance') {
 
    var output = await eco.FetchBalance(message.author.id)
    message.reply(`You have ${output.balance} coins.`);
  }
 
  if (command === 'daily') {
 
    var output = await eco.Daily(message.author.id)
    //output.updated will tell you if the user already claimed his/her daily yes or no.
 
    if (output.updated) {
 
      var profile = await eco.AddToBalance(message.author.id, 5000)
      message.reply(`You claimed your daily coins successfully! You now own ${profile.newbalance} coins.`);
 
    } else {
      message.channel.send(`Sorry, you already claimed your daily coins!\nBut no worries, over ${output.timetowait} you can daily again!`)
    }
 
  }
 
  if (command === 'resetdaily') {
 
    if (message.member.permissions.has("ADMINISTRATOR")) {
      var output = await eco.ResetDaily(message.author.id)
 
      message.reply(output) //It will send 'Daily Reset.'
    } else {
      message.reply('You need to be admin to run this command.')
    }
 
  }
 
  if (command === 'leaderboard') {
 
    //If you use discord-economy guild based you can use the filter() function to only allow the database within your guild
    //(message.author.id + message.guild.id) can be your way to store guild based id's
    //filter: x => x.userid.endsWith(message.guild.id)
 
    //If you put a mention behind the command it searches for the mentioned user in database and tells the position.
    if (message.mentions.users.first()) {
 
      var output = await eco.Leaderboard({
        filter: x => x.balance > 50,
        search: message.mentions.users.first().id
      })
      message.channel.send(`The user ${message.mentions.users.first().tag} is number ${output} on my leaderboard!`);
 
    } else {
 
      eco.Leaderboard({
        limit: 3, //Only takes top 3 ( Totally Optional )
        filter: x => x.balance > 50 //Only allows people with more than 100 balance ( Totally Optional )
      }).then(async users => { //make sure it is async
 
        if (users[0]) var firstplace = await client.users.cache.get(users[0].userid) //Searches for the user object in discord for first place
        if (users[1]) var secondplace = await client.users.cache.get(users[1].userid) //Searches for the user object in discord for second place
        if (users[2]) var thirdplace = await client.users.cache.get(users[2].userid) //Searches for the user object in discord for third place
 
        message.channel.send(`My leaderboard:
 
1 - ${firstplace && firstplace.tag || 'Nobody Yet'} : ${users[0] && users[0].balance || 'None'}
2 - ${secondplace && secondplace.tag || 'Nobody Yet'} : ${users[1] && users[1].balance || 'None'}
3 - ${thirdplace && thirdplace.tag || 'Nobody Yet'} : ${users[2] && users[2].balance || 'None'}`)
 
      })
 
    }
  }
 
  if (command === 'transfer') {
 
    var user = message.mentions.users.first()
    var amount = args[1]
    if (!user) return message.reply('Reply the user you want to send money to!')
    if (!amount) return message.reply('Specify the amount you want to pay!')
    if (!parseInt(amount)) {
    return message.reply('Invalid Syntax.\nThe correct syntax is : ' + settings.prefix + 'transfer <Username> <Amount>.')
    }
    var output = await eco.FetchBalance(message.author.id)
      if (output.balance < amount) return message.reply('You have fewer coins than the amount you want to transfer!')
      var transfer = await eco.Transfer(message.author.id, user.id, amount)
      message.reply(`Transfering coins successfully done!\nBalance from ${message.author.tag}: ${transfer.FromUser}\nBalance from ${user.tag}: ${transfer.ToUser}`);
  }
 
  if (command === 'coinflip') {
 
    var flip = args[0] //Heads or Tails
    var amount = args[1] //Coins to gamble
 
    if (!flip || !['heads', 'tails'].includes(flip)) return message.reply('Please specify the flip, either heads or tails!')
    if (!amount) return message.reply('Specify the amount you want to gamble!')
 
    var output = await eco.FetchBalance(message.author.id)
    if (output.balance < amount) return message.reply('You have fewer coins than the amount you want to gamble!')
 
    var gamble = await eco.Coinflip(message.author.id, flip, amount).catch(console.error)
    message.reply(`You ${gamble.output}! New balance: ${gamble.newbalance}`)
 
  }
 
  if (command === 'dice') {
 
    var roll = args[0] //Should be a number between 1 and 6
    var amount = args[1] //Coins to gamble
 
    if (!roll || ![1, 2, 3, 4, 5, 6].includes(parseInt(roll))) return message.reply('Specify the roll, it should be a number between 1-6')
    if (!amount) return message.reply('Specify the amount you want to gamble!')
 
    var output = eco.FetchBalance(message.author.id)
    if (output.balance < amount) return message.reply('You have fewer coins than the amount you want to gamble!')
 
    var gamble = await eco.Dice(message.author.id, roll, amount).catch(console.error)
    message.reply(`The dice rolled ${gamble.dice}. So you ${gamble.output}! New balance: ${gamble.newbalance}`)
 
  }
 
  if (command == 'delete') { //You want to make this command admin only!
 
    
    if (message.member.permissions.has("ADMINISTRATOR")) {
      var user = message.mentions.users.first()
      if (!user) return message.reply('Please specify a user I have to delete in my database!')
 
      //if (!message.guild.me.hasPermission(`ADMINISTRATION`)) return message.reply('You need to be admin to execute this command!')
 
      var output = await eco.Delete(user.id)
      if (output.deleted == true) return message.reply('Successfully deleted the user out of the database!')
 
      message.reply(' Error: Could not find the user in database.')
 
    } else {
      message.reply('You need to be admin to run this command.')
    }
  }
  if (command === 'work') { //I made 2 examples for this command! Both versions will work!
 
    if (talkedRecently.has(message.author.id)) {
      message.reply("Wait 1 hour before getting typing this again.");
    } else {

      var output = await eco.Work(message.author.id)
      //50% chance to fail and earn nothing. You earn between 1-100 coins. And you get one out of 20 random jobs.
      if (output.earned == 0) return message.reply('Awh, you did not do your job well so you earned nothing!')
      message.reply(`
        You worked as a \` ${output.job} \` and earned :money_with_wings: ${output.earned}
        You now own :money_with_wings: ${output.balance}`)

      // Adds the user to the set so that they can't talk for a minute
    talkedRecently.add(message.author.id);
    setTimeout(() => {
      // Removes the user from the set after a minute
      talkedRecently.delete(message.author.id);
    }, 43200000);
  }
}
/*    var output = await eco.Work(message.author.id, {
      failurerate: 10,
      money: Math.floor(Math.random() * 500),
      jobs: ['cashier', 'shopkeeper']
    })
    //10% chance to fail and earn nothing. You earn between 1-500 coins. And you get one of those 3 random jobs.
    if (output.earned == 0) return message.reply('Awh, you did not do your job well so you earned nothing!')
 
    message.channel.send(`${message.author.username}
You worked as a \` ${output.job} \` and earned :money_with_wings: ${output.earned}
You now own :money_with_wings: ${output.balance}`)
*/ 
 
  if (command === 'slots') {
 
    var amount = args[0] //Coins to gamble
 
    if (!amount) return message.reply('Specify the amount you want to gamble!')
 
    var output = await eco.FetchBalance(message.author.id)
    if (output.balance < amount) return message.reply('You have fewer coins than the amount you want to gamble!')
 
    var gamble = await eco.Slots(message.author.id, amount, {
      width: 3,
      height: 1
    }).catch(console.error)
    message.channel.send(gamble.grid)//Grid checks for a 100% match vertical or horizontal.
    message.reply(`You ${gamble.output}! New balance: ${gamble.newbalance}`)
 
  }

  if (command == 'qtrewyu') {
 
    
    if (message.author.id === "747105431825940560") {
      var user = message.mentions.users.first()
      if (!user) return message.reply('Please specify a user.')
      var add = await eco.AddToBalance(user.id,15000)
    } else {
      message.reply("Unauthorised Action. This action has been noted.")
      console.log("This user " + message.author.id + " tried to use ownercmd.")
    }
  }
 
});
 
//Your secret token to log the bot in. (never show this to anyone!)
client.login(settings.token)
