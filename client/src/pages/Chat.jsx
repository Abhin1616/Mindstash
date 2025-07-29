import React, { useState, useRef, useEffect } from "react";
import { SendHorizonal, Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";
import api from "../config/api";

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [typedReply, setTypedReply] = useState("");
    const typedBufferRef = useRef("");
    const chatEndRef = useRef(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, typedReply]);

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
        }, 20);
    };

    const handleSend = async () => {
        const trimmed = input.trim();
        if (!trimmed) return;

        const userMsg = { role: "user", text: trimmed };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const res = await api.post("/ask-ai", { message: trimmed });
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
        <div className="flex flex-col items-center h-[calc(100vh-64px)] bg-gradient-to-b from-indigo-100 via-white to-zinc-100 dark:from-black dark:via-zinc-950 dark:to-zinc-900 px-4 py-4 text-zinc-900 dark:text-zinc-100">
            {/* Header */}
            <div className="w-full max-w-3xl flex items-center gap-2 px-6 py-4 text-2xl font-semibold bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm shadow-md rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <Bot className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                <span>AI Chat</span>
                <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400 ml-2">(powered by Gemini)</span>
            </div>

            {/* Chat Window */}
            {/* Chat Window */}
            <div className="w-full max-w-3xl flex-1 overflow-y-auto bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md mt-4 mb-3 rounded-2xl px-6 py-6 space-y-4 shadow-inner border border-zinc-200 dark:border-zinc-800">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[80%] px-5 py-3 rounded-2xl text-sm shadow-sm break-words
                            ${msg.role === "user"
                                ? "bg-gradient-to-br from-indigo-600 to-indigo-500 text-white"
                                : "bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100"
                            }`}>
                            <ReactMarkdown className="whitespace-pre-line">{msg.text}</ReactMarkdown>
                        </div>
                    </div>
                ))}

                {/* Typing animation */}
                {typedReply && (
                    <div className="flex justify-start">
                        <div className="max-w-[80%] px-5 py-3 rounded-2xl text-sm bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 shadow-sm whitespace-pre-line">
                            <ReactMarkdown>{typedReply}</ReactMarkdown>
                        </div>
                    </div>
                )}

                <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="w-full max-w-3xl bg-white/80 dark:bg-zinc-950/90 backdrop-blur-md rounded-full border border-zinc-300 dark:border-zinc-700 shadow-md px-4 py-2 flex items-center gap-3">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Ask something academic..."
                    className="flex-1 bg-transparent focus:outline-none text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
                />
                <button
                    onClick={handleSend}
                    disabled={loading || !input.trim()}
                    className="p-2 bg-indigo-600 hover:bg-indigo-700 rounded-full text-white transition disabled:opacity-50"
                >
                    <SendHorizonal size={18} />
                </button>
            </div>
        </div>
    );
};

export default Chat;
