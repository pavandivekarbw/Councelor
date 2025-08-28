import { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
    careerCounselor,
    relationShipCounselor,
    wellnessdCounselor,
} from "./SystemPrompts";
import { formatToHTML } from "./helper";
import Loader from "../../components/loader/Loader";

type Persona = "career" | "relationship" | "wellness";

function Section({
    title,
    text,
    highlight = false,
}: {
    title: string;
    text: string;
    highlight?: boolean;
}) {
    return (
        <div
            className={`space-y-1 ${
                highlight ? "bg-blue-50 p-2 rounded-lg" : ""
            }`}
        >
            {title !== "🤝 Acknowledgement" && (
                <h4 className="text-md font-semibold text-gray-700">{title}</h4>
            )}
            <p
                className="text-gray-800 text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: formatToHTML(text) }}
            ></p>
        </div>
    );
}

const AI = () => {
    const [prompt, setPrompt] = useState("");
    const [persona, setPersona] = useState<Persona>("career");
    const [input, setInput] = useState("");
    const [answer, setAnswer] = useState<{
        acknowledgement: string;
        clarification: string;
        insight: string;
        actionable: string;
        encouragement: string;
        example: string;
    } | null>(null);
    const [loading, setLoading] = useState(false);

    const personas: Record<Persona, string> = {
        career: "Career Counselor",
        relationship: "Relationship Advisor",
        wellness: "Wellness Coach",
    };

    const getPrompt = (persona: Persona) => {
        switch (persona) {
            case "career":
                return careerCounselor;
            case "relationship":
                return relationShipCounselor;
            case "wellness":
                return wellnessdCounselor;
            default:
                return "";
        }
    };
    const handleGenerate = async () => {
        setInput(prompt);
        setPrompt("");
        setAnswer(null);
        try {
            setLoading(true);
            const genAI = new GoogleGenerativeAI(
                "AIzaSyAQ7DoATyDSGU1serj9zBK0rCRDK_87n9o"
            );
            const model = genAI.getGenerativeModel({
                model: "gemini-1.5-pro-latest",
            });

            const result = await model.generateContent({
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                systemInstruction: {
                    role: "system",
                    parts: [{ text: getPrompt(persona) }],
                },
            });

            // const generatedText =
            //     result?.response?.candidates[0]?.content.parts[0].text;
            // setOutput(generatedText || "");
            const candidates = result?.response?.candidates;
            if (!candidates || candidates.length === 0) {
                setLoading(false);
                console.log("No candidates found in response.");
                return;
            }
            const contentArray = candidates[0]?.content;
            const response = contentArray.parts && contentArray.parts[0];
            const text = response?.text ?? "";
            const jsonResponse = text
                .replace(/```json/g, "")
                .replace(/```/g, "")
                .trim();

            setAnswer(JSON.parse(jsonResponse));
            setLoading(false);
        } catch (error) {
            setLoading(false);
            console.log(error);
        }
    };
    return (
        <div className="w-1/2 min-h-screen flex flex-col items-center m-auto bg-gray-100 p-6">
            <h1 className="text-3xl font-bold mb-4 text-blue-700">
                {"SerenAI"}
            </h1>

            {/* Persona Selector */}
            <div className="flex gap-4 mb-6">
                {Object.entries(personas).map(([key, label]) => (
                    <button
                        key={key}
                        onClick={() => setPersona(key as Persona)}
                        className={`px-4 py-2 rounded-lg font-medium ${
                            persona === key
                                ? "bg-blue-600 text-white"
                                : "bg-gray-200 text-gray-700"
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Chat Window */}
            <div className="w-full max-w-xl bg-white rounded-2xl shadow-md flex flex-col p-4 h-[750px]">
                <div className="flex-1 overflow-y-auto space-y-3">
                    {/* {messages.map((m, i) => (
                        <div
                            key={i}
                            className={`p-3 rounded-lg max-w-[80%] ${
                                m.role === "user"
                                    ? "ml-auto bg-blue-100 text-blue-800"
                                    : "mr-auto bg-gray-100 text-gray-800"
                            }`}
                        >
                            {m.content}
                        </div>
                    ))} */}
                    {input && (
                        <div className="p-3 rounded-lg max-w-[80%] bg-gray-100 text-gray-800 ml-auto">
                            {input}
                        </div>
                    )}
                    {answer && (
                        <div className="mr-auto bg-gray-50 border border-gray-200 shadow-sm rounded-xl p-4 space-y-3 max-w-[85%]">
                            <Section
                                title="🤝 Acknowledgement"
                                text={`As I see, ${answer.acknowledgement}`}
                            />
                            <Section
                                title="🔍 Here is my initial thought on this"
                                text={answer.clarification}
                            />
                            <Section
                                title="💡 More Insights on your quiestion"
                                text={answer.insight}
                            />
                            <Section
                                title="✅ Actionable Steps: What can you do?"
                                text={answer.actionable}
                            />
                            <Section
                                title="🌱 Encouragement"
                                text={answer.encouragement}
                            />
                            {answer.example && (
                                <Section
                                    title="📖 Take an Example"
                                    text={answer.example}
                                    highlight
                                />
                            )}
                            <div className="text-sm font-semibold text-gray-700 p-2 rounded-lg">
                                {"I hope, I helped you! 😊"}
                            </div>
                        </div>
                        // <div className="mr-auto bg-gray-50 border border-gray-200 shadow-sm rounded-2xl px-4 py-3 max-w-[80%] leading-relaxed text-gray-800">
                        //     <p>
                        //         <span className="font-medium">🤝</span>{" "}
                        //         {answer.acknowledgement}
                        //     </p>
                        //     <p className="mt-2">{answer.clarification}</p>
                        //     <p className="mt-2">💡 {answer.insight}</p>
                        //     <p className="mt-2">
                        //         <span className="font-medium">
                        //             Here’s something you could try:
                        //         </span>{" "}
                        //         {answer.actionable}
                        //     </p>
                        //     <p className="mt-2">🌱 {answer.encouragement}</p>
                        //     {answer.example && (
                        //         <div className="mt-3 pl-3 border-l-4 border-blue-300 bg-blue-50 rounded">
                        //             <p className="text-sm italic text-gray-700">
                        //                 Example: {answer.example}
                        //             </p>
                        //         </div>
                        //     )}
                        // </div>
                    )}
                </div>

                {/* Input Box */}
                <div className="flex gap-2 mt-3">
                    <input
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                        placeholder="What is your question..."
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <button
                        onClick={handleGenerate}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
                    >
                        Ask
                    </button>
                </div>
            </div>
            {loading && <Loader />}
        </div>
    );
};

export default AI;
