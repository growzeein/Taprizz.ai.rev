const uid = () => 'q' + Math.random().toString(36).slice(2, 8);
const q = (label, type, chips = [], multi = false) => ({ id: uid(), label, type, chips, multi, required: false });

export const TEMPLATES = {
  clinic: {
    name: 'Clinic / Hospital',
    questions: () => [
      q('How was your visit?', 'chips_text', ['Great', 'Worth it', 'Very good', 'Okay']),
      q('What did you visit us for?', 'chips_text', ['Back pain', 'Neck pain', 'Joint pain', 'Skin', 'Digestion', 'General checkup']),
      q('What did you like?', 'chips', ['Doctor explained well', 'Listened carefully', 'Clean clinic', 'Short waiting time', 'Helpful staff', 'Fair price'], true),
      q('Anything else you would like to add?', 'text'),
    ],
  },
  cafe: {
    name: 'Cafe / Restaurant',
    questions: () => [
      q('How was your experience?', 'chips_text', ['Great', 'Worth it', 'Very good', 'Okay']),
      q('What did you have?', 'chips_text', ['Coffee', 'Pizza', 'Pasta', 'Dessert']),
      q('What did you like?', 'chips', ['Taste', 'Ambience', 'Service', 'Price', 'Cleanliness', 'Quick service'], true),
      q('Anything we could improve?', 'text'),
    ],
  },
  school: {
    name: 'School / Coaching',
    questions: () => [
      q('Who are you?', 'chips', ['Parent', 'Student', 'Alumni']),
      q('How has your experience been?', 'chips_text', ['Great', 'Very good', 'Satisfied', 'Okay']),
      q('What do you like most?', 'chips', ['Teachers', 'Discipline', 'Activities', 'Facilities', 'Results', 'Safety'], true),
      q('Anything we could improve?', 'text'),
    ],
  },
  hotel: {
    name: 'Hotel / Stay',
    questions: () => [
      q('How was your stay?', 'chips_text', ['Great', 'Very good', 'Value for money', 'Okay']),
      q('What was the trip for?', 'chips', ['Family trip', 'Business', 'Couple', 'Friends']),
      q('What did you like?', 'chips', ['Room', 'Staff', 'Cleanliness', 'Location', 'Food', 'Easy check-in'], true),
      q('Anything we could improve?', 'text'),
    ],
  },
  salon: {
    name: 'Salon / Spa',
    questions: () => [
      q('How was your experience?', 'chips_text', ['Great', 'Very good', 'Worth it', 'Okay']),
      q('Which service did you take?', 'chips_text', ['Haircut', 'Facial', 'Hair spa', 'Makeup']),
      q('What did you like?', 'chips', ['Staff', 'Hygiene', 'Result', 'Price', 'Started on time', 'Ambience'], true),
      q('Anything we could improve?', 'text'),
    ],
  },
  generic: {
    name: 'Other business',
    questions: () => [
      q('How was your experience?', 'chips_text', ['Great', 'Very good', 'Worth it', 'Okay']),
      q('What did you like?', 'chips', ['Service', 'Quality', 'Price', 'Staff'], true),
      q('Anything we could improve?', 'text'),
    ],
  },
};

export const TYPE_OPTIONS = Object.entries(TEMPLATES).map(([value, t]) => ({ value, label: t.name }));
