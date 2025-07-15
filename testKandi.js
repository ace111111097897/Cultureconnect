import fetch from 'node-fetch';

const CONVEX_API_URL = 'https://helpful-akita-849.convex.cloud/api/actions/chatWithKandi';

async function testKandi() {
  const response = await fetch(CONVEX_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: "Hello Kandi! Are you there?" })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Kandi API error:', response.status, errorText);
    return;
  }

  const data = await response.json();
  console.log('Kandi response:', data);
}

testKandi(); 