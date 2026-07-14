const apiKey = 'AIzaSyAWoj4sUyr8Xq5VFNmXtUEgJMnZqvHyzfc';

const models = [
  'gemini-2.5-flash-image',
  'gemini-3.1-flash-image',
  'gemini-3.1-flash-lite-image',
  'gemini-3-pro-image',
  'imagen-4.0-generate-001',
  'imagen-4.0-fast-generate-001',
  'veo-3.1-generate-preview'
];

async function testModel(model) {
  const isGemini = model.startsWith('gemini');
  let url, body;

  if (isGemini) {
    url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    body = JSON.stringify({
      contents: [{ parts: [{ text: 'Create a photorealistic design of a premium luxury modern kitchen interior.' }] }],
      generationConfig: { responseModalities: ['TEXT', 'IMAGE'] }
    });
  } else if (model.startsWith('imagen')) {
    url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:predict?key=${apiKey}`;
    body = JSON.stringify({
      instances: [{ prompt: 'Create a photorealistic design of a premium luxury modern kitchen interior.' }],
      parameters: { sampleCount: 1 }
    });
  } else {
    // Veo
    url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    body = JSON.stringify({
      contents: [{ parts: [{ text: 'Create a premium kitchen interior video.' }] }]
    });
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body
    });
    console.log(`Model: ${model} -> Status: ${res.status}`);
    const data = await res.json();
    if (res.status === 200) {
      console.log(`  -> SUCCESS! Data keys:`, Object.keys(data));
      return true;
    } else {
      console.log(`  -> FAILED! Message:`, data.error?.message ? data.error.message.substring(0, 150) + '...' : JSON.stringify(data).substring(0, 150) + '...');
    }
  } catch (err) {
    console.log(`  -> ERROR:`, err.message);
  }
  return false;
}

async function run() {
  for (const m of models) {
    const ok = await testModel(m);
    if (ok) {
      console.log(`\n*** FOUND WORKING IMAGE MODEL: ${m} ***\n`);
    }
  }
}

run();
