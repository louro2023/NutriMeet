export interface Nutritionist {
  id: string;
  name: string;
  photo: string;
  crn: string;
  specialties: string[];
  approaches: string[];
  city: string;
  state: string;
  description: string;
  whatsapp: string;
  status: 'active' | 'pending' | 'rejected';
  price: number;
  experience?: string;
  education?: string;
  languages?: string[];
  modality: ('online' | 'presencial')[];
}

export interface Testimonial {
  id: string;
  author: string;
  content: string;
  rating: number;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export interface Subscription {
  id: string;
  name: string;
  email: string;
  phone: string;
  crn: string;
  description?: string;
  city?: string;
  state?: string;
  specialties: string[];
  approaches: string[];
  status: 'pending' | 'approved' | 'rejected';
  date: string;
  photo?: string;
}
