import { useMemo, useState } from 'react';
import * as Select from '@radix-ui/react-select';
import * as Tabs from '@radix-ui/react-tabs';
import * as Dialog from '@radix-ui/react-dialog';
import {
  ArrowLeftRight,
  Car,
  ChevronDown,
  Fuel,
  SlidersHorizontal,
  Tag,
  Users,
  X,
  Check,
  Sparkles,
} from 'lucide-react';

export default function AdvancedCarsFilters() {
  const [listingType, setListingType] = useState<'rent' | 'sale'>('rent');

  const [brand, setBrand] = useState('all');
  const [category, setCategory] = useState('all');
  const [fuelType, setFuelType] = useState('all');
  const [transmission, setTransmission] = useState('all');
  const [seats, setSeats] = useState('all');
  const [sortBy, setSortBy] = useState('featured');

  const [price, setPrice] = useState(
    listingType === 'rent' ? 500 : 80000
  );

  const brands = ['BMW', 'Mercedes', 'Audi', 'Porsche', 'Lexus'];
  const categories = ['SUV', 'Sedan', 'Luxury', 'Sport'];
  const fuelTypes = ['Petrol', 'Hybrid', 'Electric', 'Diesel'];
  const transmissions = ['Automatic', 'Manual'];
  const seatsOptions = ['2', '4', '5', '7'];

  const maxPrice = listingType === 'rent' ? 500 : 80000;

  const activeFilters = useMemo(() => {
    const items = [];

    if (brand !== 'all') items.push({ label: brand, reset: () => setBrand('all') });
    if (category !== 'all') items.push({ label: category, reset: () => setCategory('all') });
    if (fuelType !== 'all') items.push({ label: fuelType, reset: () => setFuelType('all') });
    if (transmission !== 'all') items.push({ label: transmission, reset: () => setTransmission('all') });
    if (seats !== 'all') items.push({ label: `${seats} Seats`, reset: () => setSeats('all') });

    items.push({
      label:
        listingType === 'rent'
          ? `Up to $${price}/day`
          : `Up to $${price}`,
      reset: () => setPrice(maxPrice),
    });

    return items;
  }, [brand, category, fuelType, transmission, seats, price, listingType, maxPrice]);

  const clearFilters = () => {
    setBrand('all');
    setCategory('all');
    setFuelType('all');
    setTransmission('all');
    setSeats('all');
    setSortBy('featured');
    setPrice(listingType === 'rent' ? 500 : 80000);
  };

  const FiltersContent = () => (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <FilterSelect
          icon={<Car className="h-4 w-4" />}
          placeholder="Brand"
          value={brand}
          onValueChange={setBrand}
          options={brands}
          allLabel="All Brands"
        />

        <FilterSelect
          icon={<Tag className="h-4 w-4" />}
          placeholder="Category"
          value={category}
          onValueChange={setCategory}
          options={categories}
          allLabel="All Categories"
        />

        <FilterSelect
          icon={<Fuel className="h-4 w-4" />}
          placeholder="Fuel Type"
          value={fuelType}
          onValueChange={setFuelType}
          options={fuelTypes}
          allLabel="All Fuel Types"
        />

        <FilterSelect
          icon={<Users className="h-4 w-4" />}
          placeholder="Seats"
          value={seats}
          onValueChange={setSeats}
          options={seatsOptions}
          allLabel="Any Seats"
          formatOption={(value) => `${value} Seats`}
        />

        <FilterSelect
          icon={<Car className="h-4 w-4" />}
          placeholder="Transmission"
          value={transmission}
          onValueChange={setTransmission}
          options={transmissions}
          allLabel="All Transmissions"
        />

        <FilterSelect
          icon={<Sparkles className="h-4 w-4" />}
          placeholder="Sort By"
          value={sortBy}
          onValueChange={setSortBy}
          options={[
            'featured',
            'price-low',
            'price-high',
            'newest',
            'popular',
          ]}
          allLabel="Featured"
          formatOption={(value) => {
            switch (value) {
              case 'featured':
                return 'Featured';
              case 'price-low':
                return 'Price: Low to High';
              case 'price-high':
                return 'Price: High to Low';
              case 'newest':
                return 'Newest';
              case 'popular':
                return 'Most Popular';
              default:
                return value;
            }
          }}
        />
      </div>

      <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl">
        <div className="mb-3 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-white">Price Range</p>
            <p className="text-xs text-muted-foreground">
              {listingType === 'rent'
                ? `Maximum daily price: $${price}`
                : `Maximum vehicle price: $${price}`}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-background/60 px-4 py-2 text-sm font-semibold text-white">
            {listingType === 'rent' ? `$${price}/day` : `$${price}`}
          </div>
        </div>

        <input
          type="range"
          min={listingType === 'rent' ? 50 : 5000}
          max={maxPrice}
          step={listingType === 'rent' ? 10 : 1000}
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-primary"
        />

        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>{listingType === 'rent' ? '$50' : '$5,000'}</span>
          <span>{listingType === 'rent' ? '$500+' : '$80,000+'}</span>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {activeFilters.map((filter) => (
          <button
            key={filter.label}
            onClick={filter.reset}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-white transition hover:border-primary/40 hover:bg-primary/10"
          >
            {filter.label}
            <X className="h-3.5 w-3.5" />
          </button>
        ))}

        <button
          onClick={clearFilters}
          className="ml-auto inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/20"
        >
          <X className="h-4 w-4" />
          Clear Filters
        </button>
      </div>
    </>
  );

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-background/80 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
        <div className="border-b border-white/10 p-5 md:p-6">
          <div className="flex items-center gap-3 text-xl font-bold text-white">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <Car className="h-5 w-5" />
            </div>
            Find Your Perfect Car
          </div>
        </div>

        <Tabs.Root
          value={listingType}
          onValueChange={(value) => {
            setListingType(value as 'rent' | 'sale');
            clearFilters();
          }}
        >
          <div className="border-b border-white/10 px-5 py-5 md:px-6">
            <Tabs.List className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-2 backdrop-blur-xl">
              <Tabs.Trigger
                value="rent"
                className="flex-1 cursor-pointer rounded-xl px-5 py-3 text-sm font-semibold text-muted-foreground transition-all hover:bg-white/5 data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                For Rent
              </Tabs.Trigger>

              <button
                type="button"
                className="hidden h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-background/60 text-muted-foreground transition hover:bg-white/5 md:flex"
              >
                <ArrowLeftRight className="h-4 w-4" />
              </button>

              <Tabs.Trigger
                value="sale"
                className="flex-1 cursor-pointer rounded-xl px-5 py-3 text-sm font-semibold text-muted-foreground transition-all hover:bg-white/5 data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                For Sale
              </Tabs.Trigger>
            </Tabs.List>
          </div>

          <div className="hidden p-6 lg:block">
            <FiltersContent />
          </div>

          <div className="p-5 lg:hidden">
            <Dialog.Root>
              <Dialog.Trigger asChild>
                <button className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 font-medium text-white backdrop-blur-xl transition hover:border-primary/40 hover:bg-primary/10">
                  <SlidersHorizontal className="h-5 w-5" />
                  Open Filters
                </button>
              </Dialog.Trigger>

              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />

                <Dialog.Content className="fixed bottom-0 left-0 right-0 z-50 max-h-[88vh] overflow-y-auto rounded-t-[2rem] border border-white/10 bg-background p-6 shadow-2xl">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-white">Filters</h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Refine your search and find the perfect vehicle.
                      </p>
                    </div>

                    <Dialog.Close asChild>
                      <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-muted-foreground transition hover:bg-white/10">
                        <X className="h-5 w-5" />
                      </button>
                    </Dialog.Close>
                  </div>

                  <FiltersContent />

                  <Dialog.Close asChild>
                    <button className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-4 text-sm font-semibold text-white transition hover:scale-[1.01] hover:opacity-90">
                      <Check className="h-5 w-5" />
                      Apply Filters
                    </button>
                  </Dialog.Close>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          </div>
        </Tabs.Root>
      </div>
    </div>
  );
}

