/*-----------------------------------------------------------------------------
This Bot uses the Bot Connector Service but is designed to showcase whats 
possible on Facebook using the framework. The demo shows how to create a looping 
menu how send things like Pictures, Bubbles, Receipts, and use Carousels. It also
shows all of the prompts supported by Bot Builder and how to receive uploaded
photos, videos, and location.

    
-----------------------------------------------------------------------------*/

var restify = require('restify');
var builder = require('botbuilder');
var CONTENT = require('./content.json');

//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat bot
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

//=========================================================
// Bots Middleware
//=========================================================

// Anytime the major version is incremented any existing conversations will be restarted.
bot.use(builder.Middleware.dialogVersion({ version: 1.0, resetCommand: /^reset/i }));

//=========================================================
// Bots Global Actions
//=========================================================

bot.endConversationAction('goodbye', 'Goodbye :)', { matches: /^goodbye/i });
bot.beginDialogAction('help', '/help', { matches: /^help/i });

//=========================================================
// Bots Dialogs
//=========================================================

bot.dialog('/', [
    function (session) {
        console.log("here");
        // Send a greeting and show help.
        var card = new builder.HeroCard(session)
            .title(CONTENT.welcome_content.card_title)
            .text(CONTENT.welcome_content.card_subtitle)
            .images([
                 builder.CardImage.create(session, "https://scontent.fblr2-1.fna.fbcdn.net/v/t1.0-9/15823711_204460020016092_2773116411117296887_n.png?oh=421fc0c030c129e13a13410466e5d1cb&oe=58DF2C8A")
            ]);
        var msg = new builder.Message(session).attachments([card]);
        session.send(msg);
        session.send(CONTENT.welcome_content.welcome_message);
        //session.beginDialog('/help');
        session.beginDialog('/situation');
    },
    function (session, results) {
        // Display menu
        session.beginDialog('/situation');
    },
    function (session, results) {
        // Always say goodbye
        session.send("Ok... See you later!");
    }
]);

bot.dialog('/menu', [
    function (session) {
        builder.Prompts.choice(session, "What demo would you like to run?", "prompts|picture|cards|list|carousel|receipt|actions|(quit)");
    },
    function (session, results) {
        if (results.response && results.response.entity != '(quit)') {
            // Launch demo dialog
            session.beginDialog('/' + results.response.entity);
        } else {
            // Exit the menu
            session.endDialog();
        }
    },
    function (session, results) {
        // The menu runs a loop until the user chooses to (quit).
        session.replaceDialog('/menu');
    }
]).reloadAction('reloadMenu', null, { matches: /^menu|show menu/i });

bot.dialog('/help', [
    function (session) {
        session.endDialog("Global commands that are available anytime:\n\n* menu - Exits a demo and returns to the menu.\n* goodbye - End this conversation.\n* help - Displays these commands.");
    }
]);


bot.dialog('/situation', [
    function (session) {

        //console.log(session.message.user.name);
        session.send(CONTENT.situation_content.ask_user_situation);
        
        // Ask the user to select an item from a carousel.
        var msg = new builder.Message(session)
            .attachmentLayout(builder.AttachmentLayout.carousel)
            .attachments([
                new builder.HeroCard(session)
                    .title(CONTENT.situation_content.situation_100.title)
                    .subtitle(CONTENT.situation_content.situation_100.subtitle)
                    .images([
                        builder.CardImage.create(session, CONTENT.situation_content.situation_100.image)
                            .tap(builder.CardAction.showImage(session, "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Seattlenighttimequeenanne.jpg/800px-Seattlenighttimequeenanne.jpg")),
                    ])
                    .buttons([
                        builder.CardAction.openUrl(session, "https://en.wikipedia.org/wiki/Space_Needle", CONTENT.situation_content.situation_100.button_one),
                        builder.CardAction.imBack(session, "select:100", CONTENT.situation_content.situation_100.button_two)
                    ]),
                new builder.HeroCard(session)
                    .title(CONTENT.situation_content.situation_101.title)
                    .subtitle(CONTENT.situation_content.situation_101.subtitle)
                    .images([
                        builder.CardImage.create(session, CONTENT.situation_content.situation_101.image)
                            .tap(builder.CardAction.showImage(session, "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Seattlenighttimequeenanne.jpg/800px-Seattlenighttimequeenanne.jpg")),
                    ])
                    .buttons([
                        builder.CardAction.openUrl(session, "https://en.wikipedia.org/wiki/Space_Needle", CONTENT.situation_content.situation_101.button_one),
                        builder.CardAction.imBack(session, "select:101", CONTENT.situation_content.situation_101.button_two)
                    ]),
                new builder.HeroCard(session)
                    .title(CONTENT.situation_content.situation_102.title)
                    .subtitle(CONTENT.situation_content.situation_102.subtitle)
                    .images([
                        builder.CardImage.create(session, CONTENT.situation_content.situation_102.image)
                            .tap(builder.CardAction.showImage(session, "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Seattlenighttimequeenanne.jpg/800px-Seattlenighttimequeenanne.jpg")),
                    ])
                    .buttons([
                        builder.CardAction.openUrl(session, "https://en.wikipedia.org/wiki/Space_Needle", CONTENT.situation_content.situation_102.button_one),
                        builder.CardAction.imBack(session, "select:102", CONTENT.situation_content.situation_102.button_two)
                    ])
            ]);
        builder.Prompts.choice(session, msg, "select:100|select:101|select:102");
    },
    function (session, results) {
        var action, item;
        var kvPair = results.response.entity.split(':');
        switch (kvPair[0]) {
            case 'select':
                action = 'selected';
                break;
        }
                session.privateConversationData.choice = kvPair[1];
                session.beginDialog('/chosenSituation');
               
       //session.endDialog();
    }    
]);

bot.dialog('/chosenSituation',[


  function (session, args) {

       session.dialogData.index = args ? args.index:1;
       
       if(session.dialogData.index == 1)
       {
       console.log("called this dialog with", session.privateConversationData.choice);
       session.send(CONTENT.situation_content.default_welcome);
       }

       var chosenSituationHandle = "situation_"+session.privateConversationData.choice;
       var textArr = CONTENT.situation_content;

       var sentenceArr = textArr[chosenSituationHandle]["text_sentences"];
       
       console.log(textArr[chosenSituationHandle]["text_sentences"]["sentence1"]);

       //session.dialogData.index = 1;

       if(session.dialogData.index < 5 )
       {
           
           var sentenceHandle = "sentence"+session.dialogData.index;
           console.log(sentenceHandle);

           var completeSentenceArr = textArr[chosenSituationHandle]["text_sentences"][sentenceHandle].split("|");;
           var engSentence = completeSentenceArr[0];
           var frSentence = completeSentenceArr[1];

           session.send("In English - "+engSentence);
           session.send("In French - "+frSentence);

           session.dialogData.index++;

           session.replaceDialog('/chosenSituation', session.dialogData);
           
       }
       else
       {
           session.endDialog();
       }

       
        // builder.Prompts.text(session, "Prompts.text()\n\nEnter some text and I'll say it back.");

    }
  
]);


// Create a dialog and bind it to a global action
bot.dialog('/weather', [
    function (session, args) {
        session.endDialog("The weather in %s is 71 degrees and raining.", args.data);
    }
]);
bot.beginDialogAction('weather', '/weather');   // <-- no 'matches' option means this can only be triggered by a button.