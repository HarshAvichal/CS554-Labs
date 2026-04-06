export const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const isValidPhone = (phone) => {
  return /^\d{3}-\d{3}-\d{4}$/.test(phone);
};

export const isValidDate = (str) => {
  if (typeof str !== 'string') return false;
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(str)) return false;
  const [mm, dd, yyyy] = str.split('/').map(Number);
  const d = new Date(yyyy, mm - 1, dd);
  return (
    d.getFullYear() === yyyy &&
    d.getMonth() === mm - 1 &&
    d.getDate() === dd
  );
};

export const parseDate = (str) => {
  const [mm, dd, yyyy] = str.split('/').map(Number);
  return new Date(yyyy, mm - 1, dd);
};

export const calcAge = (dobStr) => {
  const dob = parseDate(dobStr);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
};

export const isValidObjectId = (id) => {
  return typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);
};
