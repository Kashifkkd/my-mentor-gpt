# My Mentor GPT

An AI chat application built with Next.js, React, and TypeScript. Chat with AI assistants customized for different roles like teachers, therapists, and mentors.

## Features

- 💬 AI-powered chat interface
- 🎓 Customizable assistant types (Teacher, Therapist, Mentor, etc.)
- 📱 Fully responsive design
- 🌙 Dark mode support
- 💾 Conversation history
- ⚡ Streaming responses

## Tech Stack

- **Next.js 16** - React framework
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **MongoDB** - Database
- **AI SDK** - AI integration

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB (local or cloud)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd my-mentor-gpt
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env.local` file with:
```
MONGODB_URI=your_mongodb_connection_string
AI_API_KEY=your_ai_api_key
```

4. Run the development server
```bash
npm run dev
```

5. Open [http://localhost:9000](http://localhost:9000) in your browser

## Available Scripts

- `npm run dev` - Start development server (port 9000)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
my-mentor-gpt/
├── app/              # Next.js app router
├── components/       # React components
├── lib/              # Utilities and helpers
├── models/           # TypeScript models
└── public/           # Static assets
```

## License

MIT