interface FilterSelectProps {
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  onValueChange: (value: string) => void;
  options: string[];
  allLabel: string;
  formatOption?: (value: string) => string;
}

function FilterSelect({
  icon,
  placeholder,
  value,
  onValueChange,
  options,
  allLabel,
  formatOption,
}: FilterSelectProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-white/90">
        {placeholder}
      </label>

      <Select.Root value={value} onValueChange={onValueChange}>
        <Select.Trigger
          className="group flex h-14 w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-left text-sm text-white shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur-xl outline-none transition-all hover:border-primary/40 hover:bg-white/[0.05] focus:border-primary/50"
        >
          <span className="text-muted-foreground transition group-hover:text-primary">
            {icon}
          </span>

          <div className="flex-1 truncate font-medium">
            {value === 'all'
              ? allLabel
              : formatOption
              ? formatOption(value)
              : value}
          </div>

          <ChevronDown className="h-4 w-4 text-muted-foreground transition group-data-[state=open]:rotate-180" />
        </Select.Trigger>

        <Select.Portal>
          <Select.Content
            position="popper"
            sideOffset={10}
            className="z-50 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-2xl border border-white/10 bg-background/95 p-2 shadow-[0_20px_80px_rgba(0,0,0,0.55)] backdrop-blur-2xl"
          >
            <Select.Viewport className="space-y-1">
              <Select.Item
                value="all"
                className="cursor-pointer rounded-xl px-4 py-3 text-sm text-white outline-none transition hover:bg-primary/10 focus:bg-primary/15"
              >
                <Select.ItemText>{allLabel}</Select.ItemText>
              </Select.Item>

              {options.map((option) => (
                <Select.Item
                  key={option}
                  value={option}
                  className="cursor-pointer rounded-xl px-4 py-3 text-sm text-white outline-none transition hover:bg-primary/10 focus:bg-primary/15"
                >
                  <Select.ItemText>
                    {formatOption ? formatOption(option) : option}
                  </Select.ItemText>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  );
}
