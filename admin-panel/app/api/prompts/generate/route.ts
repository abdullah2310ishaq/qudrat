import { NextRequest, NextResponse } from 'next/server';

interface GenerateRequest {
  description: string;
  tone?: string;
  length?: 'short' | 'medium' | 'long';
  categoryHint?: string;
  toolHint?: string;
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'OPENAI_API_KEY is not set on the server' },
        { status: 500 }
      );
    }

    const body = (await request.json()) as GenerateRequest;
    if (!body.description || typeof body.description !== 'string') {
      return NextResponse.json(
        { success: false, error: 'description is required' },
        { status: 400 }
      );
    }

    const tone = body.tone || 'friendly';
    const length = body.length || 'medium';
    const categoryHint = body.categoryHint || 'General';
    const toolHint = body.toolHint || 'ChatGPT';

    const systemPrompt = `
You are an assistant that creates a structured prompt object for an admin prompt library.
Return concise JSON with:
- title (max 10 words)
- subHeading (max 15 words)
- prompt (the actual prompt text; concise but clear)
- tags (3-6 short tags)
- category (short, 1-3 words, reuse hint if good)
- tool (reuse hint if sensible)
Tone: ${tone}. Length: ${length}. Category hint: ${categoryHint}. Tool hint: ${toolHint}.
Keep output strictly JSON. Do not include explanations.
`;

    const userPrompt = body.description.slice(0, 1200);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 400,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { success: false, error: `OpenAI error: ${errorText}` },
        { status: 500 }
      );
    }

    const json = await response.json();
    const content =
      json?.choices?.[0]?.message?.content ||
      '{}';

    let parsed: Partial<{
      title: string;
      subHeading: string;
      prompt: string;
      tags: string[];
      category: string;
      tool: string;
    }> = {};

    try {
      parsed = JSON.parse(content);
    } catch {
      // Attempt to extract JSON from text
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      } else {
        return NextResponse.json(
          { success: false, error: 'Failed to parse AI response' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { success: true, data: parsed },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

