import { useState, useEffect } from "react";

interface CountdownTimerProps {
  targetDate?: string; // ISO date string for the target date and time
}

export default function CountdownTimer({ targetDate }: CountdownTimerProps) {
  // Calculates the delta between now and target date
  const calculateTimeLeft = () => {
    if (!targetDate) return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };

    const difference = new Date(targetDate).getTime() - new Date().getTime();
    const timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: difference <= 0 };

    if (difference > 0) {
      timeLeft["days"] = Math.floor(difference / (1000 * 60 * 60 * 24));
      timeLeft["hours"] = Math.floor((difference / (1000 * 60 * 60)) % 24);
      timeLeft["minutes"] = Math.floor((difference / 1000 / 60) % 60);
      timeLeft["seconds"] = Math.floor((difference / 1000) % 60);
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    // Cleans up the interval subscription on unmount
    return () => clearInterval(timer);
  }, [targetDate]);

  // Helper function to pad single digits with a leading zero
  const formatNumber = (num: number) => String(num).padStart(2, "0");

  if (timeLeft.isExpired) return null;

  return (
    <p>
      {timeLeft.days > 0 && <span>{timeLeft.days}d </span>}
      {timeLeft.hours > 0 && <span>{formatNumber(timeLeft.hours)}:</span>}
      <span>{formatNumber(timeLeft.minutes)}</span>:<span>{formatNumber(timeLeft.seconds)}</span>
    </p>
  );
}
