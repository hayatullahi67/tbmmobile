const apiKey = 'AIzaSyAWoj4sUyr8Xq5VFNmXtUEgJMnZqvHyzfc';
const model = 'gemini-2.5-flash';
const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

async function test() {
  try {
    console.log('Sending request to Gemini 2.5 Flash for all-styles JSON...');
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: `You are Ziora AI, the premium design intelligence system for TBM Building Services (renovations in Nigeria).
Analyze this user design request: "a luxury kitchen with island".
For each of the following 6 design styles, generate a highly detailed Stable Diffusion image prompt (following TBM luxury standards) and identify 2 matched finishes/fixtures from the Bogat catalog.

Styles: Modern, Minimalism, WabiSabi, Tropical, Farmhouse, Memphis.

Return a JSON object with this exact structure:
{
  "Modern": {
    "imagePrompt": "...",
    "matchedProducts": [
      {
        "productId": "...",
        "name": "...",
        "category": "...",
        "price": 45000,
        "priceDisplay": "₦45,000.00",
        "imageUrl": "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=150"
      }
    ]
  },
  "Minimalism": { ... },
  "WabiSabi": { ... },
  "Tropical": { ... },
  "Farmhouse": { ... },
  "Memphis": { ... }
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
    const parsed = JSON.parse(text);
    console.log('Keys in returned JSON:', Object.keys(parsed));
    console.log('Modern Image Prompt length:', parsed.Modern.imagePrompt.length);
    console.log('WabiSabi Matched Products:', parsed.WabiSabi.matchedProducts);
  } catch (err) {
    console.error('Error during test:', err);
  }
}

test();
