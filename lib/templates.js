const uid = () => 'q' + Math.random().toString(36).slice(2, 8);
const q = (label, type, chips = [], multi = false) => ({ id: uid(), label, type, chips, multi, required: false });

export const TEMPLATES = {
  clinic: {
    name: 'Clinic / Hospital',
    questions: () => [
      q('Hamare paas aane ka decision kaisa raha?', 'chips_text', ['Best', 'Worthy', 'Bahut accha', 'Theek-thaak']),
      q('Kis problem ke liye aaye the?', 'chips_text', ['Back pain', 'Neck pain', 'Skin', 'Digestion']),
      q('Doctor ka guidance kaisa laga?', 'chips', ['Achhe se samjhaya', 'Dhyan se suna', 'Time diya'], true),
      q('Clinic kaisa laga?', 'chips', ['Saaf-suthra', 'Shaant mahaul', 'Staff helpful'], true),
      q('Visit type', 'chips', ['Pehli baar', 'Dobara aaya']),
      q('Kuch sudhar ho sakta hai?', 'text'),
    ],
  },
  cafe: {
    name: 'Cafe / Restaurant',
    questions: () => [
      q('Kaisa raha experience?', 'chips_text', ['Best', 'Bahut accha', 'Worth it', 'Theek-thaak']),
      q('Kya order kiya?', 'chips_text', ['Coffee', 'Pizza', 'Pasta', 'Dessert']),
      q('Kya pasand aaya?', 'chips', ['Taste', 'Ambience', 'Service', 'Price'], true),
      q('Kis ke saath aaye?', 'chips', ['Dost', 'Family', 'Akele', 'Date']),
      q('Kuch sudhar ho sakta hai?', 'text'),
    ],
  },
  school: {
    name: 'School / Coaching',
    questions: () => [
      q('Aap kaun hain?', 'chips', ['Parent', 'Student', 'Alumni']),
      q('Overall experience kaisa raha?', 'chips_text', ['Best', 'Bahut accha', 'Satisfied']),
      q('Kya pasand aaya?', 'chips', ['Teachers', 'Discipline', 'Activities', 'Facilities', 'Results'], true),
      q('Kuch sudhar ho sakta hai?', 'text'),
    ],
  },
  hotel: {
    name: 'Hotel / Stay',
    questions: () => [
      q('Stay kaisa raha?', 'chips_text', ['Best', 'Bahut accha', 'Value for money']),
      q('Kis liye aaye?', 'chips', ['Family trip', 'Business', 'Couple', 'Dost']),
      q('Kya pasand aaya?', 'chips', ['Room', 'Staff', 'Cleanliness', 'Location', 'Food'], true),
      q('Kuch sudhar ho sakta hai?', 'text'),
    ],
  },
  salon: {
    name: 'Salon / Spa',
    questions: () => [
      q('Experience kaisa raha?', 'chips_text', ['Best', 'Bahut accha', 'Worth it']),
      q('Kaunsi service li?', 'chips_text', ['Haircut', 'Facial', 'Hair spa', 'Makeup']),
      q('Kya pasand aaya?', 'chips', ['Staff', 'Hygiene', 'Result', 'Price'], true),
      q('Kuch sudhar ho sakta hai?', 'text'),
    ],
  },
  generic: {
    name: 'Other business',
    questions: () => [
      q('Experience kaisa raha?', 'chips_text', ['Best', 'Bahut accha', 'Worth it']),
      q('Kya pasand aaya?', 'chips', ['Service', 'Quality', 'Price', 'Staff'], true),
      q('Kuch sudhar ho sakta hai?', 'text'),
    ],
  },
};

export const TYPE_OPTIONS = Object.entries(TEMPLATES).map(([value, t]) => ({ value, label: t.name }));
