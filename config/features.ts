export interface FeatureFlags {
  enableSellCar: boolean;
  enableVipDelivery: boolean;
  enableWhatsApp: boolean;
  enablePhoneContact: boolean;
  enableEmailContact: boolean;
}

export const featureFlags: FeatureFlags = {
  enableSellCar: true,
  enableVipDelivery: true,
  enableWhatsApp: true,
  enablePhoneContact: true,
  enableEmailContact: true,
};
