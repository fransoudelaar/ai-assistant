import { google } from '@ai-sdk/google';
import { streamText, UIMessage, convertToModelMessages, tool, stepCountIs, smoothStream } from 'ai';
import { z } from 'zod';

export const maxDuration = 30;

const convertFahrenheitToCelsiusTool = tool({
  description: 'Convert a temperature in fahrenheit to celsius',
  inputSchema: z.object({
    temperature: z.number().describe('The temperature in fahrenheit to convert'),
  }),
  execute: async ({ temperature }) => {
    const celsius = Math.round((temperature - 32) * (5 / 9));
    return {
      celsius,
    };
  },
});

const weatherTool = tool({
  description: 'Get the weather in a location (fahrenheit)',
  inputSchema: z.object({
    location: z.string().describe('The location to get the weather for'),
  }),
  execute: async ({ location }) => {
    const temperature = Math.round(Math.random() * (90 - 32) + 32);
    return {
      location,
      temperature,
    };
  },
});

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: google('gemini-2.5-flash'),
    system: 'You are a helpful assistant.',
    messages: convertToModelMessages(messages),
    experimental_transform: smoothStream(),
    tools: {
      // weather: weatherTool,
      // convertFahrenheitToCelsius: convertFahrenheitToCelsiusTool,
      websearch: google.tools.googleSearch({}),
      urlContext: google.tools.urlContext({}),
    },
  });

  return result.toUIMessageStreamResponse({ sendSources: true });
}
