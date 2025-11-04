# PetIQ

PetIQ is a Node/TypeScript project. This repository contains the application code and server in `server/`.

## Getting Started

Prerequisites:

- Node.js (LTS recommended)
- npm, pnpm, or yarn

Install dependencies and start the server:

```bash
cd server
npm install
npm run dev
```

## License

MIT
# PetIQ HR AI Chatbot - Phase 1 POC

A web-based HR chatbot application designed to assist PetIQ employees with HR-related questions, featuring identity verification for personal email addresses.

## Features

- 🤖 AI-powered HR question answering using OpenAI
- 🔐 Multi-step identity verification for personal email addresses
- 📋 Intelligent triage and routing of HR inquiries
- 📊 Audit logging and status tracking
- 💬 Conversational chatbot widget interface
- 📱 Responsive design for desktop and mobile

## Project Structure

```
PetIQ/
├── client/          # React frontend application
├── server/          # Node.js/Express backend API
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Azure OpenAI credentials (API key, endpoint, deployment name)

### Quick Start

1. **Install dependencies (root only):**
   ```bash
   npm run install:all
   ```

2. **Create `.env` file in the `server` directory:**
   ```env
   # Azure OpenAI Configuration
   AZURE_OPENAI_API_KEY=your_azure_openai_api_key
   AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com
   AZURE_OPENAI_API_VERSION=2024-02-15-preview
   AZURE_OPENAI_DEPLOYMENT_NAME=your-deployment-name
   
   # Server Configuration
   PORT=3000
   NODE_ENV=development
   ```

3. **Start development servers:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

5. **Test the chatbot:**
   - Click the chat icon (💬) in the bottom right
   - Enter your email (can be personal email)
   - **Important**: Check the server console for the verification code (POC mode)
   - Enter the code to start chatting!

For detailed setup instructions, see [SETUP.md](./SETUP.md).

## Phase 1 Capabilities

- Identity verification for users with personal email addresses
- HR question answering with mocked data
- Triage logic for routing inquiries
- Audit logging of all interactions
- Status tracking for inquiries

## Future Enhancements (Phase 2)

- Integration with Lyric HR system
- Two-way data flow and automation
- Self-service workflows (PTO requests, address updates)
- Role-based access controls
- Production-grade security and compliance

