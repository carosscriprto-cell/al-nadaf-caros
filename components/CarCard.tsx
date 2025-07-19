import Image from 'next/image';
import Link from 'next/link';
import { Car, Star, Users, Zap, MapPin, Fuel } from 'lucide-react';
import type { Car as CarType } from '../data/cars';

interface CarCardProps {
  car: CarType;
  showDetailsLink?: boolean;
}

export default function CarCard({ car, showDetailsLink = true }: CarCardProps) {
  return (
    <div className="group relative bg-card rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-border hover:border-accent/50">
      {/* Car Image Container */}
      <div className="relative h-64 overflow-hidden">
        {car.image ? (
          <Image 
            src={car.image} 
            fill 
            alt={car.name} 
            className="object-cover object-center group-hover:scale-110 transition-transform duration-700" 
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center">
            <Car className="h-16 w-16 text-accent-foreground" />
          </div>
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Floating Rating Badge */}
        <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-md rounded-full px-3 py-1.5 border border-border/50">
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 text-accent fill-current" />
            <span className="text-foreground text-sm font-semibold">{car.rating}</span>
          </div>
        </div>

        {/* Availability Badge */}
        {!car.available && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-card rounded-lg px-4 py-2 border border-border">
              <span className="text-foreground font-semibold">Not Available</span>
            </div>
          </div>
        )}

        {/* Floating Info Section */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/95 to-background/80 backdrop-blur-md p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>{car.features.find(f => f.includes('Seats'))?.split(' ')[0] || '4'} Seats</span>
            </div>
            <div className="flex items-center space-x-2">
              <Fuel className="h-4 w-4" />
              <span>{car.features.find(f => f.includes('Electric')) ? 'Electric' : 'Petrol'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4" />
              <span>{car.features.find(f => f.includes('Automatic')) ? 'Auto' : 'Manual'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Car Info */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-foreground group-hover:text-accent transition-colors duration-300 mb-1">
              {car.name}
            </h3>
            <p className="text-muted-foreground text-sm mb-2">{car.class}</p>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>{car.location || 'Available Nationwide'}</span>
            </div>
          </div>
          <div className="text-right ml-4">
            <div className="text-2xl font-bold text-accent">
              ${car.price}
            </div>
            <div className="text-muted-foreground text-sm">per {car.per}</div>
          </div>
        </div>

        {/* Features Tags */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {car.features.slice(0, 3).map((feature, idx) => (
            <div key={idx} className="flex items-center space-x-1 text-muted-foreground text-xs bg-muted/50 px-2 py-1 rounded-full border border-border/50">
              {feature.includes('Seats') && <Users className="h-3 w-3" />}
              {feature.includes('Automatic') && <Zap className="h-3 w-3" />}
              {feature.includes('Electric') && <Zap className="h-3 w-3" />}
              {feature.includes('Manual') && <Zap className="h-3 w-3" />}
              {feature.includes('4WD') && <Zap className="h-3 w-3" />}
              {feature.includes('Autopilot') && <Zap className="h-3 w-3" />}
              {feature.includes('Sport') && <Zap className="h-3 w-3" />}
              {feature.includes('Premium') && <Zap className="h-3 w-3" />}
              {feature.includes('Luxury') && <Zap className="h-3 w-3" />}
              <span className="truncate max-w-16">{feature}</span>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          {showDetailsLink && (
            <Link
              href={`/fleet/${car.id}`}
              className="text-accent hover:text-accent/80 font-semibold text-sm transition-colors duration-200 flex items-center space-x-1 group/link"
            >
              <span>View Details</span>
              <span className="transform group-hover/link:translate-x-1 transition-transform duration-200">→</span>
            </Link>
          )}
          
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-muted-foreground">Available Now</span>
          </div>
        </div>
      </div>

      {/* Hover Effect Border */}
      <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-accent/20 transition-colors duration-500 pointer-events-none" />
    </div>
  );
} 