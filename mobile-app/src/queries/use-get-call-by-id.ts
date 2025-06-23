import { useQuery } from '@tanstack/react-query';


const getCalls = async (id:string) => {
  const response = await fetch(`http://localhost:3000/api/habit_tracker/${id}`, {
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
export default function UseGetCallById(id:string) {

  return useQuery({
    queryKey: ['calls'],
    queryFn: () =>getCalls(id),
    enabled: !!id
  });
}