export function formatTime(iso: string) {
    try {
        const d = new Date(iso);
        const h = d.getHours();
        const m = d.getMinutes().toString().padStart(2, "0");
        const ampm = h >= 12 ? "PM" : "AM";
        const hour12 = ((h + 11) % 12) + 1;
        return `${hour12}:${m} ${ampm}`;
    } catch {
        return "";
    }
}
