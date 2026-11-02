"use strict";

const passwordInput = document.querySelector("#password");
const toggleVisibilityButton = document.querySelector("#toggle-visibility");
const strengthRating = document.querySelector("#strength-rating");
const strengthTrack = document.querySelector("#strength-track");
const strengthFill = document.querySelector("#strength-fill");
const checkCount = document.querySelector("#check-count");
const checklist = document.querySelector("#checklist");
const generateButton = document.querySelector("#generate-password");
const generatedResult = document.querySelector("#generated-result");
const generatedPassword = document.querySelector("#generated-password");
const copyButton = document.querySelector("#copy-password");

const ratings = [
  { label: "Very weak", color: "#c45e51" },
  { label: "Weak", color: "#d88651" },
  { label: "Fair", color: "#d1a747" },
  { label: "Strong", color: "#77976b" },
  { label: "Very strong", color: "#3d7955" }
];

const commonPasswords = new Set([
  "123456", "123456789", "12345678", "12345", "1234567890",
  "password", "password1", "password123", "qwerty", "qwerty123",
  "abc123", "111111", "123123", "iloveyou", "admin", "letmein",
  "welcome", "monkey", "dragon", "football", "sunshine"
]);

function hasRepeatedSequence(password) {
  return /(.)\1{2,}/u.test(password) ||
    /(?:0123|1234|2345|3456|4567|5678|6789|9876|8765|7654|6543|5432|4321|abcd|bcde|cdef|qwer|asdf|zxcv)/iu.test(password);
}

function evaluatePassword(password) {
  const hasLower = /[a-z]/u.test(password);
  const hasUpper = /[A-Z]/u.test(password);
  const hasNumber = /\d/u.test(password);
  const hasSymbol = /[^A-Za-z0-9]/u.test(password);
  const distinctRatio = password.length === 0
    ? 0
    : new Set(password).size / Array.from(password).length;
  const normalized = password.toLocaleLowerCase().trim();
  const common = commonPasswords.has(normalized) ||
    /^(?:password|qwerty|letmein|welcome|admin|iloveyou)/iu.test(normalized);
  const repeated = hasRepeatedSequence(password);
  const varietyCount = [hasLower, hasUpper, hasNumber, hasSymbol].filter(Boolean).length;

  const checks = {
    length: Array.from(password).length >= 12,
    long: Array.from(password).length >= 16,
    variety: varietyCount >= 3,
    unique: distinctRatio >= 0.6 && !repeated,
    uncommon: password.length > 0 && !common && !repeated
  };

  let score = 0;
  const length = Array.from(password).length;
  if (length >= 8) score += 1;
  if (length >= 12) score += 1;
  if (length >= 16) score += 1;
  if (varietyCount >= 2) score += 1;
  if (varietyCount >= 3) score += 1;
  if (distinctRatio >= 0.75) score += 1;
  if (common) score = Math.min(score, 1);
  if (repeated) score = Math.max(0, score - 2);
  if (length === 0) score = 0;
  score = Math.min(4, score);

  return { checks, score };
}

function updateStrength() {
  const password = passwordInput.value;
  const { checks, score } = evaluatePassword(password);
  const passedChecks = Object.values(checks).filter(Boolean).length;
  const rating = password.length === 0 ? null : ratings[score];

  strengthRating.textContent = rating ? rating.label : "Not checked";
  strengthRating.style.color = rating ? rating.color : "";
  strengthFill.style.width = password.length === 0 ? "0%" : `${Math.max(8, score * 25)}%`;
  strengthFill.style.backgroundColor = rating ? rating.color : "";
  strengthTrack.setAttribute("aria-valuenow", String(password.length === 0 ? 0 : score));
  strengthTrack.setAttribute("aria-valuetext", rating ? rating.label : "Not checked");
  checkCount.textContent = `${passedChecks} of 5`;

  for (const item of checklist.querySelectorAll("li")) {
    item.classList.toggle("passed", checks[item.dataset.check]);
  }
}

function randomIndex(maximum) {
  const range = Math.floor(256 / maximum) * maximum;
  const value = new Uint8Array(1);
  do {
    crypto.getRandomValues(value);
  } while (value[0] >= range);
  return value[0] % maximum;
}

function secureShuffle(characters) {
  for (let index = characters.length - 1; index > 0; index -= 1) {
    const swapIndex = randomIndex(index + 1);
    [characters[index], characters[swapIndex]] = [characters[swapIndex], characters[index]];
  }
  return characters;
}

function generateSecurePassword() {
  if (!globalThis.crypto || typeof crypto.getRandomValues !== "function") {
    throw new Error("Secure random number generation is not available in this browser.");
  }

  const groups = [
    "abcdefghijkmnopqrstuvwxyz",
    "ABCDEFGHJKLMNPQRSTUVWXYZ",
    "23456789",
    "!@#$%^&*()-_=+[]{}?"
  ];
  const allCharacters = groups.join("");
  const characters = groups.map((group) => group[randomIndex(group.length)]);

  while (characters.length < 20) {
    characters.push(allCharacters[randomIndex(allCharacters.length)]);
  }

  return secureShuffle(characters).join("");
}

passwordInput.addEventListener("input", updateStrength);

toggleVisibilityButton.addEventListener("click", () => {
  const isVisible = passwordInput.type === "text";
  passwordInput.type = isVisible ? "password" : "text";
  toggleVisibilityButton.textContent = isVisible ? "Show" : "Hide";
  toggleVisibilityButton.setAttribute("aria-label", isVisible ? "Show password" : "Hide password");
  toggleVisibilityButton.setAttribute("aria-pressed", String(!isVisible));
});

generateButton.addEventListener("click", () => {
  try {
    const suggestion = generateSecurePassword();
    generatedPassword.textContent = suggestion;
    generatedResult.hidden = false;
    copyButton.textContent = "Copy";
  } catch (error) {
    generatedPassword.textContent = error.message;
    generatedResult.hidden = false;
    copyButton.textContent = "Unavailable";
    copyButton.disabled = true;
  }
});

copyButton.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(generatedPassword.textContent);
    copyButton.textContent = "Copied";
  } catch {
    copyButton.textContent = "Copy unavailable";
  }
});

updateStrength();
