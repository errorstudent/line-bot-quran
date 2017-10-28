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
	var input = text.split(' ');	

	switch(input[0]) {
		case '/surat':
			getSurah(event.replyToken);
			break;
		default:
			getAyah(input, event.replyToken)
	}
}

const LIST_SURAH = ["Al-Faatiha", "Al-Baqara", "Aal-i-Imraan", "An-Nisaa", "Al-Maaida", "Al-An'aam", "Al-A'raaf", "Al-Anfaal", "At-Tawba", "Yunus", "Hud", "Yusuf", "Ar-Ra'd", "Ibrahim", "Al-Hijr", "An-Nahl", "Al-Israa", "Al-Kahf", "Maryam", "Taa-Haa", "Al-Anbiyaa", "Al-Hajj", "Al-Muminoon", "An-Noor", "Al-Furqaan", "Ash-Shu'araa", "An-Naml", "Al-Qasas", "Al-Ankaboot", "Ar-Room", "Luqman", "As-Sajda", "Al-Ahzaab", "Saba", "Faatir", "Yaseen", "As-Saaffaat", "Saad", "Az-Zumar", "Ghafir", "Fussilat", "Ash-Shura", "Az-Zukhruf", "Ad-Dukhaan", "Al-Jaathiya", "Al-Ahqaf", "Muhammad", "Al-Fath", "Al-Hujuraat", "Qaaf", "Adh-Dhaariyat", "At-Tur", "An-Najm", "Al-Qamar", "Ar-Rahmaan", "Al-Waaqia", "Al-Hadid", "Al-Mujaadila", "Al-Hashr", "Al-Mumtahana", "As-Saff", "Al-Jumu'a", "Al-Munaafiqoon", "At-Taghaabun", "At-Talaaq", "At-Tahrim", "Al-Mulk", "Al-Qalam", "Al-Haaqqa", "Al-Ma'aarij", "Nooh", "Al-Jinn", "Al-Muzzammil", "Al-Muddaththir", "Al-Qiyaama", "Al-Insaan", "Al-Mursalaat", "An-Naba", "An-Naazi'aat", "Abasa", "At-Takwir", "Al-Infitaar", "Al-Mutaffifin", "Al-Inshiqaaq", "Al-Burooj", "At-Taariq", "Al-A'laa", "Al-Ghaashiya", "Al-Fajr", "Al-Balad", "Ash-Shams", "Al-Lail", "Ad-Dhuhaa", "Ash-Sharh", "At-Tin", "Al-Alaq", "Al-Qadr", "Al-Bayyina", "Az-Zalzala", "Al-Aadiyaat", "Al-Qaari'a", "At-Takaathur", "Al-Asr", "Al-Humaza", "Al-Fil", "Quraish", "Al-Maa'un", "Al-Kawthar", "Al-Kaafiroon", "An-Nasr", "Al-Masad", "Al-Ikhlaas", "Al-Falaq", "An-Naas"]

function getSurah(token) {
	var surahs = LIST_SURAH.join('\n');

	const echo = { type: 'text', text: surahs };

	client.replyMessage(token, echo);
}


function getAyah(input, token) {
	var noSurah = input[0];
	var noAyah = input[1];

	if(isNaN(noSurah)){
		var surahId = LIST_SURAH.indexOf(noSurah) + 1;
	}else{
		var surahId = noSurah;
	}

	axios.get('http://api.alquran.cloud/surah/'+ surahId +'/editions/id.indonesian')
	.then(response => {
		response.data.data.forEach(function(item){
			var surah = item.englishName;
			var ayah = item.ayahs[noAyah].text;
			var text = ayah + ' (QS. ' + surah + ': ' + noAyah + ')';

			const echo = { type: 'text', text: text };

			console.log(echo)
			client.replyMessage(token, echo);
		});
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