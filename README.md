# AI Adventure
AI-Dungeon inspired interactive story generator using Google Gemini.

## About
AI Adventure is an AI-Dungeon-inspired web app created with Next.js that generates interactive stories using Google Gemini.

## Getting Started
### Prerequisites
* [Node.js](https://nodejs.org/) v20.11.1 (recommended; other Node 20.x versions may work, but this was used for development)
* A Google Gemini API key ([get one here](https://aistudio.google.com/app/apikey))
### Installation
1. Clone the repository:
```bash
git clone https://github.com/MikaelAndriIngason/AI-Adventure.git
cd AI-Adventure
```
2. Install dependencies:
```bash
npm install
```
3. Create an `.env` file in the project root with the following variables:
```
GEMINI_API_KEY=your-google-gemini-api-key
MAX_TOKENS=max-number-of-response-tokens
MAX_TOKENS_ENHANCE=max-number-of-response-tokens-in-intro-enhancement
```

## Usage
### Development
To run the app locally in development mode with hot reloading:
```bash
npm run dev
```
Open your browser and go to http://localhost:3000 to start your adventure.

### Production
To build and start the app in production mode:
```
npm run build
npm start
```
This will serve your optimized Next.js app on http://localhost:3000.

## Licence
This project is licensed under the [MIT License](LICENSE.txt).

## Credits
* Inspired by [AI Dungeon](https://aidungeon.com/)
* Powered by [Google Gemini API](https://aistudio.google.com/)