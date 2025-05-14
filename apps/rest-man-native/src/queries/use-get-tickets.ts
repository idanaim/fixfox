import { useQuery } from '@tanstack/react-query';


const getTicketsApi = async () => {
  const response = await fetch(`http://localhost:3000/api/rest_man_ticket`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  if (response.ok) {
   return  await response.json();
  } else {
    console.error('Failed to update maintenance call status');
  }
};
export default function UseGetTickets() {

  return useQuery({
    queryKey: ['tickets'],
    queryFn: () =>getTicketsApi()
  });
}
