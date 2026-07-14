const apiKey = 'AIzaSyAWoj4sUyr8Xq5VFNmXtUEgJMnZqvHyzfc';
const model = 'gemini-2.5-flash';
const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

async function test() {
  try {
    console.log('Sending request to Gemini 2.5 Flash for combined JSON...');
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: `You are Ziora AI, the design assistant for TBM Building Services (premium renovation/smart homes in Nigeria).
Analyze this user design request: "a wabi sabi kitchen with wood cabinets".
Return a JSON object containing:
1. "imagePrompt": A highly detailed, professional Stable Diffusion prompt to generate a high-end luxury wabi-sabi kitchen interior design photo, following TBM luxury standards.
2. "matchedProducts": A list of 2 matched premium materials/finishes from the Bogat catalog (paints, finishes, flooring, lighting).

Format example:
{
  "imagePrompt": "...",
  "matchedProducts": [...]
}
Return ONLY valid JSON. No markdown wrappers.` }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: 'application/json'
        }
      }),
    });

    console.log('Status Code:', response.status);
    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;
    console.log('Returned Text:', text);
    const parsed = JSON.parse(text);
    console.log('Parsed Image Prompt:', parsed.imagePrompt);
    console.log('Parsed Products:', parsed.matchedProducts);
  } catch (err) {
    console.error('Error during test:', err);
  }
}

test();
