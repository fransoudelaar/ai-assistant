'use client';

import { Action, Actions } from '@/app/_components/actions';
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/app/_components/conversation';
import { Message, MessageContent } from '@/app/_components/message';
import {
  PromptInput,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
} from '@/app/_components/prompt-input';
import { Response } from '@/app/_components/response';
import { Source, Sources, SourcesContent, SourcesTrigger } from '@/app/_components/sources';
import { useChat } from '@ai-sdk/react';
import { CopyIcon, RefreshCcwIcon } from 'lucide-react';
import { useState } from 'react';
import { Loader } from './_components/loader';

type MessagePart =
  | { type: 'text'; text: string }
  | { type: 'source-url'; url: string }
  | { type: 'tool-weather'; [key: string]: string }
  | { type: 'tool-convertFahrenheitToCelsius'; [key: string]: string };

type ChatMessage = { id: string; role: 'user' | 'assistant'; parts: MessagePart[] };

export default function Chat() {
  const [input, setInput] = useState('');
  const { messages, sendMessage, status, regenerate } = useChat();
  const typedMessages = messages as ChatMessage[];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage({ text: input });
      setInput('');
    }
  };

  return (
    <div className="mx-auto p-6 relative size-full rounded-lg border h-full min-h-screen">
      <div className="flex flex-col h-full">
        <Conversation>
          <ConversationContent>
            {typedMessages.map((message, messageIndex) => (
              <div key={message.id}>
                {message.role === 'assistant' && (
                  <Sources>
                    <SourcesTrigger
                      count={message.parts.filter(part => part.type === 'source-url').length}
                    />
                    {message.parts.map((part, i) => {
                      switch (part.type) {
                        case 'source-url':
                          return (
                            <SourcesContent key={`${message.id}-${i}`}>
                              <Source key={`${message.id}-${i}`} href={part.url} title={part.url} />
                            </SourcesContent>
                          );
                      }
                    })}
                  </Sources>
                )}
                <Message from={message.role} key={message.id}>
                  <MessageContent>
                    {message.parts.map((part, i) => {
                      switch (part.type) {
                        case 'text':
                          const isLastMessage = messageIndex === typedMessages.length - 1;
                          return (
                            <div key={`${message.id}-${i}`}>
                              <Response>{part.text}</Response>
                              {message.role === 'assistant' && isLastMessage && (
                                <Actions className="mt-2">
                                  <Action onClick={() => regenerate()} label="Retry">
                                    <RefreshCcwIcon className="size-3" />
                                  </Action>
                                  <Action
                                    onClick={() => navigator.clipboard.writeText(part.text)}
                                    label="Copy">
                                    <CopyIcon className="size-3" />
                                  </Action>
                                </Actions>
                              )}
                            </div>
                          );
                        case 'tool-weather':
                        case 'tool-convertFahrenheitToCelsius':
                          return (
                            <pre key={`${message.id}-${i}`}>{JSON.stringify(part, null, 2)}</pre>
                          );
                        default:
                          return null;
                      }
                    })}
                  </MessageContent>
                </Message>
              </div>
            ))}
            {status === 'submitted' && <Loader />}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <PromptInput onSubmit={handleSubmit} className="mt-4 relative">
          <PromptInputTextarea
            onChange={e => setInput(e.currentTarget.value)}
            value={input}
            className="text-3xl"
          />
          <PromptInputToolbar>
            <PromptInputSubmit
              className="absolute right-1 bottom-1"
              disabled={input.trim().length === 0 || status === 'submitted'}
              status={status}
            />
          </PromptInputToolbar>
        </PromptInput>
      </div>
    </div>
  );
}
