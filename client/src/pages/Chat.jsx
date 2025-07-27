import React, { useState, useRef } from "react";
import axios from "axios";
import { SendHorizonal, Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [typedReply, setTypedReply] = useState("");
    const typedBufferRef = useRef("");

    const simulateTyping = (text, onDone) => {
        let i = 0;
        typedBufferRef.current = "";
        setTypedReply("");

        const interval = setInterval(() => {
            typedBufferRef.current += text[i];
            setTypedReply(typedBufferRef.current);
            i++;
            if (i >= text.length) {
                clearInterval(interval);
                onDone();
            }
        }, 25);
    };

    const handleSend = async () => {
        const trimmed = input.trim();
        if (!trimmed) return;

        const userMsg = { role: "user", text: trimmed };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const res = await axios.post("http://localhost:3000/ask-ai", { message: trimmed }, { withCredentials: true });
            const botReply = res.data?.reply || "Hmm... I'm not sure how to respond to that.";

            simulateTyping(botReply, () => {
                setMessages(prev => [...prev, { role: "ai", text: botReply }]);
                setTypedReply("");
                setLoading(false);
            });
        } catch (err) {
            const errorReply = "Sorry, something went wrong while chatting with the AI.";
            simulateTyping(errorReply, () => {
                setMessages(prev => [...prev, { role: "ai", text: errorReply }]);
                setTypedReply("");
                setLoading(false);
            });
        }
    };

    return (
        <div className="flex flex-col items-center justify-start min-h-[calc(100vh-64px)] max-h-[calc(100vh-64px)] overflow-hidden bg-gradient-to-b from-indigo-50 via-white to-zinc-100 dark:from-zinc-900 dark:via-zinc-950 dark:to-black text-zinc-800 dark:text-white px-4 py-4">
            {/* Header */}
            <div className="w-full max-w-3xl flex items-center gap-2 px-4 py-3 text-xl font-semibold bg-white dark:bg-zinc-900 shadow rounded-t-2xl border-b border-zinc-200 dark:border-zinc-700">
                <Bot className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                AI Chat <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400 ml-2">(powered by Gemini)</span>
            </div>

            {/* Chat Box */}
            <div className="w-full max-w-3xl flex-grow overflow-y-auto bg-white dark:bg-zinc-900 shadow-inner px-4 py-6 space-y-4">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[75%] px-4 py-2 rounded-xl text-sm shadow
                            ${msg.role === "user"
                                ? "bg-indigo-600 text-white"
                                : "bg-zinc-100 dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
                            }`}>
                            {msg.role === "user" ? (
                                <span className="whitespace-pre-line">{msg.text}</span>
                            ) : (
                                <div className="whitespace-pre-line text-sm">
                                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {typedReply && (
                    <div className="flex justify-start">
                        <div className="max-w-[75%] px-4 py-2 rounded-xl text-sm shadow bg-zinc-100 dark:bg-zinc-800 text-gray-900 dark:text-gray-100">
                            <div className="whitespace-pre-line text-sm">
                                <ReactMarkdown>{typedReply}</ReactMarkdown>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            <div className="w-full max-w-3xl sticky bottom-0 z-10 bg-white dark:bg-zinc-950 px-4 py-3 border-t border-zinc-200 dark:border-zinc-700 flex items-center gap-2 shadow-md">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Ask something academic..."
                    className="flex-1 px-4 py-2 rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                />
                <button
                    onClick={handleSend}
                    disabled={loading || !input.trim()}
                    className="p-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white transition disabled:opacity-50"
                >
                    <SendHorizonal size={18} />
                </button>
            </div>
        </div>
    );
};

export default Chat;