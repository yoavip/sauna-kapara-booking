import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import galileeImage from "@/assets/galilee-landscape.jpg";

const TourGuide = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    message: "",
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.functions.invoke("send-tour-contact", {
        body: formData,
      });

      if (error) throw error;

      toast({
        title: "הודעה נשלחה בהצלחה!",
        description: "צבי יחזור אליך בהקדם",
      });
      setIsOpen(false);
      setFormData({ firstName: "", lastName: "", phone: "", email: "", message: "" });
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "שגיאה בשליחת ההודעה",
        description: "אנא נסה שוב מאוחר יותר",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative" dir="rtl">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${galileeImage})` }}
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" />
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">
        {/* Name */}
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 text-center drop-shadow-lg">
          צבי פינסקי
        </h1>
        
        <h2 className="text-2xl md:text-3xl text-amber-200 mb-12 text-center drop-shadow-md">
          מדריך טיולים בגליל
        </h2>

        {/* Main Content Card */}
        <div className="max-w-3xl bg-white/95 backdrop-blur-sm rounded-2xl p-8 md:p-12 shadow-2xl">
          <div className="prose prose-lg text-gray-700 leading-relaxed text-right">
            <p className="mb-4">
              שלום, אני צבי פינסקי, מדריך טיולים מקומי בגליל כבר למעלה משלושים שנה. 
              נולדתי וגדלתי בין ההרים הירוקים והעמקים הפוריים של הגליל, ומכיר כל שביל, 
              כל עץ זית עתיק, וכל אבן שמספרת סיפור.
            </p>
            
            <p className="mb-4">
              הגליל הוא לא רק נוף - הוא פסיפס של תרבויות, דתות והיסטוריה עשירה. 
              בכל טיול שאני מוביל, אני משלב את הסיפורים המקומיים שעברו מדור לדור: 
              על הכפרים העתיקים, על מעיינות הגעש שנובעים מהאדמה, על בתי הבד שעדיין 
              עובדים כמו פעם, ועל האנשים שמאכלסים את הארץ הזו מאז ומעולם.
            </p>
            
            <p className="mb-4">
              הטיולים שלי מותאמים לכל קבוצה - משפחות עם ילדים, זוגות שמחפשים רומנטיקה, 
              קבוצות חברים, או ארגונים וחברות. אני מציע מסלולים להליכה קלה ונגישה, 
              ומסלולים מאתגרים יותר לאלו שמחפשים הרפתקה.
            </p>
            
            <p className="mb-4">
              במהלך הטיול נעצור לטעום מהתוצרת המקומית - גבינות עיזים מחוות משפחתיות, 
              זיתים כבושים בשיטות מסורתיות, יין מיקבים בוטיקיים, ודבש פרחי בר שאין לו מתחרים.
            </p>
            
            <p className="mb-4">
              אני מאמין שהדרך הטובה ביותר להכיר את הארץ היא דרך הסיפורים של אנשיה. 
              לכן בכל טיול אני מקפיד לשלב מפגשים עם תושבים מקומיים - חקלאים, 
              אמנים, ובעלי מלאכה שממשיכים מסורות של דורות.
            </p>
            
            <p className="mb-4">
              הגליל שלי הוא גליל של עונות - בסתיו הזיתים מבשילים והארץ מריחה שמן זית טרי, 
              בחורף הנחלים זורמים והמפלים שוצפים, באביב השדות מתכסים פרחי בר צבעוניים, 
              ובקיץ הערבים הקרירים בהרים מזמינים לפיקניקים תחת כוכבים.
            </p>
            
            <p className="mb-6">
              מוזמנים ליצור איתי קשר ונתאים יחד את הטיול המושלם עבורכם. 
              בואו לגלות את הגליל דרך העיניים של מי שמכיר אותו כמו את כף ידו.
            </p>

            <div className="flex items-center gap-2 text-amber-700 mb-2">
              <MapPin className="w-5 h-5" />
              <span>בית קשת, עמק יזרעאל</span>
            </div>
          </div>
        </div>

        {/* Contact Button */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button 
              size="lg" 
              className="mt-10 text-lg px-10 py-6 bg-amber-600 hover:bg-amber-700 text-white shadow-xl"
            >
              <Phone className="ml-2 w-5 h-5" />
              יצירת קשר
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-right text-xl">יצירת קשר עם צבי</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">שם פרטי</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                    className="text-right"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">שם משפחה</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                    className="text-right"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">טלפון</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  dir="ltr"
                  className="text-left"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">אימייל</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  dir="ltr"
                  className="text-left"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">הודעה</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  className="text-right min-h-[100px]"
                  placeholder="ספרו לי על הטיול שאתם מתכננים..."
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-amber-600 hover:bg-amber-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? "שולח..." : "שליחה"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* WhatsApp Button */}
        <div className="fixed bottom-4 left-4 z-[9999]">
          <Button
            onClick={() => {
              const phone = "972526606479";
              const message = "צבי שמעתי על הטיולים המרתקים שלך ורציתי...";
              window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
            }}
            variant="outline"
            size="sm"
            className="gap-2 bg-green-100 backdrop-blur-sm border-green-500 text-green-700 hover:bg-green-200 hover:text-green-800 shadow-lg"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-xs">כתוב לצבי</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TourGuide;
