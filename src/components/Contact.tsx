import { MapPin, Phone, Mail, Clock } from "lucide-react";

const Contact = () => {
  return (
    <section id="contact" className="py-24 bg-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            צור קשר
          </h2>
          <p className="text-muted-foreground text-lg">
            יש לכם שאלות? אנחנו כאן בשבילכם
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          <div className="bg-background rounded-2xl p-6 text-center shadow-warm hover:shadow-glow transition-all duration-300">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">מיקום</h3>
            <p className="text-muted-foreground">קיבוץ בית קשת, הגליל התחתון</p>
          </div>
          
          <div className="bg-background rounded-2xl p-6 text-center shadow-warm hover:shadow-glow transition-all duration-300">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Phone className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">טלפון</h3>
            <a href="tel:050-1234567" className="text-muted-foreground hover:text-primary transition-colors">
              050-1234567
            </a>
          </div>
          
          <div className="bg-background rounded-2xl p-6 text-center shadow-warm hover:shadow-glow transition-all duration-300">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">אימייל</h3>
            <a href="mailto:sauna@beitkeshet.co.il" className="text-muted-foreground hover:text-primary transition-colors">
              sauna@beitkeshet.co.il
            </a>
          </div>
          
          <div className="bg-background rounded-2xl p-6 text-center shadow-warm hover:shadow-glow transition-all duration-300">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">שעות פעילות</h3>
            <p className="text-muted-foreground">א'-ש' 09:00-21:00</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
