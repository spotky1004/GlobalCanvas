import type App from "../class/App";

interface TriviaOptions {
  app: App;
}

type TriviaItem = (options: TriviaOptions) => string;
const trivias: TriviaItem[] = [
  // Records
  ({ app }) => `Command has been executed ${app.logger.loggingIdx} times so far.`,

  // Current status
  ({ app }) => `${Object.keys(app.userCaches.cache).length} users online!`,
  ({ app }) => `Working on ${Object.keys(app.guildCaches.cache).length} servers!`,
  ({ app }) => `The current board size is ${app.config.size.width}x${app.config.size.height}`,

  // Help
  ({ }) => `Use /connectchannel command to connect.`,
  ({ app }) => `Use /fill <colorName> <x(1~${app.config.size.width})> <y(1~${app.config.size.height})> to fill a pixel.`,
  ({ }) => `Use /zoom <x> <y> <width> <height> command to zoom board.`,
];

export default function getRandomTrivia(options: TriviaOptions) {
  const triviaToDisplay = trivias[Math.floor(trivias.length*Math.random())];
  return triviaToDisplay(options);
}
