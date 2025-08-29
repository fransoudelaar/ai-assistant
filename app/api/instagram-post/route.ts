import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { NextResponse } from 'next/server';

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY; // voor fallback scraper

async function fetchFromScraper(url: string) {
  const res = await fetch(
    `https://instagram-downloader-download-instagram-videos-stories1.p.rapidapi.com/get-info-rapidapi?url=${url}`,
    {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY!,
        'X-RapidAPI-Host': 'instagram-downloader-download-instagram-videos-stories1.p.rapidapi.com',
      },
    },
  );
  if (!res.ok) return null;
  const data = await res.json();

  let video: string | null = null;
  const images: string[] = [];
  if (data.type === 'video') {
    video = data.download_url;
  } else {
    if (data.medias && Array.isArray(data.medias)) {
      data.medias.forEach((m: { download_url: string }) => images.push(m.download_url));
    } else if (data.download_url) {
      images.push(data.download_url);
    }
  }

  return { images, video, caption: data.caption || '' };
}

export async function POST(req: Request) {
  const { link, rigName, creator, creatorHandle, info } = await req.json();

  // Rapid scraper API
  let media = null;

  if (link) {
    media = await fetchFromScraper(link);
  }

  if (!media) {
    return NextResponse.json({ error: 'Could not fetch media from Instagram' }, { status: 500 });
  }

  // 3. Genereer caption in The Rig Vault stijl
  const prompt = `
    You are writing an Instagram caption for "The Rig Vault", a carp fishing brand.
    
    Tone:
    - Engaging, short punchy sentences.
    - Mix of education and inspiration.
    - Use rig-specific jargon (stiff section, hinge point, bait floss, hook choice, etc) but don't come up with components yourself. Use the inputs.
    - Slightly informal, as if talking to fellow carp anglers.
    - Call to action at the end.
    
    Structure:
    1. Hook sentence (make it engaging).
    2. Short educational bit (explain the rig, bait, or setup).
    3. Tip or personal insight (optional).
    4. Strong call to action ("What’s your go-to setup? Drop it below 👇").
    5. Effective hashtags (#carpfishing #carprigs #therigvault + rig-specific hashtags).
    
    Inputs:
    - Instagram link: ${link}
    - Rig Name: ${rigName}
    - Creator: ${creator}
    - Creator's Instagram handle to be tagged: ${creatorHandle}
    - Extra info: ${info}
    - Original Instagram caption: ${media?.caption || 'No caption provided'}
    
    Task:
    Based on these inputs, write one unique, improved caption for Instagram in The Rig Vault style.
  `;

  try {
    const { text } = await generateText({
      model: google('gemini-2.5-flash'),
      prompt,
    });
    return NextResponse.json({
      caption: text,
      images: media?.images,
      video: media?.video,
      originalCaption: media?.caption,
    });
  } catch (err) {
    console.error('generateText error', err);
    return NextResponse.json({ error: 'AI generation failed' }, { status: 500 });
  }
}
