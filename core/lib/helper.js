const ApiResponse = require("./response");
const moment = require("moment");
const lodash = require("lodash");
const { phoneLength } = require("../../constants/chat-bot");
const { InternalError } = require("../errors/errors");
/**
 * Get leading zero padded digits
 * @param num
 * @param places
 * @returns {string}
 */
function zeroPad(num, places = 2) {
  return String(num).padStart(places, "0");
}

const isNullOrUndefined = (value) => {
  return typeof value === "undefined" || value === null;
};

const isNullOrEmpty = (value) => {
  return isNullOrUndefined(value) || value === "";
};

function equalsIgnoreCase(str1, str2) {
  return str1 && str2 && str1.toUpperCase() === str2.toUpperCase();
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const extractKeyValuePairs = (inputString) => {
  const parts = inputString.split(/[_-]/);
  const keyValuePairs = {};

  for (let i = 0; i < parts.length; i += 2) {
    const key = parts[i];
    const value = parts[i + 1];
    keyValuePairs[key] = value;
  }

  return keyValuePairs;
};
const emptyRequestHandler = async (req, res, next) => {
  res.status(200).json(new ApiResponse());
};

const isDebugEnabled = () => {
  const localEnvs = ["dev", "development", "local", null, undefined];
  return (
    localEnvs.includes(process.env.ENV) ||
    localEnvs.includes(process.env.NODE_ENV) ||
    process.env.DEBUG === "true"
  );
};

const optimalFutureStartTime = (currentTime) => {
  const startTime = moment.utc(currentTime);
  if (startTime.format("mm") >= 30) {
    startTime.add(1, "hour").set({ minutes: "00", seconds: "00" });
  } else {
    startTime.set({ minutes: "30", seconds: "00" });
  }
  return startTime;
};

const addParameterInUrl = (url, obj) => {
  let inputUrl = new URL(url);
  lodash.forEach(obj, function (value, key) {
    inputUrl.searchParams.append(key, value);
  });
  return inputUrl.href;
};
const getUtmUpdate = (data) => {
  let { utmSource } = data || {};
  if (!utmSource) return "others";
  // Convert input to lowercase to make it case insensitive
  const normalizedSource = utmSource.toLowerCase();

  switch (normalizedSource) {
    case "affiliate":
      return "Affiliate";
    case "blank":
      return "Others";
    case "blog":
    case "community":
    case "direct":
      return "Organic";
    case "dsa":
    case "fb":
    case "partial leads":
    case "social":
    case "tik tok":
    case "pinterest":
    case "twitter":
      return "Paid";
    case "fb-retainiq":
    case "fb-retention":
    case "google-retention":
    case "retention":
    case "retention calling":
    case "social-retention":
      return "Retention";
    case "google":
      return "Paid";
    case "sales-referral":
      return "Sales Referral";
    case "student-referral":
      return "Student Referral";
    case "teacher referral":
      return "Teacher Referral";
    case "others":
    case "others-fb":
    case "other-referral":
      return "Others";
    case "google-app":
    case "projectx":
    case "fb-app":
      return "app-projectx";
    default:
      return "Others";
  }
};
const encodeData = (jsonObj) => {
  try {
    const jsonString = JSON.stringify(jsonObj);
    const encodedString = Buffer.from(jsonString).toString("base64");
    return encodedString;
  } catch (error) {
    throw new InternalError(`Error in encodeUrl: ${error.message}`);
  }
};

function getDialCodeFromPhoneNumber(phoneNumber, countries) {
  const matchedCountries = [];
  for (let country of countries) {
    if (!country?.dial_code || typeof country?.dial_code !== "string") continue;
    let dialCode = country?.dial_code.slice(1);
    if (phoneNumber?.startsWith(dialCode)) {
      const phone = phoneNumber?.slice(dialCode?.length);
      let phoneLengthData = phoneLength[country?.short_code];
      let bestMatch = 0;
      if (
        (phoneLengthData && phoneLengthData?.length && phoneLengthData?.length === phone?.length) ||
        (!phoneLengthData?.length &&
          phoneLengthData?.minLength <= phoneLengthData?.length &&
          phoneLengthData?.maxLength >= phoneLengthData?.length)
      )
        bestMatch = 1;
      matchedCountries.push({
        phone,
        bestMatch,
        country,
      });
    }
  }
  matchedCountries.sort((a, b) => b.bestMatch - a.bestMatch);
  return matchedCountries;
}

function isValidEmail(email) {
  if (typeof email !== "string") return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email.trim());
}

function replaceTemplate(template, values) {
  return template.replace(/{{(.*?)}}/g, (_, key) => {
    return key in values ? values[key] : "";
  });
}

module.exports = {
  zeroPad,
  isNullOrUndefined,
  isNullOrEmpty,
  equalsIgnoreCase,
  sleep,
  emptyRequestHandler,
  isDebugEnabled,
  optimalFutureStartTime,
  extractKeyValuePairs,
  addParameterInUrl,
  getUtmUpdate,
  getDialCodeFromPhoneNumber,
  encodeData,
  isValidEmail,
  replaceTemplate,
};
