async function test() {
  try {
    const url = 'https://unsplash.com/napi/search/photos?query=modern+kitchen+renovation&per_page=5';
    console.log('Sending request to Unsplash public search API...');
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    console.log('Status Code:', response.status);
    const data = await response.json();
    if (data.results && data.results.length > 0) {
      console.log('Success! Found photos:', data.results.length);
      console.log('First Photo URL:', data.results[0].urls.regular);
    } else {
      console.log('No photos returned. Response body:', JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error('Error during Unsplash NAPI test:', err);
  }
}

test();
