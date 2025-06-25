import { API_BASE_URL } from '../config';

export class ServerApi {
  public headers: Record<string, string> = { 'Content-Type': 'application/json' };
  public baseUrl = `${API_BASE_URL}/`;

  constructor(extraHeaders: any) {
    // Only add Authorization header if token exists
    this.headers = {
      'Content-Type': 'application/json',
    };
    
    if (extraHeaders?.token) {
      this.headers['Authorization'] = `Bearer ${extraHeaders.token}`;
    }
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
