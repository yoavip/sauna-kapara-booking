import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Check } from "lucide-react";

interface SnookerRulesSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

const SnookerRulesSheet = ({ open, onOpenChange, onConfirm }: SnookerRulesSheetProps) => {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] bg-gradient-to-b from-emerald-950 to-black border-emerald-700/50">
        <SheetHeader className="mb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-emerald-200 text-xl">תקנון סנוקר</SheetTitle>
            <Button 
              onClick={handleConfirm}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2"
            >
              <Check className="w-4 h-4" />
              מאשר.ת
            </Button>
          </div>
        </SheetHeader>
        
        <div className="overflow-y-auto h-[calc(100%-80px)] pr-1">
          <div className="space-y-4 text-base text-emerald-200/90 leading-relaxed">
            <p className="text-emerald-400 font-medium text-lg">
              ברוכים הבאים לשולחן הביליארד של בית קשת! 🎱
            </p>
            
            <div className="space-y-3">
              <h3 className="font-bold text-emerald-300">כללי שימוש בסיסיים:</h3>
              <ul className="list-disc list-inside space-y-2 text-emerald-200/80">
                <li>המשחק מיועד לשימוש חברי הקהילה בלבד</li>
                <li>יש לשמור על השולחן וציוד המשחק</li>
                <li>משך משחק מקסימלי: שעה אחת כשיש ממתינים</li>
                <li>יש לסדר את הכדורים והמקלות לאחר המשחק</li>
                <li>אסור להניח משקאות או אוכל על השולחן</li>
                <li>יש לכבד את תור הממתינים</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-emerald-300">הזמנת שולחן:</h3>
              <ul className="list-disc list-inside space-y-2 text-emerald-200/80">
                <li>ניתן להירשם עד יום מראש</li>
                <li>ביטול הרשמה חייב להתבצע לפחות שעה לפני המועד</li>
                <li>אי הגעה ללא ביטול עלולה להוביל להגבלה</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-emerald-300">בטיחות:</h3>
              <ul className="list-disc list-inside space-y-2 text-emerald-200/80">
                <li>יש להיזהר בעת שימוש במקלות</li>
                <li>אין לשבת או להישען על השולחן</li>
                <li>ילדים מתחת לגיל 12 רק בליווי מבוגר</li>
              </ul>
            </div>

            <p className="text-emerald-400/70 text-sm pt-4 border-t border-emerald-700/30">
              לתקנון המלא:{' '}
              <button
                onClick={() => window.open('https://docs.google.com/document/d/10-buDfV_FiHRjLG8Y2FO07W9Qiz2c3Dac41USrrJMOU/edit?usp=drivesdk', '_blank')}
                className="underline hover:text-emerald-300"
              >
                לחצו כאן
              </button>
            </p>

            <p className="text-emerald-300/60 text-sm">
              בלחיצה על "מאשר.ת" אני מאשר/ת שקראתי והבנתי את התקנון ומתחייב/ת לפעול על פיו.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SnookerRulesSheet;
