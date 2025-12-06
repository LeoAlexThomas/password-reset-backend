export const frontendBaseUrl = "https://adorable-chebakia-4c15a9.netlify.app";

export const getRandomNumber = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
