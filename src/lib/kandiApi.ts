import axios from "axios";

const KANDI_API_KEY = import.meta.env.VITE_KANDI_API_KEY || process.env.KANDI_API_KEY;

export async function callKandiAI(prompt: string) {
  const response = await axios.post(
    "https://api.kandi.ai/v1/your-endpoint", // Replace with actual endpoint
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