# PetIQ HR Chatbot - Setup Guide

## Prerequisites

- Node.js 18+ and npm
- Azure OpenAI credentials (API key, endpoint, deployment name)

## Installation Steps

1. **Install all dependencies (root only):**
   ```bash
   npm run install:all
   ```
   Or manually (root):
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   
   Create a `.env` file in the `server` directory:
   ```env
   # Azure OpenAI Configuration
   AZURE_OPENAI_API_KEY=your_azure_openai_api_key
   AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com
   AZURE_OPENAI_API_VERSION=2024-02-15-preview
   AZURE_OPENAI_DEPLOYMENT_NAME=your-deployment-name
   
   # Server Configuration
   PORT=3000
   NODE_ENV=development

   # User classification (optional)
   # Comma or semicolon separated list of internal email domains
   INTERNAL_EMAIL_DOMAINS=petiq.com

   # Guest-visible document hints (optional)
   # Filenames containing any of these hints will be visible to guests
   HR_PUBLIC_DOC_HINTS=benefit,enrollment,pto,policy,remote,summary
   ```
   
   **Note**: The application uses Azure OpenAI by default. If you want to use standard OpenAI instead, you can set `OPENAI_API_KEY` and leave Azure OpenAI variables empty.

3. **Start the development servers:**
   ```bash
   npm run dev
   ```
   
   This will start:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

## Usage

1. Open http://localhost:5173 in your browser
2. Click the chatbot icon (💬) in the bottom right
3. Enter your email address (can be personal email)
4. Check the server console for the verification code (in POC mode)
5. Enter the verification code to start chatting
6. Ask HR-related questions!

### Internal vs Guest behavior (POC)
- Emails with domains listed in `INTERNAL_EMAIL_DOMAINS` are treated as **Internal** users.
- All others are treated as **Guest** users.
- The chat header shows a badge and a capability note indicating the current mode.

## Phase 1 POC Notes

- **Email Verification**: In POC mode, verification codes are logged to the server console. In production, these would be sent via email.
- **Mock HR Data**: The chatbot uses mocked HR data. Phase 2 will integrate with Lyric HR system.
- **In-Memory Storage**: Verification sessions and audit logs are stored in memory. They will reset when the server restarts.

## API Endpoints

### Health Check
- `GET /api/health` - Check server status

### Verification
- `POST /api/verification/initiate` - Initiate email verification
  ```json
  { "email": "user@example.com" }
  ```
- `POST /api/verification/verify` - Verify code
  ```json
  { "email": "user@example.com", "code": "123456" }
  ```

### Chat
- `POST /api/chat` - Send chat message
  ```json
  {
    "message": "What are my benefits?",
    "email": "user@example.com",
    "conversationId": "optional-conversation-id"
  }
  ```

### Audit
- `GET /api/audit/logs` - Get audit logs (optional query params: email, conversationId, action, startDate, endDate)
- `GET /api/audit/inquiry/:conversationId` - Get inquiry status for a conversation

## Project Structure

```
PetIQ/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── App.tsx      # Main app component
│   │   └── main.tsx     # Entry point
│   └── package.json
├── server/              # Node.js backend
│   ├── src/
│   │   ├── routes/      # API routes
│   │   ├── services/    # Business logic
│   │   └── index.ts     # Server entry
│   └── package.json
└── README.md
```

## Troubleshooting

- **Port already in use**: Change PORT in server/.env or kill the process using the port
- **Azure OpenAI API errors**: Verify your Azure OpenAI credentials are correct:
  - Check that AZURE_OPENAI_API_KEY is set correctly
  - Verify AZURE_OPENAI_ENDPOINT format: `https://your-resource-name.openai.azure.com`
  - Ensure AZURE_OPENAI_DEPLOYMENT_NAME matches your Azure deployment
  - Check that your API version is supported (default: `2024-02-15-preview`)
- **Verification codes not showing**: Check the server console logs
- **CORS errors**: Ensure the frontend is running on port 5173 (Vite default)

