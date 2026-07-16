import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { createGoogle } from '@ai-sdk/google';

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'GEMINI_API_KEY not configured on server.' }, { status: 500 });
  }

  try {
    const body = await req.json();
    console.log('Gemini Request Body:', body);

    const google = createGoogle({
      apiKey,
    });

    const systemInstruction = body.system_instruction?.parts?.[0]?.text;
    const temperature = body.generationConfig?.temperature;
    const maxTokens = body.generationConfig?.maxOutputTokens;

    const messages = (body.contents || []).map((c: any) => ({
      role: c.role === 'model' ? 'assistant' : c.role === 'bot' ? 'assistant' : c.role || 'user',
      content: c.parts?.[0]?.text || '',
    }));

    const response = await generateText({
      model: google('gemini-2.5-flash'),
      system: systemInstruction,
      messages: messages,
      temperature: temperature,
      maxOutputTokens: maxTokens,
    });

    return NextResponse.json({
      candidates: [
        {
          content: {
            parts: [
              {
                text: response.text || ''
              }
            ]
          }
        }
      ]
    });
  } catch (err: any) {
    console.error('Gemini API Proxy Error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
