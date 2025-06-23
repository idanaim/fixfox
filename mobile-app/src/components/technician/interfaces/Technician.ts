import { TechnicianRating } from './technician-rating';

export interface Technician {
  technician_id: string;
  name: string;
  service_type: 'onsite' | 'lab';
  image: string;
  mobile: string;
  address: string;
  professions: string[];
  locations: Array<{
    location_id: string;
    city: string;
    area: string;
  }>;
  ratings: Array<TechnicianRating>;
}
