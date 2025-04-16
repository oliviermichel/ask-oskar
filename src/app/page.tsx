"use client";
import { useState } from "react";
import Image from "next/image";

export default function Home() {
  const [chatInput, setChatInput] = useState("");
  const [response, setResponse] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch(
        "https://oliviermichel.app.n8n.cloud/webhook/bf4dd093-bb02-472c-9454-7ab9af97bd1d",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "bearer Cons1d!Ask!Oskar",
          },
          body: JSON.stringify({ chatInput }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        setResponse(data.output || "Response received successfully!");
      } else {
        setResponse("Error: Unable to fetch response.");
      }
    } catch {
      setResponse("Error: Something went wrong.");
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-8 sm:p-20"
      style={{ backgroundColor: "#f4ede7", color: "#222222" }} // Consid color theme
    >
      <svg width="128" height="32" viewBox="0 0 128 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clipPath="url(#clip0_22_112)">
          {/* SVG paths */}
        </g>
        <defs>
          <clipPath id="clip0_22_112">
            <rect width="127.108" height="32" fill="white"></rect>
          </clipPath>
        </defs>
      </svg>
      <h1 className="text-4xl font-bold mb-8">Fråga Oskar</h1>
      <Image
        src="/oskar.jpeg"
        alt="Profile picture"
        className="mb-8 rounded-lg"
        width={200}
        height={200}
      />
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md flex flex-col gap-4"
      >
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder="Skriv din fråga här..."
          className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{
            backgroundColor: "#FFFFFF",
            color: "#001E47",
            borderColor: "#005BAC",
          }}
          required
        />
        <button
          type="submit"
          className="w-full py-2 rounded transition"
          style={{
            backgroundColor: "#005BAC",
            color: "#FFFFFF",
          }}
        >
          Skicka
        </button>
      </form>
      <div
        className="mt-8 w-3/4 p-4 rounded" // Adjusted width to 75% of the screen
        style={{
          backgroundColor: "#F5F5F5",
          color: "#001E47",
          border: "1px solid #005BAC",
        }}
      >
        <h2 className="text-lg font-semibold mb-4">Svar:</h2>
        {response ? (
          <div className="text-base leading-relaxed">
            {response.split("\n").map((line, index) => {
              if (line.startsWith("1.") || line.startsWith("2.") || line.startsWith("3.") || line.startsWith("4.") || line.startsWith("5.")) {
                return (
                  <p key={index} className="mt-2">
                    <strong>{line}</strong>
                  </p>
                );
              } else if (line.startsWith("-")) {
                return (
                  <ul key={index} className="list-disc list-inside ml-4">
                    <li>{line.slice(1).trim()}</li>
                  </ul>
                );
              } else {
                return <p key={index}>{line}</p>;
              }
            })}
          </div>
        ) : (
          <p className="text-xl">Inget svar ännu.</p>
        )}
      </div>
    </div>
  );
}
