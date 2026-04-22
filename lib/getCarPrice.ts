import { Car } from "@/data/cars";

export function getCarPrice(car: Car, type: "rent" | "sale") {
  if (type === "sale") {
    return {
      main: car.pricing.total,
      secondary: null,
    };
  }

  return {
    main: car.pricing.daily,
    secondary: car.pricing.weekly
      ? `${car.pricing.weekly}/week`
      : null,
  };
}