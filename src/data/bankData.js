export const linkedBankAccounts = [
  { 
    id: '1',
    bank: 'SBI',
    fullName: 'State Bank of India',
    accountNo: 'XXXX1234',
    ifsc: 'SBIN0001234',
    type: 'Savings'
  },
  { 
    id: '2',
    bank: 'HDFC',
    fullName: 'HDFC Bank',
    accountNo: 'XXXX5678',
    ifsc: 'HDFC0005678',
    type: 'Current'
  },
  { 
    id: '3',
    bank: 'ICICI',
    fullName: 'ICICI Bank',
    accountNo: 'XXXX9012',
    ifsc: 'ICIC0007012',
    type: 'Savings'
  }
];

export const standardTimeSlots = [
  "09:00 AM - 11:00 AM",
  "11:00 AM - 12:00 PM",
  "02:00 PM - 04:00 PM",
  "04:00 PM - 06:00 PM"
];

export const banksList = linkedBankAccounts.map(bank => ({
  id: bank.bank.toLowerCase(),
  name: bank.fullName
}));
