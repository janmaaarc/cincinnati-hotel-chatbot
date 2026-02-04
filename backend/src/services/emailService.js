import sgMail from '@sendgrid/mail'

export async function sendContactEmail({ name, phone, email, unansweredQuestion, conversationSummary }) {
  const sendgridApiKey = process.env.SENDGRID_API_KEY
  const fromEmail = process.env.SENDGRID_FROM_EMAIL
  const contactEmail = process.env.CONTACT_EMAIL || 'idan@tauga.ai'

  console.log('Email config check:', {
    hasSendgridKey: !!sendgridApiKey,
    hasFromEmail: !!fromEmail,
    contactEmail
  })

  if (!sendgridApiKey || !fromEmail) {
    console.warn('SendGrid credentials not configured, skipping email')
    return
  }

  sgMail.setApiKey(sendgridApiKey)

  const emailContent = `
New Contact Request from Cincinnati Hotel Chatbot

Guest Information:
- Name: ${name}
- Email: ${email}
- Phone: ${phone || 'Not provided'}

Unanswered Question:
${unansweredQuestion || 'Not specified'}

Conversation Summary:
${conversationSummary || 'No conversation history available'}

---
This email was sent automatically from the Cincinnati Hotel Chatbot system.
`

  try {
    const result = await sgMail.send({
      from: fromEmail,
      to: contactEmail,
      subject: `New Contact Request from ${name}`,
      text: emailContent
    })

    console.log('Email sent - Status:', result[0].statusCode)
  } catch (error) {
    console.error('Error sending email:', error.message)
    if (error.response) {
      console.error('SendGrid error body:', error.response.body)
    }
    throw error
  }
}
