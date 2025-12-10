import { format } from "date-fns";
import { id } from "date-fns/locale";
import { enUS } from "date-fns/locale";

export const ymdToIdDate = (
    dateString: string | null | undefined,
    withTime: boolean = false,
    timeOnly: boolean = false,
    withDay: boolean = false,
) => {
    if (!dateString) return null;
    const parsedDate = new Date(dateString as string);

    if (timeOnly) {
        return format(parsedDate, "HH:mm", { locale: id });
    }

    const formatString = withDay
        ? withTime
            ? "EEEE, d MMMM yyyy - HH:mm"
            : "EEEE, d MMMM yyyy"
        : withTime
          ? "d MMMM yyyy - HH:mm"
          : "d MMMM yyyy";

    return format(parsedDate, formatString, { locale: id });
};

export const ymdToUsDate = (
    dateString: string | null | undefined,
    withTime: boolean = false,
    timeOnly: boolean = false,
    withDay: boolean = false,
) => {
    if (!dateString) return null;
    const parsedDate = new Date(dateString as string);

    if (timeOnly) {
        return format(parsedDate, "HH:mm", { locale: enUS });
    }

    const formatString = withDay
        ? withTime
            ? "EEEE, MMMM d, yyyy - HH:mm"
            : "EEEE, MMMM d, yyyy"
        : withTime
          ? "MMMM d, yyyy - HH:mm"
          : "MMMM d, yyyy";

    return format(parsedDate, formatString, { locale: enUS });
};

export const floatToIdCurrency = (
    value: number | string,
    withSymbol: boolean = true,
    withDecimal: boolean = false,
) => {
    const numberValue = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(numberValue)) return "0";

    const formattedValue = numberValue.toLocaleString("id-ID", {
        style: "decimal",
        minimumFractionDigits: withDecimal ? 2 : 0,
        maximumFractionDigits: withDecimal ? 2 : 0,
    });

    return withSymbol ? `Rp${formattedValue}` : formattedValue;
};

export const inputDebounce = (
    callback: (...args: any[]) => void,
    delay: number = 1000,
) => {
    let timer: ReturnType<typeof setTimeout>;

    return (...args: any[]) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            callback(...args);
        }, delay);
    };
};

export const handleElipsisText = (
    text: string,
    maxLength: number,
    ellipsis: string = "…",
) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + ellipsis;
};

export const generateStringRand = (
    length: number,
    withUppercase: boolean = false,
    withSymbols: boolean = false,
    withNumbers: boolean = false,
) => {
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*()_+[]{}|;:,.<>?";
    let characters = "";
    characters += lowercase;
    if (withUppercase) characters += uppercase;
    if (withNumbers) characters += numbers;
    if (withSymbols) characters += symbols;

    if (characters.length === 0) return "";

    let result = "";
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters[randomIndex];
    }
    return result;
};

export const humanRole = (role: string) => {
    switch (role) {
        case "admin":
            return "Admin";
        case "cashier":
            return "Kasir";
        default:
            return role;
    }
};

export const humanCustType = (type: string) => {
    switch (type) {
        case "member":
            return "Member";
        case "reseller":
            return "Reseller";
        default:
            return "Umum";
    }
};
