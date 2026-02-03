import { Resend } from 'resend'

export async function sendContactEmail({ name, phone, email, unansweredQuestion, conversationSummary }) {
  const resendApiKey = process.env.RESEND_API_KEY
  const contactEmail = process.env.CONTACT_EMAIL || 'idan@tauga.ai'

  if (!resendApiKey) {
    console.warn('RESEND_API_KEY not configured, skipping email')
    return
  }

  const resend = new Resend(resendApiKey)

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
    await resend.emails.send({
      from: 'Cincinnati Hotel <onboarding@resend.dev>',
      to: contactEmail,
      subject: `New Contact Request from ${name}`,
      text: emailContent
    })

    console.log('Contact email sent successfully')
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
}
