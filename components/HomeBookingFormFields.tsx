import { MapPin, Calendar, Clock as ClockIcon, ChevronDown } from 'lucide-react';
import * as Select from '@radix-ui/react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Dispatch, SetStateAction } from 'react';

interface HomeBookingFormFieldsProps {
  selectedOption: string;
  date: Date | null;
  setDate: Dispatch<SetStateAction<Date | null>>;
  time: Date | null;
  setTime: Dispatch<SetStateAction<Date | null>>;
  t: (key: string) => string;
}

const HomeBookingFormFields = ({ selectedOption, date, setDate, time, setTime, t }: HomeBookingFormFieldsProps) => {
  switch (selectedOption) {
    case 'distance':
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">{t('booking.pickup_address')}</label>
            <div className="relative">
              <MapPin className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <input
                type="text"
                placeholder={t('booking.pickup_address_placeholder')}
                className="w-full pl-7 pr-3 py-2 bg-background/50 border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent text-md"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">{t('booking.dropoff_address')}</label>
            <div className="relative">
              <MapPin className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <input
                type="text"
                placeholder={t('booking.dropoff_address_placeholder')}
                className="w-full pl-7 pr-3 py-2 bg-background/50 border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent text-md"
              />
            </div>
          </div>
          <label className="block text-sm font-medium text-foreground mb-1">{t('booking.way_type')}</label>
          <div className="relative">
            <Select.Root defaultValue="one-way">
              <Select.Trigger
                className="w-full cursor-pointer px-3 py-2 pr-10 bg-background/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent text-md flex items-center justify-between appearance-none"
              >
                <Select.Value />
                <Select.Icon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  <ChevronDown size={20} />
                </Select.Icon>
              </Select.Trigger>
              <Select.Portal>
                <Select.Content
                  className="w-full bg-background border border-border rounded-lg mt-1 shadow-lg text-foreground backdrop-blur-md z-50"
                  position="popper"
                  sideOffset={4}
                  style={{ minWidth: 'var(--radix-select-trigger-width)' }}
                >
                  <Select.Viewport className="p-1">
                    <Select.Item
                      value="one-way"
                      className="px-4 py-2 rounded-md cursor-pointer w-full hover:bg-accent/20 focus:bg-accent/30 outline-none text-foreground text-md"
                    >
                      <Select.ItemText>{t('misc.one_way')}</Select.ItemText>
                    </Select.Item>
                    <Select.Item
                      value="round-trip"
                      className="px-4 py-2 rounded-md cursor-pointer w-full hover:bg-accent/20 focus:bg-accent/30 outline-none text-foreground text-md"
                    >
                      <Select.ItemText>{t('misc.round_trip')}</Select.ItemText>
                    </Select.Item>
                  </Select.Viewport>
                </Select.Content>
              </Select.Portal>
            </Select.Root>
          </div>
        </div>
      );
    case 'hourly':
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">{t('booking.pickup_address')}</label>
            <div className="relative">
              <MapPin className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <input
                type="text"
                placeholder={t('booking.pickup_address_placeholder')}
                className="w-full pl-7 pr-3 py-2 bg-background/50 border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent text-md"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">{t('booking.date')}</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
              <DatePicker
                selected={date}
                onChange={setDate}
                dateFormat="yyyy-MM-dd"
                placeholderText={t('booking.date_placeholder')}
                className="w-full pl-11 pr-3 py-2 bg-background/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent text-md"
                calendarClassName="bg-background border border-border rounded-lg text-foreground"
                popperClassName="z-50"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">{t('booking.pickup_time')}</label>
            <div className="relative">
              <ClockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
              <DatePicker
                selected={time}
                onChange={setTime}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={15}
                timeCaption={t('booking.time_caption')}
                dateFormat="HH:mm"
                placeholderText={t('booking.time_placeholder')}
                className="w-full pl-11 pr-3 py-2 bg-background/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent text-md"
                calendarClassName="bg-background border border-border rounded-lg text-foreground"
                popperClassName="z-50"
              />
            </div>
          </div>
        </div>
      );
    case 'flat-rate':
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">{t('booking.pickup_address')}</label>
            <div className="relative">
              <MapPin className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <input
                type="text"
                placeholder={t('booking.pickup_address_placeholder')}
                className="w-full pl-7 pr-3 py-2 bg-background/50 border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent text-md"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">{t('booking.dropoff_address')}</label>
            <div className="relative">
              <MapPin className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <input
                type="text"
                placeholder={t('booking.dropoff_address_placeholder')}
                className="w-full pl-7 pr-3 py-2 bg-background/50 border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent text-md"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">{t('booking.date')}</label>
            <div className="relative">
              <Calendar className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <DatePicker
                selected={date}
                onChange={setDate}
                dateFormat="yyyy-MM-dd"
                placeholderText={t('booking.date_placeholder')}
                className="w-full pl-7 pr-3 py-2 bg-background/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent text-md"
                calendarClassName="bg-background border border-border rounded-lg text-foreground"
                popperClassName="z-50"
              />
            </div>
          </div>
        </div>
      );
    default:
      return null;
  }
};

export default HomeBookingFormFields; 