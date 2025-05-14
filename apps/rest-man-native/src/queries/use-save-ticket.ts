import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { Ticket } from '../../../rest-man-server/src/entities/ticket.entity';


const SaveTicketApi = async (body:Partial<Ticket>) => {
  const response = await fetch(`http://localhost:3000/api/rest_man_ticket`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body),
  });
  if (response.ok) {
    return  await response.json();
  } else {
    console.error('Failed to update maintenance call status');
  }
};
export default function UseSaveTicket() {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ticket:Partial<Ticket>)=>SaveTicketApi(ticket),
    onSuccess: () => {
       queryClient.invalidateQueries('tickets');
      alert('Ticket added successfully!');
      navigation.goBack();
    },
    onError: (error) => {
      alert('Error adding Ticket: ' + error.message);
    },
  });
}
