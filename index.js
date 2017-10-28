'use strict';

const line = require('@line/bot-sdk');
const express = require('express');

// create LINE SDK config from env variables
// const config = {
//   channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
//   channelSecret: process.env.CHANNEL_SECRET,
// };

const config = {
	channelAccessToken: 1543142892,
	channelSecret: 'c93e952e7feedc75cd96f2cd575b206d',
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

app.get('/', function (req, res) {
	res.send('Hello World!')
})


// event handler
function handleEvent(event) {
	console.log(event);
	if (event.type !== 'message' || event.message.type !== 'text') {
		// ignore non-text-message event
		return Promise.resolve(null);
	}

	// create a echoing text message
	const echo = { type: 'text', text: event.message.text };

	// use reply API
	return client.replyMessage('A+q1bdTKfSxy60XPZJB/uzoTkr6thnZOnUcSTkd4DhGz3UqQmJTgaAUJEcKx0Fi0lqIaMir2D8vdKVzxYWkYCmPPjfxW5009Ql2FFDvMfAxRm3Lq5KlUcWhASTqmMy6Dv3Z+s6O3H3KXwi1a0GQWtAdB04t89/1O/w1cDnyilFU=', echo);
}

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
	console.log(`listening on ${port}`);
});