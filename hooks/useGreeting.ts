import { useState, useEffect } from 'react';

function getGreetingString(): string {
  const hour = new Date().getHours();
  if (hour >= 5  && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  if (hour >= 17 && hour < 21) return 'Good evening';
  return 'Good night';
}

export function useGreeting(): string {
  const [greeting, setGreeting] = useState(getGreetingString());

  useEffect(() => {
    const interval = setInterval(() => {
      setGreeting(getGreetingString());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return greeting;
}
