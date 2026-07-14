const apiKey = 'AIzaSyAWoj4sUyr8Xq5VFNmXtUEgJMnZqvHyzfc';
const model = 'imagen-4.0-generate-001';
const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateImages?key=${apiKey}`;

async function test() {
  try {
    console.log('Sending request to Gemini Imagen 4 API...');
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: 'A premium luxury modern kitchen interior design with marble countertop, high-end gold pendant lights, and dark wood cabinetry.',
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '1:1',
      }),
    });

    console.log('Status Code:', response.status);
    const data = await response.json();
    if (data.generatedImages && data.generatedImages.length > 0) {
      console.log('Success! Image bytes length:', data.generatedImages[0].image.imageBytes.length);
    } else {
      console.log('No images returned. Response body:', JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error('Error during API test:', err);
  }
}

test();
