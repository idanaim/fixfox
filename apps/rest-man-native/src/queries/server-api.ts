export async function fetchCall(controller: string) {
  const response = await fetch(`http://localhost:3000/api/${controller}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (response.ok) {
    let newVar = await response.json();
    console.log(newVar);
    debugger;
    return newVar;
  } else {
    console.error('Failed to update ${controller} call status');
  }
}

export async function postCall<T=any>(controller: string, body: T, method = 'POST') {
  const response = await fetch(`http://localhost:3000/api/${controller}`, {
    method: method,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  if (response.ok) {
    return await response.json();
  } else {
    console.error('Failed to update ${controller} call status');
  }
}
