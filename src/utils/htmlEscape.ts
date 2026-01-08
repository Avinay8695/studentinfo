/**
 * Escape HTML special characters to prevent XSS attacks.
 * Use this function when interpolating user data into HTML templates.
 */
export function escapeHtml(text: string | null | undefined): string {
  if (text === null || text === undefined) return '';
  
  const str = String(text);
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  
  return str.replace(/[&<>"']/g, (char) => htmlEscapes[char] || char);
}
