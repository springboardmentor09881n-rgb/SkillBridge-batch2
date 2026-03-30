const isSameDay = (left, right) =>
    left.getFullYear() === right.getFullYear()
    && left.getMonth() === right.getMonth()
    && left.getDate() === right.getDate();

const getStartOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const formatChatDateDivider = (value) => {
    if (!value) return "";

    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    const now = new Date();
    if (isSameDay(date, now)) {
        return "Today";
    }

    const yesterday = getStartOfDay(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (isSameDay(date, yesterday)) {
        return "Yesterday";
    }

    return date.toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" });
};

export const formatMessageTime = (value) => {
    if (!value) return "";

    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export const formatChatTimestamp = (value) => {
    if (!value) return "";

    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    const now = new Date();
    if (isSameDay(date, now)) {
        return formatMessageTime(date);
    }

    const yesterday = getStartOfDay(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (isSameDay(date, yesterday)) {
        return "Yesterday";
    }

    return date.toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" });
};
