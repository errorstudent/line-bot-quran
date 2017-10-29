'use strict';

const line = require('@line/bot-sdk');
const express = require('express');
const dotenv = require('dotenv').config();
const axios = require('axios');


// create LINE SDK config from env variables
const config = {
	channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
	channelSecret: process.env.CHANNEL_SECRET,
};

	// create LINE SDK client
const client = new line.Client(config);

// create Express app
// about Express itself: https://expressjs.com/
const app = express();

// register a webhook handler with middleware
// about the middleware, please refer to doc
app.post('/webhook', line.middleware(config), (req, res) => {
	Promise
		.all(req.body.events.map(handleEvent))
		.then((result) => res.json(result));
});

// event handler
function handleEvent(event) {
	if (event.type !== 'message' || event.message.type !== 'text') {
		// ignore non-text-message event
		return Promise.resolve(null);
	}

	var text = event.message.text;	
	switch(text) {
		case '/surat':
			getSurah(event.replyToken);
			break;
		case '/help':
			getHelp(event.replyToken);
			break;
		default:
			getAyah(text, event.replyToken)
	}
}

function getHelp(token) {
	var msg = "ketik /surat untuk melihat daftar surat.\n";
		msg += "ketik namaSurat:noAyat untuk melihat isi ayat dan terjemahan";


	const echo = { type: 'text', text: msg };

	client.replyMessage(token, echo);

}

function getSurah(token) {
	axios.get('http://api.alquran.cloud/surah')
	.then(response => {
		const text = [];
		response.data.data.forEach(function(item, i){
			const surahNo = item.number;
			const surahName = item.name;
			const surahEnglishName = item.englishName;

			text.push(surahNo + '. ' + surahEnglishName);
		});

		const msg = text.join('\n');
		const echo = { type: 'text', text: msg };

		client.replyMessage(token, echo);
	})
	.catch(error => {
		console.log(error);
	});
}


function getAyah(text, token) {
	var input = text.split(':');
	var noSurah = input[0];
	var noAyah = input[1];

	if(isNaN(noSurah)){
		var surahId = LIST_SURAH.indexOf(noSurah) + 1;
	}else{
		var surahId = noSurah;
	}

	axios.get('http://api.alquran.cloud/surah/'+ surahId +'/editions/quran-uthmani,id.indonesian')
	.then(response => {
		var msg = [];
		response.data.data.forEach(function(item, i){
			var surah = item.englishName;
			var ayah = item.ayahs[noAyah].text;

			if(i ==  0) {
				var text = ayah;
			}else{
				var text = ayah + ' (QS. ' + surah + ': ' + noAyah + ')';	
			}

			msg.push({ type: 'text', text: text });
		});

		console.log(msg)
		client.replyMessage(token, msg);
	})
	.catch(error => {
		console.log(error);
	});
}

// app.use((err, req, res, next) => {
// 	if (err instanceof line.SignatureValidationFailed) {
// 		res.status(401).send(err.signature)
// 		return
// 	} else if (err instanceof line.JSONParseError) {
// 		res.status(400).send(err.raw)
// 		return
// 	}
// 	next(err) // will throw default 500
// 	})

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
	console.log(`listening on ${port}`);
});