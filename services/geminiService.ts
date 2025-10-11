

import { GoogleGenAI, Type } from "@google/genai";
import { KNOWLEDGE_BASE_DOCUMENT } from '../constants';
import type { DiagnosticResponse } from "../types";

// Ensure the API key is available from environment variables
const apiKey = process.env.API_KEY;
if (!apiKey) {
    throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey });

const systemInstruction = `You are an expert assistant for a Healthcare IT imaging platform. Your name is "Navigator AI".
Your knowledge is strictly limited to the provided support documentation.
When answering, be concise and refer to specific sections or systems from the document if possible.
If the user's question cannot be answered using the document, you MUST state: "I cannot find information on that topic in the provided documentation."
Do not invent or assume any information outside of the provided text. Start your first response by introducing yourself.`;

export const queryKnowledgeBase = async (question: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `CONTEXT: """${KNOWLEDGE_BASE_DOCUMENT}""" \n\n QUESTION: """${question}"""`,
      config: {
        systemInstruction: systemInstruction,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Error querying Gemini API:", error);
    return "There was an error processing your request. Please check the console for details.";
  }
};

export interface QAPair {
  question: string;
  answer: string;
}

export const generateQADataset = async (
  topic: string,
  persona: string,
  count: number
): Promise<QAPair[]> => {
  try {
    const systemInstructionForDataset = `You are a data generator for a machine learning model. Your task is to create high-quality question-and-answer pairs based *only* on the provided context document about a Healthcare IT platform. Do not use any external knowledge. The answers must be grounded in the text.`;
    
    const prompt = `Based on the provided documentation, generate exactly ${count} question-and-answer pairs about "${topic}". The questions should be phrased as if they are being asked by a ${persona}. The answers must be concise and derived strictly from the provided documentation.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `CONTEXT: """${KNOWLEDGE_BASE_DOCUMENT}""" \n\n TASK: """${prompt}"""`,
      config: {
        systemInstruction: systemInstructionForDataset,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            qa_pairs: {
              type: Type.ARRAY,
              description: "A list of question and answer pairs.",
              items: {
                type: Type.OBJECT,
                properties: {
                  question: {
                    type: Type.STRING,
                    description: "The generated question.",
                  },
                  answer: {
                    type: Type.STRING,
                    description: "The answer to the question, based on the context.",
                  },
                },
                required: ["question", "answer"],
              },
            },
          },
          required: ["qa_pairs"],
        },
      },
    });

    const jsonResponse = JSON.parse(response.text);
    return jsonResponse.qa_pairs || [];
    
  } catch (error) {
    console.error("Error generating Q&A dataset:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate dataset. Please check the console for details. API Error: ${error.message}`);
    }
    throw new Error("An unknown error occurred while generating the dataset.");
  }
};

export const generateDocumentation = async (topic: string, contextChunks: string[]): Promise<string> => {
      try {
        const systemInstructionForDocGen = `You are a senior technical writer tasked with creating a support document for a Healthcare IT platform.
        Your knowledge is strictly limited to the provided support documentation context. The user may provide additional context from their chat session. Prioritize information from this additional context when generating the document, but still ground it in the main knowledge base.
        Based on the provided context and the user's topic, generate a clear, well-structured troubleshooting guide.
        The guide should be formatted using Markdown and include the following sections where appropriate:
        - **Summary**: A brief overview of the issue.
        - **Common Symptoms**: A list of observable symptoms.
        - **Diagnostic Steps**: A step-by-step guide to investigating the problem.
        - **Resolution Path**: Recommended solutions and actions.
        - **Escalation**: When and how to escalate the issue.
        If the topic cannot be addressed by the provided context, state that you cannot create documentation on that topic.`;

        const additionalContext = contextChunks.length > 0
            ? `\n\nADDITIONAL CONTEXT FROM USER'S CHAT SESSION (Prioritize this):\n${contextChunks.map(c => `- ${c}`).join('\n')}`
            : '';

        const prompt = `CONTEXT: """${KNOWLEDGE_BASE_DOCUMENT}"""${additionalContext} \n\n DOCUMENTATION_TOPIC: """${topic}"""`;

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
            systemInstruction: systemInstructionForDocGen,
          },
        });

        return response.text;
      } catch (error) {
        console.error("Error generating documentation:", error);
        return "There was an error generating the documentation. Please check the console for details.";
      }
    };

export const getDiagnosticResponse = async (topic: string, history: { sender: 'user' | 'bot'; text: string }[]): Promise<DiagnosticResponse> => {
    const componentList = ['pacs', 'unifier', 'iris', 'powerscribe', 'risemr', 'radassist'];
    const diagnosticSystemInstruction = `You are "Navigator AI," an expert diagnostic assistant for a Healthcare IT imaging platform. Your knowledge is strictly limited to the provided support documentation context.
You are currently running a diagnostic wizard for: "${topic}".
Your goal is to guide the user step-by-step to diagnose and resolve the issue. Ask clarifying questions one at a time.
Your response MUST be a JSON object with two keys:
1.  "responseText": A string containing your textual answer for the user.
2.  "highlightedComponents": A JavaScript array of component ID strings that are relevant to your response. The IDs must be from this list: [${componentList.join(', ')}]. If your response is general, provide an array with all components to show the whole system. If no specific component is relevant, provide an empty array.`;

    const contents = history.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
    }));

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
                { role: 'user', parts: [{ text: `Use the following context to answer all questions:\n\nCONTEXT: """${KNOWLEDGE_BASE_DOCUMENT}"""` }] },
                { role: 'model', parts: [{ text: 'Understood. I will use this context to help diagnose issues based on the user\'s input and I will respond in the required JSON format.' }] },
                ...contents
            ],
            config: {
                systemInstruction: diagnosticSystemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        responseText: {
                            type: Type.STRING,
                            description: "The text to display to the user to guide them in the diagnosis."
                        },
                        highlightedComponents: {
                            type: Type.ARRAY,
                            description: `A list of system component IDs relevant to the response. Valid IDs are: ${componentList.join(', ')}.`,
                            items: {
                                type: Type.STRING
                            }
                        }
                    },
                    required: ["responseText", "highlightedComponents"]
                }
            },
        });
        
        const jsonResponse = JSON.parse(response.text);
        return {
            text: jsonResponse.responseText || "I seem to be having trouble forming a response. Could you try rephrasing?",
            components: jsonResponse.highlightedComponents || []
        };
    } catch (error) {
        console.error("Error in diagnostic query:", error);
        return {
            text: "There was an error processing your diagnostic request. Please try again.",
            components: []
        };
    }
};

export const getExplanationFor = async (textToExplain: string): Promise<string> => {
    const explanationSystemInstruction = `You are an expert assistant for a Healthcare IT imaging platform. Your task is to explain the provided text in simple terms, relating it back to the provided support documentation context.
Explain *why* this step or question is being asked in the diagnostic process and what information it helps to gather.
For example, if the text is "Is the Unifier's cache utilization over 90%?", your explanation should mention that the documentation indicates this is a critical threshold and can cause performance issues, requiring a purge of old studies.
Be concise and clear. Your knowledge is strictly limited to the provided support documentation.`;

    const prompt = `CONTEXT: """${KNOWLEDGE_BASE_DOCUMENT}""" \n\n EXPLAIN THIS DIAGNOSTIC STEP/QUESTION: """${textToExplain}"""`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: explanationSystemInstruction,
            },
        });
        return response.text;
    } catch (error) {
        console.error("Error getting explanation:", error);
        return "There was an error generating the explanation. Please check the console for details.";
    }
};