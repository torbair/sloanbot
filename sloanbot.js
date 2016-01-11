/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
          ______     ______     ______   __  __     __     ______
          /\  == \   /\  __ \   /\__  _\ /\ \/ /    /\ \   /\__  _\
          \ \  __<   \ \ \/\ \  \/_/\ \/ \ \  _"-.  \ \ \  \/_/\ \/
          \ \_____\  \ \_____\    \ \_\  \ \_\ \_\  \ \_\    \ \_\
           \/_____/   \/_____/     \/_/   \/_/\/_/   \/_/     \/_/
This is a sample Slack bot built with Botkit.
This bot demonstrates many of the core features of Botkit:
* Connect to Slack using the real time API
* Receive messages based on "spoken" patterns
* Reply to messages
* Use the conversation system to ask questions
* Use the built in storage system to store and retrieve information
  for a user.
# RUN THE BOT:
  Get a Bot token from Slack:
    -> http://my.slack.com/services/new/bot
  Run your bot from the command line:
    token=<MY TOKEN> node bot.js
# USE THE BOT:
  Find your bot inside Slack to send it a direct message.
  Say: "Hello"
  The bot will reply "Hello!"
  Say: "who are you?"
  The bot will tell you its name, where it running, and for how long.
  Say: "Call me <nickname>"
  Tell the bot your nickname. Now you are friends.
  Say: "who am I?"
  The bot will tell you your nickname, if it knows one for you.
  Say: "shutdown"
  The bot will ask if you are sure, and then shut itself down.
  Make sure to invite your bot into other channels using /invite @<my bot>!
# EXTEND THE BOT:
  Botkit is has many features for building cool and useful bots!
  Read all about it here:
    -> http://howdy.ai/botkit
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/


var Botkit = require('./lib/Botkit.js')
var os = require('os');
var mytoken = 'xoxb-17204212692-kmlzUqVhwsiNHw5jvaa2IP5n'
var controller = Botkit.slackbot({
	debug: false,
});

var bot = controller.spawn(
  {
	  token:mytoken
  }
).startRTM();

controller.hears(['anon (.*)'],'direct_message',function(bot,message) {
	var matches = message.text.match(/anon (.*)/i);
	var anontext = matches[1];
	console.log(anontext);
	console.log(message.user);
	bot.say(
		{
			text: anontext,
			channel: 'C04LEDNV9'
		}
	);
	bot.reply(message,"Anonymizing and posting to #general.");
});

controller.hears(['inspire me'],'direct_message',function(bot,message) {
	var inspiration = ["Have you tried combining two ideas?","Have you taken a step back for the big picture?","Have you tried using the mind of a child?","Have you tried goal factoring?","Have you defined and challenged the narrative?","Have you identified your fears and their source?","Have you tried reversing causality?","Have you rephrased your idea so a child could understand?","Have you tried expressing your idea in emoji?","Have you tried expressing your idea in a song?"]
	var rand = inspiration[Math.floor(Math.random() * inspiration.length)];
	bot.reply(message,rand);
});

controller.hears(['pm'],'direct_message,direct_mention,mention',function(bot,message) {
	var text = "There's lots of PM resources in the #product channel and job postings in the #jobs channel. To get started, try these links. https://mitsloantech.slack.com/files/tor/F0HBL0SET/Slack_s_First_Product_Manager_on_How_to_Make_a_Firehose_of_Feedback_Useful // https://mitsloantech.slack.com/archives/product/p1451920058000002 // https://mitsloantech.slack.com/archives/product/p1449851209000009"
	bot.reply(message,text);
});

controller.hears(['anonread (.*)'],'direct_message',function(bot,message) {
	var matches = message.text.match(/anonread (.*)/i);
	var anontext = matches[1];
	console.log(anontext);
	console.log(message.user);
	bot.say(
		{
			text: anontext,
			channel: 'C04MYCE3P'
		}
	);
	bot.reply(message,"Anonymizing and posting to #reading.");
});



controller.hears(['hello','hi'],'direct_message,direct_mention,mention',function(bot,message) {

  bot.api.reactions.add({
    timestamp: message.ts,
    channel: message.channel,
    name: 'robot_face',
  },function(err,res) {
    if (err) {
      bot.botkit.log("Failed to add emoji reaction :(",err);
    }
  });


  controller.storage.users.get(message.user,function(err,user) {
    if (user && user.name) {
      bot.reply(message,"Hello " + user.name+"!!");
    } else {
      bot.reply(message,"Hello.");
    }
  });
})

controller.hears(['call me (.*)'],'direct_message,direct_mention,mention',function(bot,message) {
  var matches = message.text.match(/call me (.*)/i);
  var name = matches[1];
  controller.storage.users.get(message.user,function(err,user) {
    if (!user) {
      user = {
        id: message.user,
      }
    }
    user.name = name;
    controller.storage.users.save(user,function(err,id) {
      bot.reply(message,"Got it. I will call you " + user.name + " from now on.");
    })
  })
});

controller.hears(['what is my name','who am i'],'direct_message,direct_mention,mention',function(bot,message) {

  controller.storage.users.get(message.user,function(err,user) {
    if (user && user.name) {
      bot.reply(message,"Your name is " + user.name);
    } else {
      bot.reply(message,"I don't know yet!");
    }
  })
});


controller.hears(['shutdown'],'direct_message,direct_mention,mention',function(bot,message) {

  bot.startConversation(message,function(err,convo) {
    convo.ask("Are you sure you want me to shutdown?",[
      {
        pattern: bot.utterances.yes,
        callback: function(response,convo) {
          convo.say("Bye!");
          convo.next();
          setTimeout(function() {
            process.exit();
          },3000);
        }
      },
      {
        pattern: bot.utterances.no,
        default:true,
        callback: function(response,convo) {
          convo.say("*Phew!*");
          convo.next();
        }
      }
    ])
  })
})


controller.hears(['uptime','identify yourself','who are you','what is your name'],'direct_message,direct_mention,mention',function(bot,message) {

  var hostname = os.hostname();
  var uptime = formatUptime(process.uptime());

  bot.reply(message,':robot_face: I am a bot named <@' + bot.identity.name +'>. I have been running for ' + uptime + ' on ' + hostname + ".");

})

function formatUptime(uptime) {
  var unit = 'second';
  if (uptime > 60) {
    uptime = uptime / 60;
    unit = 'minute';
  }
  if (uptime > 60) {
    uptime = uptime / 60;
    unit = 'hour';
  }
  if (uptime != 1) {
    unit = unit +'s';
  }

  uptime = uptime + ' ' + unit;
  return uptime;
}