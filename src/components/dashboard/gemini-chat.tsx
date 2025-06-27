'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useData } from '@/lib/data-provider';
import { getGeminiResponse } from '@/lib/actions';
import { Bot, LoaderCircle, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export function GeminiChat() {
    const { transactions, inventory, menuItems, payroll, isDataReady } = useData();
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
        }
    }, [chatHistory]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!query.trim() || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', content: query };
        setChatHistory(prev => [...prev, userMessage]);
        setIsLoading(true);
        setQuery('');

        try {
            const response = await getGeminiResponse({
                query: query,
                transactions: JSON.stringify(transactions),
                inventory: JSON.stringify(inventory),
                menuItems: JSON.stringify(menuItems),
                payroll: JSON.stringify(payroll),
            });
            const assistantMessage: ChatMessage = { role: 'assistant', content: response.answer };
            setChatHistory(prev => [...prev, assistantMessage]);
        } catch (error) {
            const errorMessage: ChatMessage = { role: 'assistant', content: "Sorry, I couldn't get a response. Please try again." };
            setChatHistory(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="flex flex-col h-full max-h-[428px] lg:max-h-none">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Bot />
                    Ask Gemini
                </CardTitle>
                <CardDescription>Ask questions about your business data.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
                <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
                    <div className="space-y-4">
                        {chatHistory.length === 0 && (
                            <div className="text-center text-sm text-muted-foreground pt-8">
                                <p>Try asking things like:</p>
                                <ul className="list-inside list-disc mt-2 text-left inline-block">
                                    <li>What was my total revenue last month?</li>
                                    <li>Which pizza is the most profitable?</li>
                                    <li>What are my top 5 expenses?</li>
                                </ul>
                            </div>
                        )}
                        {chatHistory.map((message, index) => (
                            <div key={index} className={cn("flex items-start gap-3", message.role === 'user' ? 'justify-end' : 'justify-start')}>
                                {message.role === 'assistant' && (
                                    <div className="p-2 bg-primary rounded-full text-primary-foreground"><Bot className="h-4 w-4" /></div>
                                )}
                                <div className={cn("max-w-xs md:max-w-md rounded-lg p-3 text-sm", message.role === 'user' ? 'bg-muted text-foreground' : 'bg-secondary')}>
                                    {message.content}
                                </div>
                                {message.role === 'user' && (
                                    <div className="p-2 bg-muted rounded-full"><User className="h-4 w-4" /></div>
                                )}
                            </div>
                        ))}
                         {isLoading && (
                            <div className="flex items-start gap-3 justify-start">
                                <div className="p-2 bg-primary rounded-full text-primary-foreground"><Bot className="h-4 w-4" /></div>
                                <div className="max-w-xs md:max-w-md rounded-lg p-3 text-sm bg-secondary">
                                    <div className="flex items-center gap-2">
                                        <LoaderCircle className="h-4 w-4 animate-spin" />
                                        <span>Thinking...</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
            <CardFooter className="pt-4">
                <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
                    <Input 
                        id="query" 
                        placeholder="e.g., What was my net profit?"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        disabled={isLoading || !isDataReady}
                    />
                    <Button type="submit" disabled={isLoading || !isDataReady || !query.trim()}>
                        Ask
                    </Button>
                </form>
            </CardFooter>
        </Card>
    );
}
