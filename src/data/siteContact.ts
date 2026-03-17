export const siteContact = {
  email: 'galeria.cutare@gmail.com',
  phone: '0724 394 014',
};

export function getPhoneTel(phone = siteContact.phone): string {
  return phone.replace(/\D/g, '');
}
