import { format } from 'date-fns';

// Function to format the date for display
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return format(date, 'MMMM dd, yyyy');
};

// Function to truncate the content for excerpt
export const truncateContent = (content, maxLength = 100) => {
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength) + '...';
};

// Function to generate a slug from the title
export const generateSlug = (title) => {
  return title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
};