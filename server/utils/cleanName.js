
export default function cleanName(value) {
    return value
        .replace(/[^\p{L} ]+/gu, '')         // Remove emojis, numbers, symbols
        .replace(/\s+/g, ' ')                // Collapse multiple spaces
        .trim()                              // Remove leading/trailing spaces
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize each word
        .join(' ');
}
