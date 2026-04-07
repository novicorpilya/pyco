import type { VercelRequest, VercelResponse } from '@vercel/node';

// === INLINE UTILS (no external imports to prevent Vercel resolve issues) ===

function escapeMarkdown(text: string): string {
  return text.replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, '\\$&');
}

function validateRating(rating: unknown): number {
  const r = parseInt(String(rating), 10);
  if (isNaN(r) || r < 1 || r > 5) {
    throw new Error('Invalid rating value');
  }
  return r;
}

function validateString(text: unknown, maxLength: number): string {
  const s = String(text || '');
  if (s.length > maxLength) {
    return s.substring(0, maxLength);
  }
  return s;
}

// === HANDLER ===

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const rating = validateRating(request.body?.rating);
    const name = validateString(request.body?.name, 50);
    const comment = validateString(request.body?.comment, 1000);

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      console.warn('Telegram credentials missing — simulation mode');
      return response.status(200).json({ success: true, simulated: true });
    }

    const displayName = name || 'Аноним';
    const displayComment = comment || 'Без комментария';

    const stars = '⭐'.repeat(rating);
    const message = `🌟 НОВЫЙ ОТЗЫВ ОБ ИГРЕ! 🌟\n\n⭐ Оценка: ${stars} (${rating}/5)\n👤 Имя: ${displayName}\n📝 Комментарий: ${displayComment}`;

    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const res = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
      }),
    });

    if (res.ok) {
      return response.status(200).json({ success: true });
    } else {
      const err = await res.json();
      console.error('Telegram API error:', err);
      return response.status(502).json({
        error: 'Telegram API rejected the message',
        details: err?.description || 'Unknown',
      });
    }
  } catch (error) {
    console.error('Feedback crash:', error);
    return response.status(400).json({
      error: 'Validation error',
      details: (error as Error).message,
    });
  }
}
