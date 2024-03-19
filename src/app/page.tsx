"use client";
import React, { FormEvent, useEffect, useState } from "react";
import { ChatSession, GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "ADD_YOUR_API_KEY";
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

let PROMPT =
  "Let's create a role playing choose your own adventure style game! Could you start off this game with one random start to a choose your own adventure game? and then I want you to act as a narrator and tell me what happens when I pick an action. Each time, return just the text of what happens when the user selects that option and also provide in that text options that the user can take. Do not add new line delimiters.";

interface Message {
  role: string;
  parts: string;
}

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");
  const [chat, setChat] = useState<ChatSession>();

  useEffect(() => {
    const chat = model.startChat({
      generationConfig: {
        maxOutputTokens: 1200,
      },
    });
    setChat(chat);
  }, []);

  useEffect(() => {
    (async () => {
      if (chat) {
        const result = await chat.sendMessage(PROMPT);
        const response = result.response;
        const text = response.text();
        setMessages((prevMessages) => [
          ...prevMessages,
          { parts: text, role: "model" },
        ]);
      }
    })();
  }, [chat]);

  const sendMessage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (userInput.trim() === "") {
      return;
    }

    const newMessage = {
      role: "user",
      parts: userInput,
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setUserInput("");

    if (chat) {
      const result = await chat.sendMessage(userInput);
      const response = result.response;
      const text = response.text();

      const newMessage = {
        role: "model",
        parts: text,
      };
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    }
  };

  return (
    <div className="flex flex-col h-screen p-6 mx-auto max-w-4xl">
      <div className="text-3xl text-white font-bold flex items-center justify-center mb-4">
        Your adventure
      </div>
      <div className="flex-grow flex flex-col overflow-y-auto p-4">
        {messages.map((message) => (
          <div
            key={message.parts}
            className={`mb-2 py-2 px-3 rounded-xl ${
              message.role === "user" ? "text-right self-end" : "text-left"
            } ${
              message.role === "user"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-black"
            }`}
          >
            {message.parts}
          </div>
        ))}
      </div>
      <form
        className="flex items-center p-4 w-full"
        onSubmit={(e) => sendMessage(e)}
      >
        <input
          className="flex-grow rounded-lg p-2 mr-2 border-2 w-full text-black"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
        />
        <button className="bg-blue-500 text-white p-2 rounded-lg">Send</button>
      </form>
    </div>
  );
}
