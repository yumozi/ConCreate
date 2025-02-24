# ConCreate - AI Content Creator Agent

## Inspiration
A significant portion of video content today is created using stock footage and voiceovers, especially by independent content creators who lack the budget for animations or live shoots.

YouTubers have reported that the content creation process, from ideation to scripting, curating footage, recordingvoiceovers, and editing, can take up to five hours for just a short five-minute video. We decided to completely automate this workflow using AI agent, empowering anyone to create high-quality content effortlessly in just minutes.

## What it does
ConCreate is an AI content creator agent that transforms an idea into a polished video in minutes.

Powered by **OpenAI**'s GPT-4 and **ElevenLabs**'s text-to-speech models, ConCreate:
- Expands the idea into a script based on the user’s desired video length.
- Generates a voiceover using the user's preferred voice.
- Automatically **searches for and selects** the best online stock footage.
- Seamlessly edits everything into a **polished, ready-to-share video**.

## Technical implementation
TODO

## Team information
Our team consists of two members: Eric Xue and Doria Cai. Our contributions are as follows:
 - **Eric Xue** – Frontend & backend development, idea formation
 - **Doria Cai** – UX/UI design, frontend development

## What's next for ConCreate
TODO

## Getting Started
After cloning the repository, first create a file named `.env.local` in the root directory and add the following variables:

```bash
OPENAI_API_KEY=<your_openai_api_key>
ELEVENLABS_API_KEY=<your_elevenlabs_api_key>
PEXELS_API_KEY=<your_pexels_api_key>
```

Then, run the below command to install the dependencies:

```bash
npm install
```

After, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the web app.
