export async function sendToN8n({ message, pdfContent, sessionId }) {
  const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL

  if (!n8nWebhookUrl) {
    console.warn('N8N_WEBHOOK_URL not configured, returning mock response')
    return {
      answer: "I'm sorry, the chatbot is not configured yet. Please contact the administrator.",
      category: 'Other',
      answerFound: false
    }
  }

  try {
    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message,
        pdfContent,
        sessionId
      })
    })

    if (!response.ok) {
      throw new Error(`n8n request failed with status ${response.status}`)
    }

    const data = await response.json()

    return {
      answer: data.answer || "I'm sorry, I couldn't process your request.",
      category: data.category || 'Other',
      answerFound: data.answerFound !== false
    }
  } catch (error) {
    console.error('Error calling n8n:', error)
    return {
      answer: "I'm sorry, I'm having trouble connecting right now. Please try again later.",
      category: 'Other',
      answerFound: false
    }
  }
}
