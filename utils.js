import {
    GENITIVE_MONTH_NAMES,
    SHORT_MONTH_NAMES,
    FULL_MONTH_NAMES,
    SHORT_DAY_NAMES
} from './constants.js';

// // Для "поиска" понедельника по номеру дня недели
export function getMonday(date) {
    const d = new Date(date);
    let day = d.getDay();
    if (day === 0) day = 7;
    d.setDate(d.getDate() - day + 1);
    d.setHours(0, 0, 0, 0);
    return d;
}

// Формат дд:мм:гггг
export function formatDateToYMD(dt) {
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const d = String(dt.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

// Сравнение по дате
export function isSameDate(d1, d2) {
    return (
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate()
    );
}

// Разборка времени в чч:мм
export function parseTime(t) {
    const [h, m] = t.split(':').map(Number);
    return [h, m];
}

// Сборка времени в чч:мм
export function formatTime(h, m) {
    return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
}

// Метод для корректного отображения даты
export function formatDateWithGenitive(dt) {
    const dnum = dt.getDate();
    const mgen = GENITIVE_MONTH_NAMES[dt.getMonth()];
    const yyyy = dt.getFullYear();
    return `${dnum} ${mgen} ${yyyy}`;
}

// Метод для склонения месяцев по род. падежу XDDD
export function getMonthGenitive(idx) {
    return GENITIVE_MONTH_NAMES[idx];
}

// Метод для коротких имен месяцев
export function getMonthShortName(idx) {
    return SHORT_MONTH_NAMES[idx];
}

// Метод для полных имен месяцев
export function getFullMonthName(idx) {
    return FULL_MONTH_NAMES[idx];
}

// Метод для коротких имен дней
// dayI: 0 = Вс, 1 = Пн и т.д.
export function getDayOfWeekShort(dayI) {
    return SHORT_DAY_NAMES[dayI];
}