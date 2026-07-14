const apiKey = 'AIzaSyAWoj4sUyr8Xq5VFNmXtUEgJMnZqvHyzfc';
const model = 'gemini-2.5-flash-image';
const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

async function test() {
  try {
    console.log('Sending request to Gemini 2.5 Flash Image API...');
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: 'Create a photorealistic design of a premium luxury modern kitchen interior with marble countertop, high-end gold pendant lights, and dark wood cabinetry.' }
            ]
          }
        ],
        generationConfig: {
          responseModalities: ['TEXT', 'IMAGE']
        }
      }),
    });

    console.log('Status Code:', response.status);
    const data = await response.json();
    console.log('Response Keys:', Object.keys(data));
    if (data.candidates && data.candidates[0].content.parts) {
      console.log('Success! Candidates returned.');
      const parts = data.candidates[0].content.parts;
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        console.log(`Part ${i} keys:`, Object.keys(part));
        if (part.inlineData) {
          console.log(`- mimeType: ${part.inlineData.mimeType}, data length: ${part.inlineData.data.length}`);
        }
      }
    } else {
      console.log('Response body:', JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error('Error during API test:', err);
  }
}

test();
