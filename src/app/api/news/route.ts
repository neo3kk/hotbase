import { NextResponse } from 'next/server';
import Parser from 'rss-parser';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Admin Client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function sendTelegramMessage(text: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML',
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Telegram API error: ${errorData.description}`);
  }
}

export async function GET() {
  console.log('Starting news fetch...');
  const parser = new Parser({
    customFields: {
      item: ['content:encoded'],
    }
  });
  const feedUrl = 'http://orangetrackdiecast.com/feed';

  try {
    const response = await fetch(feedUrl, {
      next: { revalidate: 3600 }, // Revalidate every hour
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch RSS feed: ${response.statusText}`);
    }

    const feedText = await response.text();
    const feed = await parser.parseString(feedText);
    console.log(`Found ${feed.items.length} items in RSS feed.`);

    const newsItems = feed.items.slice(0, 10); // Get latest 10

    for (const item of newsItems.reverse()) { // Process oldest of the batch first
      if (!item.link) continue;

      console.log(`Processing item: ${item.title} - ${item.link}`);

      const { data: existingNews, error: selectError } = await supabase
        .from('sent_news')
        .select('article_link')
        .eq('article_link', item.link)
        .single();

      if (selectError && selectError.code !== 'PGRST116') {
        console.error('Error checking database:', selectError);
        continue;
      }
      
      if (!existingNews) {
        console.log(`New item found: "${item.title}". Sending to Telegram and saving to DB.`);
        const message = `<b>${item.title}</b>\n\n${item.link}`;
        try {
          await sendTelegramMessage(message);
          const { error: insertError } = await supabase
            .from('sent_news')
            .insert({ article_link: item.link });

          if (insertError) {
            console.error('Error saving sent news to DB:', insertError);
          }
        } catch (telegramError) {
          console.error('Failed to send message to Telegram:', telegramError);
        }
      } else {
        console.log(`Item "${item.title}" already exists. Skipping.`);
      }
    }

    const formattedItems = feed.items.slice(0, 10).map(item => {
      let imageUrl = null;
      const content = item['content:encoded'] || item.content;

      if (item.enclosure && item.enclosure.url) {
        imageUrl = item.enclosure.url;
      } else if (content) {
        const match = content.match(/<img[^>]+src="([^">]+)"/);
        if (match) {
          imageUrl = match[1];
        }
      }

      return {
        title: item.title,
        link: item.link,
        pubDate: item.pubDate,
        snippet: item.contentSnippet ? item.contentSnippet.substring(0, 120) + '...' : '',
        imageUrl: imageUrl,
      };
    });

    const itemsWithImages = formattedItems.filter(item => item.imageUrl);
    console.log('Formatted items to be sent in response:', itemsWithImages);

    return NextResponse.json({ items: itemsWithImages });

  } catch (error) {
    console.error('Failed to fetch or parse RSS feed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}
