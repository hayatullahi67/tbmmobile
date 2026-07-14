const apiKey = 'AIzaSyAWoj4sUyr8Xq5VFNmXtUEgJMnZqvHyzfc';
const model = 'gemini-2.5-flash';
const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

async function test() {
  try {
    console.log('Sending request to Gemini 1.5 Flash text API...');
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: 'Hello, what is TBM Building Services?' }
            ]
          }
        ]
      }),
    });

    console.log('Status Code:', response.status);
    const data = await response.json();
    if (data.candidates && data.candidates[0].content.parts) {
      console.log('Success! Answer:', data.candidates[0].content.parts[0].text);
    } else {
      console.log('Response body:', JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error('Error during API test:', err);
  }
}

test();
