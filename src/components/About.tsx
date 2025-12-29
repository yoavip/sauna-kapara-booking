import { Thermometer, Users, Clock, Leaf } from "lucide-react";

const features = [
  {
    icon: Thermometer,
    title: "סאונה פינית מסורתית",
    description: "חום יבש של 80-100 מעלות לחוויה אותנטית"
  },
  {
    icon: Users,
    title: "עד 6 אורחים",
    description: "מתאים למשפחות, זוגות או חברים"
  },
  {
    icon: Clock,
    title: "סשן של שעה וחצי",
    description: "זמן מספיק להתרעננות מלאה"
  },
  {
    icon: Leaf,
    title: "בלב הטבע",
    description: "נוף ירוק ואוויר צח של הגליל"
  }
];

const About = () => {
  return (
    <section id="about" className="py-24 bg-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            אודות הסאונה
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            הסאונה של בית קשת היא פינת גן עדן בגליל, המציעה חוויה אותנטית של סאונה פינית בליווי נוף עוצר נשימה
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={feature.title}
              className="group bg-background rounded-2xl p-8 shadow-warm hover:shadow-glow transition-all duration-500 hover:-translate-y-2"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
