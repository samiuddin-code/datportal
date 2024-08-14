import { useState, useEffect } from "react";

const useLocalStorage = <T = any>(key: string, defaultValue: T) => {
  const [value, setValue] = useState(() => {
    let currentValue;

    try {
      currentValue = JSON.parse(localStorage.getItem(key) || String(defaultValue));
    } catch (error) {
      currentValue = defaultValue;
    }

    return currentValue
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [value, key]);

  return [value, setValue] as [T, React.Dispatch<React.SetStateAction<T>>]
};

export default useLocalStorage;
