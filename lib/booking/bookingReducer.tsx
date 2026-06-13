import { BookingAction, BookingState, Step } from "@/data/booking";
import { initialState } from "./initialState";

export function bookingReducer(state: BookingState, action: BookingAction): BookingState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, step: action.payload };
    case 'SELECT_CAR':
      return { ...state, selectedCar: action.payload };
    case 'SET_LOCATION':
      return { ...state, location: action.payload.value, locationLabel: action.payload.label };
    case 'SET_DATES':
      return { ...state, dateFrom: action.payload.dateFrom, dateTo: action.payload.dateTo };
    case 'SET_TIME':
      return { ...state, pickupTime: action.payload };
    case 'NEXT':
      return { ...state, step: Math.min(3, state.step + 1) as Step };
    case 'PREV':
      return { ...state, step: Math.max(0, state.step - 1) as Step };
    case 'RESET':
      return { ...initialState };
    default:
      return state;
  }
}