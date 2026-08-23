function normalizeTitle(title) {
    return title.toLowerCase()
        .replace(/\.zip$|\.adf$|\.png$/g, '')
        .replace(/\s*\(.*?\)\s*/g, '')
        .replace(/\s*\[.*?\]\s*/g, '')
        .replace(/, the/g, '')
        .replace(/^the /g, '')
        .replace(/[^a-z0-9]/g, '');
}
console.log(normalizeTitle("Addams Family, The (Europe).png"));
console.log(normalizeTitle("Addams Family.zip"));
console.log(normalizeTitle("The Addams Family.zip"));
