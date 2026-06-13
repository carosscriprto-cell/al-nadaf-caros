import { BookingState } from "@/data/booking";

export const initialState: BookingState = {
  step: 0,
  selectedCar: null,
  location: '',
  locationLabel: '',
  dateFrom: '',
  dateTo: '',
  pickupTime: '10:00',
};