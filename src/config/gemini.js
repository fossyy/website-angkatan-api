import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY tidak ditemukan di environment variables");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * @param {string} modelName - nama model
 * @returns {Object} model
 */
export const getModel = (modelName = "gemini-2.5-flash") => {
  return genAI.getGenerativeModel({ model: modelName });
};

/**
 * @param {string} prompt
 * @param {string} modelName
 * @returns {Promise<string>}
 */
export const generateContent = async (prompt, modelName = "gemini-2.5-flash") => {
  try {
    const model = getModel(modelName);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating content:", error);
    throw error;
  }
};

/**
 * @param {Array} history - history (opt)
 * @param {string} message
 * @param {string} modelName
 * @returns {Promise<Object>}
 */
export const generateChat = async (history = [], message, modelName = "gemini-2.5-flash") => {
  try {
    const model = getModel(modelName);
    const chat = model.startChat({ history });
    const result = await chat.sendMessage(message);
    const response = await result.response;
    return {
      text: response.text(),
      chat: chat,
    };
  } catch (error) {
    console.error("Error in chat:", error);
    throw error;
  }
};

export default {
  getModel,
  generateContent,
  generateChat,
};
