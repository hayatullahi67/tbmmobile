const apiKey = 'AIzaSyAWoj4sUyr8Xq5VFNmXtUEgJMnZqvHyzfc';
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

async function test() {
  try {
    const response = await fetch(url);
    console.log('Status:', response.status);
    const data = await response.json();
    console.log('Models returned:', data.models ? data.models.map(m => m.name) : data);
  } catch (err) {
    console.error(err);
  }
}

test();
