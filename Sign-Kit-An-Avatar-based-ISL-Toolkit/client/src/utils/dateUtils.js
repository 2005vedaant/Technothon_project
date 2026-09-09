/**
 * Formats a UTC date string or Date object to Indian Standard Time (IST / Asia/Kolkata).
 * Example output: "09 Sep 2026, 02:28 PM IST"
 *
 * @param {string | Date | number | null | undefined} dateInput - The ISO/UTC date string or Date object
 * @returns {string} - Formatted IST date string or 'N/A' if invalid/missing
 */
export function formatToIST(dateInput) {
  if (!dateInput) return 'N/A';
  try {
    const dateObj = new Date(dateInput);
    if (isNaN(dateObj.getTime())) {
      return 'N/A';
    }
    return dateObj.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZoneName: 'short',
    });
  } catch (error) {
    console.error('[formatToIST] Formatting error:', error);
    return 'N/A';
  }
}

export default formatToIST;
