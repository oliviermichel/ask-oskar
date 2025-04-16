"use client";
import { useState } from "react";
import Image from "next/image";

export default function Home() {
  const [chatInput, setChatInput] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [authenticated, setAuthenticated] = useState(false); // Track if the user is authenticated
  const [password, setPassword] = useState(""); // Track the entered password
  const [error, setError] = useState(""); // Track authentication errors
  const [recognizing, setRecognizing] = useState(false); // Track voice recognition status

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === process.env.NEXT_PUBLIC_PASSWORD) {
      setAuthenticated(true);
      setError("");
    } else {
      setError("Fel lösenord. Försök igen."); // Incorrect password message
    }
  };

  const handleVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Din webbläsare stöder inte röstinmatning.");
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = "sv-SE"; // Set language to Swedish
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => setRecognizing(true);
    recognition.onend = () => setRecognizing(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setChatInput(transcript); // Update chatInput with recognized text
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setRecognizing(false);
    };

    recognition.start();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(process.env.NEXT_PUBLIC_WEBHOOK_URL || "", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": process.env.NEXT_PUBLIC_BEARER_TOKEN || "",
        },
        body: JSON.stringify({ chatInput }),
      });

      if (res.ok) {
        const data = await res.json();
        setResponse(data.output || "Response received successfully!");
      } else {
        setResponse("Error: Unable to fetch response.");
      }
    } catch {
      setResponse("Error: Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (!authenticated) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-8 sm:p-20"
        style={{ backgroundColor: "#f4ede7", color: "#222222" }}
      >
        <h1 className="text-4xl font-bold mb-8">Fråga Oskar</h1>
        <form
          onSubmit={handlePasswordSubmit}
          className="w-full max-w-md flex flex-col gap-4"
        >
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Ange lösenord för att se appen"
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
            className="w-full py-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition"
          >
            Logga in
          </button>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </form>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-8 sm:p-20"
      style={{ backgroundColor: "#f4ede7", color: "#222222" }}
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
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Skriv din fråga om Consid här..."
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{
              backgroundColor: "#FFFFFF",
              color: "#001E47",
              borderColor: "#005BAC",
            }}
            required
            disabled={loading}
          />
          <button
            type="button"
            onClick={handleVoiceInput}
            className={`p-3 rounded bg-blue-500 text-white hover:bg-blue-600 transition ${
              recognizing ? "bg-gray-400 cursor-not-allowed" : ""
            }`}
            disabled={recognizing}
          >
            🎤
          </button>
        </div>
        <button
          type="submit"
          className={`w-full py-2 rounded transition ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
          }`}
          style={{
            color: "#FFFFFF",
          }}
          disabled={loading}
        >
          {loading ? "Skickar..." : "Skicka"}
        </button>
      </form>
      <div
        className="mt-8 w-3/4 p-4 rounded"
        style={{
          backgroundColor: "#F5F5F5",
          color: "#001E47",
          border: "1px solid #005BAC",
        }}
      >
        <h2 className="text-lg font-semibold mb-4">Svar:</h2>
        {loading ? (
          <p className="text-xl">Bearbetar ditt svar...</p>
        ) : response ? (
          <div className="text-base leading-relaxed">
            {response.split("\n").map((line, index) => {
              // Handle numbered points
              if (line.match(/^\d+\.\s/)) {
                const [boldText, ...rest] = line.split(":");
                return (
                  <p key={index} className="mt-2">
                    <strong>{boldText.trim()}</strong>: {rest.join(":").trim()}
                  </p>
                );
              }
              // Handle bullet points
              else if (line.startsWith("-")) {
                return (
                  <ul key={index} className="list-disc list-inside ml-4">
                    <li>{line.slice(1).trim()}</li>
                  </ul>
                );
              }
              // Handle regular text
              else if (line.trim() !== "") {
                return <p key={index}>{line}</p>;
              }
              return null; // Skip empty lines
            })}
          </div>
        ) : (
          <p className="text-xl">Inget svar ännu.</p>
        )}
      </div>
    </div>
  );
}
