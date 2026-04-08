const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const isDateOnlyString = (value) =>
  typeof value === "string" && DATE_ONLY_PATTERN.test(value.trim());

export const toDateInputValue = (value) => {
  if (!value) {
    return "";
  }

  if (isDateOnlyString(value)) {
    return value.trim();
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const timezoneOffsetMs = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - timezoneOffsetMs).toISOString().slice(0, 10);
};

export const formatDateOnly = (
  value,
  locale = "es-CR",
  options = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  },
) => {
  if (!value) {
    return "Sin fecha";
  }

  if (isDateOnlyString(value)) {
    const [year, month, day] = value.trim().split("-").map(Number);
    const date = new Date(year, month - 1, day);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat(locale, options).format(date);
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return typeof value === "string" ? value : "Sin fecha";
  }

  return new Intl.DateTimeFormat(locale, options).format(date);
};
