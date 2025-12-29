import { Flame } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-wood text-primary-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <Flame className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold">סאונה בית קשת</span>
          </div>
          
          <nav className="flex items-center gap-8">
            <a href="#about" className="hover:text-golden transition-colors">אודות</a>
            <a href="#booking" className="hover:text-golden transition-colors">הזמנה</a>
            <a href="#contact" className="hover:text-golden transition-colors">צור קשר</a>
          </nav>
          
          <p className="text-primary-foreground/60 text-sm">
            © 2024 סאונה בית קשת. כל הזכויות שמורות.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
