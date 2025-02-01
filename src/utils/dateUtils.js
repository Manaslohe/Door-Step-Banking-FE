export const formatDateForBackend = (dateString) => {
  if (!dateString) return '';
  
  try {
    // Remove any existing formatting
    const cleanDate = dateString.replace(/[^\d-]/g, '');
    
    // Check if date is valid
    const date = new Date(cleanDate);
    if (isNaN(date.getTime())) return '';
    
    // Format as YYYY-MM-DD for backend
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    
    return `${yyyy}-${mm}-${dd}`;
  } catch (error) {
    console.error('Date formatting error:', error);
    return '';
  }
};
