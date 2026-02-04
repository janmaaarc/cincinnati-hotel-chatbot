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

    const unansweredQuestionsResult = await db.execute(`
      SELECT m.content as question, m.created_at as timestamp
      FROM messages m
      WHERE m.answer_found = 0 AND m.role = 'user'
      ORDER BY m.created_at DESC
      LIMIT 20
    `)
    const unansweredQuestions = unansweredQuestionsResult.rows || []

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
