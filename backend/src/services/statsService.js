export function getStats(db) {
  try {
    const totalSessionsResult = db.prepare(
      'SELECT COUNT(*) as count FROM chat_sessions'
    ).get()
    const totalSessions = totalSessionsResult?.count || 0

    const categoryStats = db.prepare(`
      SELECT category, COUNT(*) as count
      FROM messages
      WHERE role = 'assistant' AND category IS NOT NULL AND category != ''
      GROUP BY category
      ORDER BY count DESC
    `).all() || []

    const totalMessagesResult = db.prepare(
      'SELECT COUNT(*) as count FROM messages WHERE role = "user"'
    ).get()
    const totalMessages = totalMessagesResult?.count || 0

    const unansweredCountResult = db.prepare(
      'SELECT COUNT(*) as count FROM messages WHERE answer_found = 0'
    ).get()
    const unansweredCount = unansweredCountResult?.count || 0

    return {
      totalSessions,
      totalMessages,
      unansweredCount,
      categoryStats
    }
  } catch (error) {
    console.error('Error in getStats:', error)
    return {
      totalSessions: 0,
      totalMessages: 0,
      unansweredCount: 0,
      categoryStats: []
    }
  }
}
