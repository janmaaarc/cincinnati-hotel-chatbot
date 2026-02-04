import nodemailer from 'nodemailer'

export async function sendContactEmail({ name, phone, email, unansweredQuestion, conversationSummary }) {
  const gmailUser = process.env.GMAIL_USER
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD
  const contactEmail = process.env.CONTACT_EMAIL || 'idan@tauga.ai'

  console.log('Email config check:', {
    hasGmailUser: !!gmailUser,
    hasGmailPassword: !!gmailAppPassword,
    contactEmail
  })

  if (!gmailUser || !gmailAppPassword) {
    console.warn('Gmail credentials not configured, skipping email')
    console.warn('Available env vars:', Object.keys(process.env).filter(k => k.includes('GMAIL') || k.includes('MAIL')))
    return
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: gmailUser,
      pass: gmailAppPassword
    }
  })

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
    // Verify connection first
    await transporter.verify()
    console.log('SMTP connection verified')

    const result = await transporter.sendMail({
      from: `Cincinnati Hotel <${gmailUser}>`,
      to: contactEmail,
      subject: `New Contact Request from ${name}`,
      text: emailContent
    })

    console.log('Email sent - Response:', {
      messageId: result.messageId,
      accepted: result.accepted,
      rejected: result.rejected,
      response: result.response
    })
  } catch (error) {
    console.error('Error sending email:', error.message)
    console.error('Error code:', error.code)
    throw error
  }
}
