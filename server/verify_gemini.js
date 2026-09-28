const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '.env') });
const { GoogleGenAI } = require('@google/genai');

async function testWithTimeout(ai, model, prompt, config = {}, timeoutMs = 8000) {
  const startTime = Date.now();
  const apiPromise = ai.models.generateContent({
    model: model,
    contents: prompt,
    config: config
  });

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`Timed out after ${timeoutMs}ms`)), timeoutMs)
  );

  const response = await Promise.race([apiPromise, timeoutPromise]);
  const duration = Date.now() - startTime;
  return { text: response.text ? response.text.trim() : '', duration };
}

async function testGeminiModels() {
  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  console.log('Testing Gemini API key presence:', !!apiKey, 'Length:', apiKey.length);

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    console.log('No valid GEMINI_API_KEY found (placeholder present).');
    return;
  }

  const ai = new GoogleGenAI({ apiKey });

  const modelsToTest = [
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-flash-latest',
    'gemini-3.8-flash',
    'gemini-3.5-flash',
    'gemini-3.5-flash-lite'
  ];

  console.log('\n--- Benchmarking Candidate Models ---');
  const results = [];

  for (const model of modelsToTest) {
    process.stdout.write(`Testing model: ${model} ... `);
    try {
      const { text, duration } = await testWithTimeout(
        ai,
        model,
        'Respond with "OK" if operational.',
        {},
        7000
      );
      console.log(`[SUCCESS] in ${duration}ms: "${text.slice(0, 60)}"`);
      results.push({ model, success: true, duration, response: text });
    } catch (err) {
      console.log(`[FAILED]: ${err.message || err}`);
      results.push({ model, success: false, duration: 0, error: err.message || String(err) });
    }
  }

  console.log('\n=== Summary of Model Verification ===');
  console.table(results.map(r => ({
    Model: r.model,
    Status: r.success ? 'SUCCESS' : 'FAILED',
    'Latency (ms)': r.duration,
    Note: r.success ? (r.response ? r.response.slice(0, 40) : 'OK') : (r.error ? r.error.slice(0, 40) : 'Error')
  })));

  // Pick the fastest stable model from successful ones
  const successful = results.filter(r => r.success);
  if (successful.length > 0) {
    const best = successful[0];
    console.log(`\n--- Deep JSON Verification on Best Candidate: ${best.model} ---`);
    try {
      const { text, duration } = await testWithTimeout(
        ai,
        best.model,
        'Explain what MahaBPAMS is in Maharashtra in 1 short sentence. Return valid JSON: {"topic": "MahaBPAMS", "summary": "..."}',
        { responseMimeType: 'application/json' },
        8000
      );
      console.log(`[SUCCESS] Structured JSON verified in ${duration}ms!`);
      console.log('Response:', text);
    } catch (err) {
      console.log('[FAILED] Deep verification error:', err.message);
    }
  }
}

testGeminiModels().catch(console.error);
