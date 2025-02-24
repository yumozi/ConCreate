# ConCreate - AI Content Creator Agent

## Inspiration
A significant portion of video content today is created using just stock footage and human voiceovers, especially for independent content creators who lack the budget for animations or live shoots. Many YouTubers have reported that the entire content creation process, from ideation to scripting, curating footage, recording voiceovers, and editing, can take up to **five hours** for just a short **five-minute video**. We decided to completely automate this labor-intensive workflow with an AI agent, empowering anyone to effortlessly create high-quality video content in mere minutes.

## What it does
ConCreate is an AI content creator agent that transforms an idea into a polished video in just minutes.

Powered by **OpenAI**'s GPT-4 and **ElevenLabs**'s text-to-speech models, ConCreate:
- Expands the idea into a script based on the user’s desired video length.
- Generates a voiceover using the user's preferred voice.
- Automatically **searches for and selects** the best online stock footage.
- Seamlessly edits everything into a **polished, ready-to-share video**.

## Technical implementation
ConCreate is a web application built with **Next.js** and **TypeScript**. The AI agent, powered by **OpenAI’s GPT-4**, orchestrates the entire process by handling:
- Script Generation – Expanding user-provided ideas into structured, engaging video scripts of desired length.
- Stock Footage Retrieval – Searching the **Pexels** API for the most relevant footage to match each script segment.
- Voiceover Synthesis – Leveraging the **ElevenLabs** API to generate expressive, natural-sounding voiceovers.
- Editing – Utilizing the **FFmpeg** package to intelligently trim and sequence stock footage, then synchronizing it with the generated voiceover to produce a polished video.

## Team information
Our team consists of two members: Eric Xue and Doria Cai. Our contributions are as follows:
 - **Eric Xue** – Frontend & backend development, idea formation
 - **Doria Cai** – UX/UI design, frontend development

## What's next for ConCreate
We plan to introduce a text interface that allows users to interact with the AI agent throughout each step of the process. Users will be able to provide real-time feedback, enabling the agent to refine the script, voiceover, and footage selection accordingly. This will create a more personalized and fine-tuned content creation experience.

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
