import axios from 'axios';

const HUGGING_FACE_API = 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2';
const API_KEY = import.meta.env.VITE_HUGGING_FACE_API_KEY;

if (!API_KEY) {
  console.error('Missing Hugging Face API key. Please add VITE_HUGGING_FACE_API_KEY to your .env file.');
}

const ACTION_VERBS = [
  'Developed', 'Implemented', 'Led', 'Increased', 'Reduced',
  'Managed', 'Created', 'Optimized', 'Streamlined', 'Launched'
];

export async function generateBulletPoint(prompt: string, existingBullets: string[] = []): Promise<string> {
  try {
    const existingBulletsText = existingBullets.length > 0
      ? `\nExisting bullets (DO NOT REPEAT THESE):
${existingBullets.map(bullet => bullet.trim()).join('\n')}`
      : '';

    const enhancedPrompt = `<s>[INST] You are a professional resume writer. Create a single, impactful resume bullet point based on this context: ${prompt}

${existingBulletsText}

Requirements:
- Must start with one of these verbs: ${ACTION_VERBS.join(', ')}
- Must include specific metrics (numbers, %, $, timeframe)
- Must be concise (15-20 words)
- Must show clear impact and results
- Must be different from existing bullets
- Must focus on a different achievement or aspect

Format the response as a single bullet point starting with "•" [/INST]</s>`;

    const response = await axios.post(
      HUGGING_FACE_API,
      {
        inputs: enhancedPrompt,
        parameters: {
          max_new_tokens: 100,
          temperature: 0.8, // Slightly increased for more variety
          top_p: 0.9,
          do_sample: true,
          return_full_text: false
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

    // Extract the bullet point if there's additional text
    const bulletMatch = generatedText.match(/•[^•\n]+/);
    if (bulletMatch) {
      generatedText = bulletMatch[0].trim();
    }

    // If no bullet point found, try to extract a sentence
    if (!bulletMatch) {
      const sentenceMatch = generatedText.match(/[A-Z][^.!?]*[.!?]/);
      if (sentenceMatch) {
        generatedText = '• ' + sentenceMatch[0].trim();
      } else {
        // If no sentence found, use the whole text if it starts with an action verb
        const startsWithVerb = ACTION_VERBS.some(verb =>
          generatedText.toLowerCase().startsWith(verb.toLowerCase())
        );
        if (startsWithVerb) {
          generatedText = '• ' + generatedText;
        } else {
          // If text doesn't start with a verb, try to find the first verb and start from there
          const verbIndex = generatedText.split(' ').findIndex((word: string) =>
            ACTION_VERBS.some(verb => verb.toLowerCase() === word.toLowerCase())
          );
          if (verbIndex !== -1) {
            generatedText = '• ' + generatedText.split(' ').slice(verbIndex).join(' ');
          } else {
            throw new Error('Could not generate a proper bullet point');
          }
        }
      }
    }

    // Remove any quotes if present
    generatedText = generatedText.replace(/^["']|["']$/g, '');

    // Ensure it starts with a bullet point
    if (!generatedText.startsWith('•')) {
      generatedText = '• ' + generatedText;
    }

    // Validate the generated text
    if (generatedText.length < 10 || !generatedText.includes(' ')) {
      throw new Error('Generated text is too short or invalid');
    }

    // Check for similarity with existing bullets
    const isTooSimilar = existingBullets.some(existing => {
      const similarity = calculateSimilarity(existing, generatedText);
      return similarity > 0.7; // If more than 70% similar, consider it too similar
    });

    if (isTooSimilar) {
      throw new Error('Generated bullet is too similar to existing ones');
    }

    // Ensure the text starts with an action verb after the bullet point
    const textAfterBullet = generatedText.replace('• ', '');
    const startsWithActionVerb = ACTION_VERBS.some(verb =>
      textAfterBullet.toLowerCase().startsWith(verb.toLowerCase())
    );

    if (!startsWithActionVerb) {
      // Prepend a random action verb if needed
      const randomVerb = ACTION_VERBS[Math.floor(Math.random() * ACTION_VERBS.length)];
      generatedText = `• ${randomVerb} ${textAfterBullet}`;
    }

    return generatedText;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 503) {
      // Wait for 2 seconds and try again
      await new Promise(resolve => setTimeout(resolve, 2000));
      return generateBulletPoint(prompt, existingBullets); // Retry once
    }
    console.error('Error generating bullet point:', error);
    throw new Error('Failed to generate bullet point. Please try again.');
  }
}

// Helper function to calculate similarity between two strings
function calculateSimilarity(str1: string, str2: string): number {
  const words1 = str1.toLowerCase().split(/\W+/);
  const words2 = str2.toLowerCase().split(/\W+/);

  const intersection = words1.filter(word => words2.includes(word));
  const union = new Set([...words1, ...words2]);

  return intersection.length / union.size;
}