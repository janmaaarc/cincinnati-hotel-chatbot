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
      const errorText = await response.text().catch(() => 'No error body')
      console.error('n8n error response:', response.status, errorText)
      throw new Error(`n8n request failed with status ${response.status}`)
    }

    // Get raw text first for debugging
    const rawText = await response.text()
    console.log('n8n raw response:', rawText.substring(0, 500))

    if (!rawText || rawText.trim() === '') {
      console.error('n8n returned empty response')
      throw new Error('n8n returned empty response')
    }

    let data
    try {
      data = JSON.parse(rawText)
    } catch (parseError) {
      console.error('Failed to parse n8n response:', parseError.message)
      console.error('Raw response was:', rawText)
      throw new Error(`Invalid JSON from n8n: ${rawText.substring(0, 100)}`)
    }

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
