import axios from 'axios';

const HUGGING_FACE_API = 'https://api-inference.huggingface.co/models/tiiuae/falcon-7b-instruct';
const API_KEY = import.meta.env.VITE_HUGGING_FACE_API_KEY;

if (!API_KEY) {
  console.error('Missing Hugging Face API key. Please add VITE_HUGGING_FACE_API_KEY to your .env file.');
}

export async function generateBulletPoint(prompt: string): Promise<string> {
  try {
    const response = await axios.post(
      HUGGING_FACE_API,
      {
        inputs: `Generate a professional, impactful bullet point for a resume based on this context: ${prompt}.
                The bullet point should:
                - Start with a strong action verb
                - Include specific metrics or achievements where possible
                - Be concise and focused
                - Be in present tense for current roles, past tense for previous roles
                Format the response as a single bullet point starting with "•"`,
        parameters: {
          max_new_tokens: 100,
          temperature: 0.7,
          top_p: 0.9,
          do_sample: true,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
      }
    );

    let generatedText = response.data[0]?.generated_text || '';

    // Clean up the response
    generatedText = generatedText.trim();
    if (!generatedText.startsWith('•')) {
      generatedText = '• ' + generatedText;
    }

    return generatedText;
  } catch (error) {
    console.error('Error generating bullet point:', error);
    throw new Error('Failed to generate bullet point. Please try again.');
  }
}