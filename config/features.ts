export interface FeatureFlags {
  enableSellCar: boolean;
  enableRental: boolean;
  enableVipDelivery: boolean;
  enableWhatsApp: boolean;
  enablePhoneContact: boolean;
  enableEmailContact: boolean;
  enableFinancing: boolean;
}

export const featureFlags: FeatureFlags = {
  enableSellCar: true,
  enableRental: true,
  enableVipDelivery: true,
  enableWhatsApp: true,
  enablePhoneContact: true,
  enableEmailContact: true,
  enableFinancing: false,
};
