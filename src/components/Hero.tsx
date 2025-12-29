import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import saunaHero from "@/assets/sauna-hero.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${saunaHero})` }}
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-foreground/60 via-foreground/40 to-background" />
      
      {/* Steam Effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-32 h-32 bg-steam/20 rounded-full blur-3xl animate-steam" />
        <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-steam/15 rounded-full blur-3xl animate-steam" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-1/3 right-1/2 w-24 h-24 bg-steam/25 rounded-full blur-3xl animate-steam" style={{ animationDelay: '2s' }} />
      </div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="animate-fade-up">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-steam mb-6 leading-tight">
            חוויית סאונה
            <br />
            <span className="text-golden">בלב הטבע</span>
          </h1>
          <p className="text-lg md:text-xl text-steam/80 max-w-2xl mx-auto mb-10">
            הזמינו את המקום שלכם בסאונה הפינית המושלמת של בית קשת
            <br />
            רגיעה, התחדשות ושלווה מוחלטת
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="xl" asChild>
              <a href="#booking">הזמינו עכשיו</a>
            </Button>
            <Button variant="outline" size="xl" className="border-steam/30 text-steam hover:bg-steam/10 hover:text-steam">
              <a href="#about">למידע נוסף</a>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
        <a href="#about" className="flex flex-col items-center gap-2 text-steam/60 hover:text-steam transition-colors">
          <span className="text-sm">גללו למטה</span>
          <ChevronDown className="w-6 h-6" />
        </a>
      </div>
    </section>
  );
};

export default Hero;
