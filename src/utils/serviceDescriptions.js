export const serviceDescriptions = {
  CASH_DEPOSIT: {
    introduction: "Welcome to the Cash Deposit service. This service helps you schedule a cash deposit pickup from your location.",
    requirements: [
      "You'll need to select your bank account where you want to deposit the money",
      "Provide your pickup address where our agent will collect the cash",
      "Choose a convenient date and time slot for the pickup",
      "Specify the amount you want to deposit"
    ],
    process: [
      "Once you submit the form, you'll receive an OTP for verification",
      "After verification, a confirmation will be sent to your registered mobile number",
      "Our agent will arrive at the specified time to collect the cash",
      "You'll receive a digital receipt after successful deposit"
    ],
    notes: "Please ensure someone is available at the pickup location during the selected time slot. Keep the exact amount ready for a smooth transaction."
  },

  CASH_WITHDRAWAL: {
    introduction: "Welcome to the Cash Withdrawal service. This service helps you schedule cash delivery to your location.",
    requirements: [
      "Select the bank account from which you want to withdraw money",
      "Provide the delivery address where you want to receive the cash",
      "Choose a convenient date and time slot for the delivery",
      "Specify the amount you want to withdraw"
    ],
    process: [
      "After submitting the form, you'll receive an OTP for verification",
      "Once verified, a confirmation will be sent to your registered number",
      "Our agent will deliver the cash at the specified time",
      "You'll need to show your ID proof at the time of delivery"
    ],
    notes: "Please ensure someone is available at the delivery location during the selected time slot. Keep your ID proof ready for verification."
  },

  NEW_ACCOUNT: {
    introduction: "Welcome to the New Account Opening service. This service helps you schedule a bank visit for account opening.",
    requirements: [
      "You'll need to provide your personal information",
      "Select the bank where you want to open an account",
      "Choose the type of account you want",
      "Schedule a convenient date and time for the bank visit"
    ],
    process: [
      "Fill in your personal details and select bank preferences",
      "Choose a convenient visit date and time",
      "Verify through OTP",
      "Our representative will meet you at the bank with necessary documentation",
      "Complete the account opening process at the bank"
    ],
    notes: "Please carry valid ID proof and address proof documents during the bank visit. Original documents are required for verification."
  },

  DOCUMENT_COLLECTION: {
    introduction: "Welcome to the Document Collection service. This service helps you schedule document pickup from your location.",
    requirements: [
      "Select your bank account",
      "Choose the type of documents you need to submit",
      "Provide your collection address",
      "Schedule a convenient date and time for pickup"
    ],
    process: [
      "Fill in the required details",
      "Verify through OTP",
      "Our agent will collect the documents from your location",
      "You'll receive a confirmation receipt"
    ],
    notes: "Please keep all documents ready and properly organized before the pickup time."
  },

  DOCUMENT_DELIVERY: {
    introduction: "Welcome to the Document Delivery service. This service helps you receive bank documents at your location.",
    requirements: [
      "Select your bank account",
      "Choose the type of documents you need",
      "Provide your delivery address",
      "Schedule a convenient date and time for delivery"
    ],
    process: [
      "Fill in the required details",
      "Verify through OTP",
      "Our agent will deliver the documents to your location",
      "You'll need to sign an acknowledgment receipt"
    ],
    notes: "Please ensure someone is available at the delivery address to receive and sign for the documents."
  },

  LIFE_CERTIFICATE: {
    introduction: "Welcome to the Life Certificate service. This service helps you schedule a life certificate verification at your location.",
    requirements: [
      "Provide your pension account number",
      "Select your bank",
      "Schedule a convenient date and time for verification",
      "Provide the address where you want the verification to be done"
    ],
    process: [
      "Fill in your pension details",
      "Choose a convenient verification time",
      "Verify through OTP",
      "Our representative will visit your location",
      "Complete the life certificate verification process"
    ],
    notes: "Please keep your pension documents and ID proof ready for verification. Our representative will bring the necessary equipment for biometric verification."
  },

  ONLINE_ASSISTANCE: {
    introduction: "Welcome to Online Assistance service. This service helps you schedule online banking support through video or phone call.",
    requirements: [
      "Select your bank",
      "Choose your preferred date and time",
      "Select assistance mode - Phone call or Video call",
      "Verify your contact details"
    ],
    process: [
      "Select your preferred bank",
      "Schedule a convenient time",
      "Choose between phone or video assistance",
      "Verify through OTP",
      "Our banking expert will contact you at the scheduled time"
    ],
    notes: "Please ensure you have a stable internet connection for video calls. Keep your banking details ready for quick assistance."
  }
};

export const getServiceExplanation = (serviceType) => {
  const service = serviceDescriptions[serviceType];
  if (!service) return "";

  return `${service.introduction} 
    Here's what you need to do: ${service.requirements.join(". ")}
    
    Process: ${service.process.join(". ")}
    
    Important: ${service.notes}`;
};
