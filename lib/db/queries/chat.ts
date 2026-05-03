import { db } from "../index";
import { chatSessions, chatMessages } from "../schema";
import { eq, desc } from "drizzle-orm";

export async function createSession(title: string) {
  const result = await db
    .insert(chatSessions)
    .values({
      title,
      createdAt: new Date(),
      updatedAt: new Date(),
      messageCount: 0,
    })
    .returning();
  return result[0];
}

export async function updateSession(id: string, data: Partial<typeof chatSessions.$inferInsert>) {
  const result = await db
    .update(chatSessions)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(chatSessions.id, id))
    .returning();
  return result[0];
}

export async function listSessions() {
  return await db.query.chatSessions.findMany({
    orderBy: [desc(chatSessions.updatedAt)],
  });
}

export async function getSession(id: string) {
  return await db.query.chatSessions.findFirst({
    where: eq(chatSessions.id, id),
  });
}

export async function addMessage(data: typeof chatMessages.$inferInsert) {
  const result = await db.insert(chatMessages).values(data).returning();
  
  // Update message count in session
  const session = await getSession(data.sessionId);
  if (session) {
    await updateSession(data.sessionId, {
      messageCount: (session.messageCount || 0) + 1,
    });
  }
  
  return result[0];
}

export async function getMessages(sessionId: string, limit = 50) {
  return await db.query.chatMessages.findMany({
    where: eq(chatMessages.sessionId, sessionId),
    orderBy: [chatMessages.createdAt],
    limit,
  });
}

export function generateSessionTitle(message: string) {
  return message.split(" ").slice(0, 6).join(" ") + (message.split(" ").length > 6 ? "..." : "");
}
