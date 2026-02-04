export async function getStats(db) {
  try {
    const totalSessionsResult = await db.execute(
      'SELECT COUNT(*) as count FROM chat_sessions'
    )
    const totalSessions = totalSessionsResult.rows[0]?.count || 0

    const categoryStatsResult = await db.execute(`
      SELECT category, COUNT(*) as count
      FROM messages
      WHERE role = 'assistant' AND category IS NOT NULL AND category != ''
      GROUP BY category
      ORDER BY count DESC
    `)
    const categoryStats = categoryStatsResult.rows || []

    const totalMessagesResult = await db.execute(
      "SELECT COUNT(*) as count FROM messages WHERE role = 'user'"
    )
    const totalMessages = totalMessagesResult.rows[0]?.count || 0

    const unansweredCountResult = await db.execute(
      'SELECT COUNT(*) as count FROM messages WHERE answer_found = 0'
    )
    const unansweredCount = unansweredCountResult.rows[0]?.count || 0

    // Get user questions that resulted in unanswered bot responses
    // The answer_found flag is on assistant messages, so we need to find
    // the preceding user message for each unanswered assistant response
    const unansweredQuestionsResult = await db.execute(`
      SELECT
        (SELECT content FROM messages m2
         WHERE m2.session_id = m1.session_id
         AND m2.role = 'user'
         AND m2.id < m1.id
         ORDER BY m2.id DESC
         LIMIT 1) as question,
        m1.created_at as timestamp
      FROM messages m1
      WHERE m1.role = 'assistant' AND m1.answer_found = 0
      ORDER BY m1.created_at DESC
      LIMIT 20
    `)
    const unansweredQuestions = unansweredQuestionsResult.rows.filter(row => row.question) || []

    return {
      totalSessions,
      totalMessages,
      unansweredCount,
      categoryStats,
      unansweredQuestions
    }
  } catch (error) {
    console.error('Error in getStats:', error)
    return {
      totalSessions: 0,
      totalMessages: 0,
      unansweredCount: 0,
      categoryStats: [],
      unansweredQuestions: []
    }
  }
}
