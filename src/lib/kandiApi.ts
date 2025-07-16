import axios from "axios";

const KANDI_API_KEY = import.meta.env.VITE_KANDI_API_KEY || process.env.KANDI_API_KEY;

// TODO: Replace this endpoint with the actual Kandi API endpoint from the documentation
const KANDI_API_ENDPOINT = "https://api.kandi.ai/v1/chat";

export async function callKandiAI(prompt: string) {
  const response = await axios.post(
    KANDI_API_ENDPOINT,
    { prompt },
    {
      headers: {
        Authorization: `Bearer ${KANDI_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
} 