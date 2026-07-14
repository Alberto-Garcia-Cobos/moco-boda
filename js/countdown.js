const weddingDate = new Date(2027, 4, 15, 12, 0, 0).getTime();

const countdownDays = document.querySelectorAll(
  "[data-countdown-days]"
);

const countdownHours = document.querySelectorAll(
  "[data-countdown-hours]"
);

const countdownMinutes = document.querySelectorAll(
  "[data-countdown-minutes]"
);

function updateCountdown() {
  const now = new Date().getTime();
  const distance = weddingDate - now;

  if (distance < 0) return;

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((distance / (1000 * 60)) % 60);

  const daysText = String(days).padStart(3, "0");
  const hoursText = String(hours).padStart(2, "0");
  const minutesText = String(minutes).padStart(2, "0");

  countdownDays.forEach((node) => {
    node.textContent = daysText;
  });

  countdownHours.forEach((node) => {
    node.textContent = hoursText;
  });

  countdownMinutes.forEach((node) => {
    node.textContent = minutesText;
  });
}

updateCountdown();
setInterval(updateCountdown, 1000 * 30);
