export default function hyphenate(string) {
  return string
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .replace(/^ms-/, '-ms-')
}
