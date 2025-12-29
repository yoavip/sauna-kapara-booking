import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Clock, Users, Check } from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { toast } from "sonner";

const timeSlots = [
  "09:00", "11:00", "13:00", "15:00", "17:00", "19:00"
];

const BookingForm = () => {
  const [date, setDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [guests, setGuests] = useState(2);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !selectedTime || !name || !phone) {
      toast.error("נא למלא את כל השדות");
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success("ההזמנה נשלחה בהצלחה! נחזור אליכם בהקדם");
    
    // Reset form
    setDate(undefined);
    setSelectedTime("");
    setGuests(2);
    setName("");
    setPhone("");
    setIsSubmitting(false);
  };

  return (
    <section id="booking" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            הזמנת מקום
          </h2>
          <p className="text-muted-foreground text-lg">
            בחרו תאריך ושעה ותמלאו את הפרטים שלכם
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
          <div className="bg-card rounded-3xl p-8 md:p-12 shadow-warm">
            {/* Date Selection */}
            <div className="mb-8">
              <label className="block text-foreground font-medium mb-3">בחירת תאריך</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-right h-14 text-base"
                  >
                    <CalendarIcon className="ml-3 h-5 w-5 text-muted-foreground" />
                    {date ? format(date, "EEEE, d בMMMM yyyy", { locale: he }) : "בחרו תאריך"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            {/* Time Selection */}
            <div className="mb-8">
              <label className="block text-foreground font-medium mb-3">
                <Clock className="inline-block w-5 h-5 ml-2" />
                בחירת שעה
              </label>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setSelectedTime(time)}
                    className={`py-3 px-4 rounded-xl border-2 font-medium transition-all duration-300 ${
                      selectedTime === time
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background hover:border-primary/50"
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Guest Count */}
            <div className="mb-8">
              <label className="block text-foreground font-medium mb-3">
                <Users className="inline-block w-5 h-5 ml-2" />
                מספר אורחים
              </label>
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setGuests(Math.max(1, guests - 1))}
                  className="h-12 w-12"
                >
                  -
                </Button>
                <span className="text-2xl font-semibold w-12 text-center">{guests}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setGuests(Math.min(6, guests + 1))}
                  className="h-12 w-12"
                >
                  +
                </Button>
                <span className="text-muted-foreground">אורחים (מקסימום 6)</span>
              </div>
            </div>
            
            {/* Contact Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-foreground font-medium mb-3">שם מלא</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="הזינו את שמכם"
                  className="h-14 text-base"
                />
              </div>
              <div>
                <label className="block text-foreground font-medium mb-3">טלפון</label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="050-1234567"
                  type="tel"
                  className="h-14 text-base"
                  dir="ltr"
                />
              </div>
            </div>
            
            {/* Submit Button */}
            <Button
              type="submit"
              variant="hero"
              size="xl"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                "שולח..."
              ) : (
                <>
                  <Check className="w-5 h-5 ml-2" />
                  שלחו הזמנה
                </>
              )}
            </Button>
            
            <p className="text-center text-muted-foreground text-sm mt-6">
              * ההזמנה תאושר טלפונית תוך 24 שעות
            </p>
          </div>
        </form>
      </div>
    </section>
  );
};

export default BookingForm;
