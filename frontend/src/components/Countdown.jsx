import { useEffect, useState } from "react";

export default function Countdown() {
  const targetDate = new Date("2026-01-01T00:00:00").getTime();
  const [timeLeft, setTimeLeft] = useState({});

  const calculateTimeLeft = () => {
    const now = new Date().getTime();
    const difference = targetDate - now;

    if (difference <= 0) {
      return {
        days: "00",
        hours: "00",
        minutes: "00",
        seconds: "00",
        finished: true,
      };
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((difference / 1000 / 60) % 60);
    const seconds = Math.floor((difference / 1000) % 60);

    return {
      days: String(days).padStart(2, "0"),
      hours: String(hours).padStart(2, "0"),
      minutes: String(minutes).padStart(2, "0"),
      seconds: String(seconds).padStart(2, "0"),
      finished: false,
    };
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="text-center my-10">
      <h2 className="text-3xl font-bold mb-4">Résultats disponibles dans :</h2>

      {!timeLeft.finished ? (
        <div className="flex justify-center gap-4 text-white text-3xl font-bold">
          <div className="bg-green-700 px-4 py-3 rounded-lg shadow-lg">
            {timeLeft.days} <span className="text-sm font-normal">jours</span>
          </div>
          <div className="bg-yellow-500 px-4 py-3 rounded-lg shadow-lg">
            {timeLeft.hours} <span className="text-sm font-normal">h</span>
          </div>
          <div className="bg-red-600 px-4 py-3 rounded-lg shadow-lg">
            {timeLeft.minutes} <span className="text-sm font-normal">min</span>
          </div>
          <div className="bg-black px-4 py-3 rounded-lg shadow-lg">
            {timeLeft.seconds} <span className="text-sm font-normal">s</span>
          </div>
        </div>
      ) : (
        <div className="text-green-600 text-4xl font-extrabold mt-6">
          🎉 Les résultats sont disponibles !
        </div>
      )}
    </div>
  );
}
