export const text_to_dark_color = (text) => {
  let hash = 0;
  if (text.length === 0) return hash;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    let value = (hash >> (i * 8)) % 200;
    color += ('00' + value.toString(16)).substr(-2);
  }
  return color;
}
