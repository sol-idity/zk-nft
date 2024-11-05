import { isbot } from 'isbot';

const REDIRECT_URL = 'https://dial.to/?action=solana-action:https://api.zk.tinys.pl/actions';
const BOT_HTML = `<!doctype html> <html lang="en"> <head> <meta charset="UTF-8" /> <meta name="viewport" content="width=device-width, initial-scale=1.0" /> <title>What is your crypto archetype?</title> <meta name="description" content="What is your crypto archetype?" />  <meta property="og:url" content="https://quiz.tinys.pl" /> <meta property="og:type" content="website" /> <meta property="og:title" content="What is your crypto archetype?" /> <meta property="og:description" content="What is your crypto archetype?" /> <meta property="og:image" content="" />  <meta name="twitter:card" content="summary_large_image" /> <meta property="twitter:domain" content="tinys.pl" /> <meta property="twitter:url" content="https://quiz.tinys.pl" /> <meta name="twitter:title" content="What is your crypto archetype?" /> <meta name="twitter:description" content="What is your crypto archetype?" /> <meta name="twitter:image" content="" /> </head> <body></body> </html>`;

class OpenGraphMetadataHandler {
	constructor(private readonly nftId: number) {}

	element(element: Element) {
		const imageUrl = `https://quiz-result.tinys.pl/twitter?id=${this.nftId}`;

		if (element.getAttribute('name') === 'twitter:image' || element.getAttribute('property') === 'og:image') {
			element.setAttribute('content', imageUrl);
		}
	}
}

export default {
	async fetch(request: Request) {
		const url = new URL(request.url);
		try {
			const nftId = Number(url.searchParams.get('id'));

			if (!nftId) {
				return Response.redirect(REDIRECT_URL);
			}

			if (isbot(request.headers.get('user-agent'))) {
				const response = new Response(BOT_HTML, {
					headers: { 'Content-Type': 'text/html' },
				});

				return new HTMLRewriter().on('head > meta', new OpenGraphMetadataHandler(nftId)).transform(response);
			}

			return Response.redirect(REDIRECT_URL);
		} catch {
			return Response.redirect(REDIRECT_URL);
		}
	},
} satisfies ExportedHandler;
