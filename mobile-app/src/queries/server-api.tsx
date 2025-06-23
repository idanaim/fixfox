
export class ServerApi {
  public headers = { 'Content-Type': 'application/json' };
  public baseUrl = 'http://localhost:3000/api/';

  constructor(extraHeaders: any) {
    this.headers = {
      ...extraHeaders,
      'Content-Type': 'application/json',
    };
  }

   fetchCall= async(controller: string)=> {
    const response = await fetch(`${this.baseUrl}${controller}`, {
      method: 'GET',
      headers: {
        ...this.headers,
      },
    });

    if (response.ok) {
      const newVar =  await response.json();
      return newVar;
    } else {
      console.error('Failed to update ${controller} call status');
    }
  }

  postCall=async (
    controller: string,
    body: any,
    method = 'POST'
  ) => {

    const response = await fetch(`${this.baseUrl}${controller}`, {
      method: method,
      headers: {
        ...this.headers,
      },
      body: JSON.stringify(body),
    });
    if (response.ok) {
      const message = await response.text();
      const responseBody = JSON.parse(message);
      return responseBody.data ? responseBody.data : { data: responseBody };
    } else {
      console.error('Failed to update ${controller} call status');
    }
  }
}
