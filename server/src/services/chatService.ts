import OpenAI from 'openai'
import dotenv from 'dotenv'
import { hrDataService } from './hrDataService.js'
import { triageService } from './triageService.js'
import { UserType } from '../utils/emailUtils.js'

// Ensure environment variables are loaded
dotenv.config()

// Azure OpenAI Configuration
// Normalize endpoint - remove trailing slash if present
const endpoint = process.env.AZURE_OPENAI_ENDPOINT?.trim().replace(/\/$/, '')
const apiKey = process.env.AZURE_OPENAI_API_KEY?.trim()
const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME?.trim()
const apiVersion = process.env.AZURE_OPENAI_API_VERSION?.trim() || '2024-02-15-preview'

const isAzureOpenAI = Boolean(endpoint && apiKey && deploymentName)

// Validate Azure OpenAI credentials
if (!isAzureOpenAI) {
  const missing: string[] = []
  if (!endpoint) missing.push('AZURE_OPENAI_ENDPOINT')
  if (!apiKey) missing.push('AZURE_OPENAI_API_KEY')
  if (!deploymentName) missing.push('AZURE_OPENAI_DEPLOYMENT_NAME')
  
  throw new Error(
    `Missing Azure OpenAI credentials. Please configure the following in your .env file:\n` +
    `  - ${missing.join('\n  - ')}\n\n` +
    `Current endpoint value: ${process.env.AZURE_OPENAI_ENDPOINT || '(not set)'}`
  )
}

const openaiConfig: any = {
  apiKey: apiKey!,
}

// Azure OpenAI base URL: endpoint + /openai/deployments/{deployment-name}
// The deployment name will be used as the model parameter
openaiConfig.baseURL = `${endpoint}/openai/deployments/${deploymentName}`
openaiConfig.defaultQuery = { 'api-version': apiVersion }
openaiConfig.defaultHeaders = { 'api-key': apiKey! }

const openai = new OpenAI(openaiConfig)

interface ChatMessage {
  message: string
  email: string
  conversationId: string
  userType: UserType
}

interface ChatResponse {
  response: string
  category: string
  status: 'answered' | 'escalated' | 'requires_action'
}

export const chatService = {
  processMessage: async ({ message, email, conversationId, userType }: ChatMessage): Promise<ChatResponse> => {
    // 1. Triage: Categorize the message
    const triageResult = await triageService.categorize(message)

    // 2. Get relevant HR context (filter for guests)
    const hrContext = await hrDataService.getContextForCategory(triageResult.category, userType)

    // 2b. For internal users, include basic employee info (mock) to enable personalized answers
    let employeeInfo: any = null
    if (userType === 'internal') {
      try {
        employeeInfo = await hrDataService.getEmployeeInfo(email)
      } catch {
        employeeInfo = null
      }
    }

    // 3. Generate AI response with context tailored by user type
    const isInternal = userType === 'internal'
    const audienceGuidance = isInternal
      ? `The user is an internal PetIQ employee. You may reference internal HR policies contained in the provided context and provide procedural guidance appropriate for employees.`
      : `The user is an external/guest user. Provide general HR information using the provided context. Do not disclose internal-only procedures or any personal data. If the question requires personal account details or restricted systems, explain the limitation and suggest contacting HR.`

    const systemPrompt = `You are Scout HR Assistant for PetIQ.
${audienceGuidance}

HR Context:
${hrContext}

${employeeInfo ? `Employee Profile (internal only):\n${JSON.stringify(employeeInfo, null, 2)}\n` : ''}

 Guidelines:
 - Be concise, professional, and helpful
 - Use ONLY the provided HR context
 - When answering personalized questions (e.g., PTO balance, manager, location), use the Employee Profile fields above (internal users only)
 - If information is missing or requires internal systems or personal data, say so and suggest contacting HR
 - Avoid exposing internal details to guests`

    try {
      // For Azure OpenAI, use deployment name as the model parameter
      const completion = await openai.chat.completions.create({
        model: deploymentName!,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
        temperature: 0.7,
        max_tokens: 500,
      })

      const aiResponse = completion.choices[0]?.message?.content || 'I apologize, but I encountered an error processing your request.'

      // Determine status based on triage
      let status: 'answered' | 'escalated' | 'requires_action' = 'answered'
      if (triageResult.requiresEscalation) {
        status = 'escalated'
      } else if (triageResult.requiresAction) {
        status = 'requires_action'
      }

      return {
        response: aiResponse,
        category: triageResult.category,
        status,
      }
    } catch (error: any) {
      console.error('Azure OpenAI API error:', error)
      return {
        response: 'I apologize, but I encountered an error processing your request. Please try again or contact HR directly.',
        category: triageResult.category,
        status: 'escalated',
      }
    }
  },
}

