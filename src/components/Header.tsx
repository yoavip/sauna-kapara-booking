import { Flame } from "lucide-react";

const Header = () => {
  return (
    <header className="fixed top-0 right-0 left-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <Flame className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">סאונה בית קשת</span>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">אודות</a>
          <a href="#booking" className="text-muted-foreground hover:text-foreground transition-colors">הזמנה</a>
          <a href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">צור קשר</a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
