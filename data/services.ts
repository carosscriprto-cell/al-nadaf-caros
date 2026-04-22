// services.ts
import { Car, DollarSign, Tag, Truck, Search, MessageCircle, LucideProps } from 'lucide-react';
import { ForwardRefExoticComponent } from 'react';

export interface ServiceItem {
  icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>; 
  titleKey: string;        
  descriptionKey: string;
  href: string;
  color: string;
}

export const services: ServiceItem[] = [
  {
    icon: Car,
    titleKey: 'services.rentals.title',
    descriptionKey: 'services.rentals.description',
    href: '/rental',
    color: 'bg-accent',
  },
  {
    icon: DollarSign,
    titleKey: 'services.sales.title',
    descriptionKey: 'services.sales.description',
    href: '/sales',
    color: 'bg-accent',
  },
  {
    icon: Truck,
    titleKey: 'services.delivery.title',
    descriptionKey: 'services.delivery.description',
    href: '/delivery',
    color: 'bg-accent',
  },
  {
    icon: MessageCircle,
    titleKey: 'services.support.title',
    descriptionKey: 'services.support.description',
    href: '/support',
    color: 'bg-accent',
  },
  {
    icon: Tag,
    titleKey: 'services.sellYourCar.title',
    descriptionKey: 'services.sellYourCar.description',
    href: '/sell',
    color: 'bg-accent',
  },
  {
    icon: Search,
    titleKey: 'services.inspection.title',
    descriptionKey: 'services.inspection.description',
    href: '/inspection',
    color: 'bg-accent',
  },
];