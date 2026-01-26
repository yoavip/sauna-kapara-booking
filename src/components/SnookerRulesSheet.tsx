import { useState, useRef, useEffect } from "react";
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
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Reset scroll state when sheet opens
  useEffect(() => {
    if (open) {
      setHasScrolledToBottom(false);
    }
  }, [open]);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      // Check if scrolled to bottom (with 20px threshold)
      if (scrollTop + clientHeight >= scrollHeight - 20) {
        setHasScrolledToBottom(true);
      }
    }
  };

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] bg-gradient-to-b from-emerald-950 to-black border-emerald-700/50">
        <SheetHeader className="mb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-emerald-200 text-xl">🎱 תקנון סנוקר</SheetTitle>
            <Button 
              onClick={handleConfirm}
              size="sm"
              disabled={!hasScrolledToBottom}
              className={`gap-2 ${
                hasScrolledToBottom 
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white' 
                  : 'bg-emerald-900/50 text-emerald-600 cursor-not-allowed'
              }`}
            >
              <Check className="w-4 h-4" />
              מאשר.ת
            </Button>
          </div>
          {!hasScrolledToBottom && (
            <p className="text-emerald-500/70 text-xs mt-1">יש לגלול עד לסוף התקנון כדי לאשר</p>
          )}
        </SheetHeader>
        
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="overflow-y-auto h-[calc(100%-80px)] pr-1"
        >
          <div className="space-y-6 text-base text-emerald-200/90 leading-relaxed">
            {/* Title */}
            <div className="text-center pb-4 border-b border-emerald-700/30">
              <h2 className="text-2xl font-bold text-emerald-300 mb-1">🎱 חגיגה בסנוקר – תקנון שימוש</h2>
              <p className="text-emerald-400/80">שולחן הביליארד | בית קשת</p>
            </div>

            {/* כניסה ומפתח */}
            <div className="space-y-3">
              <h3 className="font-bold text-emerald-300 text-lg flex items-center gap-2">
                🔐 כניסה ומפתח
              </h3>
              <ul className="list-disc list-inside space-y-2 text-emerald-200/80 mr-2">
                <li>הכניסה לרדיו בר היא דרך הדלת הראשית בלבד.</li>
                <li>המפתח נמצא בלוקבוקס מימין לדלת.</li>
                <li><strong className="text-emerald-300">קוד הלוקבוקס: 8264</strong></li>
              </ul>
            </div>

            {/* כללי שימוש */}
            <div className="space-y-3">
              <h3 className="font-bold text-emerald-300 text-lg">כללי שימוש</h3>
              <ul className="list-disc list-inside space-y-2 text-emerald-200/80 mr-2">
                <li>השימוש בשולחן הביליארד מיועד לתושבי בית קשת בלבד.</li>
                <li>אין להכניס אורחים ללא ליווי של תושב/ת מהיישוב.</li>
                <li>הכניסה למתחם מותנית ברישום מראש באפליקציית ההרשמה.</li>
                <li>יש לרשום באפליקציה את שמות כל המשתתפים; ניתן להירשם ולהוסיף שמות של חברים נוספים.</li>
                <li>ההרשמה היא לשעה אחת בלבד.</li>
                <li>במידה ואין נרשמים נוספים לאחר השעה שהוזמנה – ניתן להמשיך ולשחק.</li>
                <li><strong className="text-emerald-300">השימוש מגיל 18 ומעלה בלבד.</strong></li>
              </ul>
            </div>

            {/* סדר וניקיון */}
            <div className="space-y-3">
              <h3 className="font-bold text-emerald-300 text-lg">סדר וניקיון</h3>
              <ul className="list-disc list-inside space-y-2 text-emerald-200/80 mr-2">
                <li>
                  <strong className="text-emerald-300">בסיום המשחק חובה להחזיר את כל הציוד למקום:</strong>
                  <br />
                  <span className="mr-6">מקלות, כדורים, משולש, גירים וחמור.</span>
                </li>
                <li>יש להשאיר את המקום נקי ומסודר לאחר השימוש.</li>
                <li>כוסות, בקבוקים ושאריות אוכל – לקחת אתכם ולזרוק בפח שמחוץ לרדיו בר.</li>
              </ul>
            </div>

            {/* עישון */}
            <div className="space-y-3">
              <h3 className="font-bold text-emerald-300 text-lg flex items-center gap-2">
                🚭 עישון
              </h3>
              <ul className="list-disc list-inside space-y-2 text-emerald-200/80 mr-2">
                <li><strong className="text-red-400">אין לעשן בתוך הרדיו בר.</strong></li>
                <li>עישון מותר אך ורק מחוץ למבנה.</li>
              </ul>
            </div>

            {/* בסיום השהות */}
            <div className="space-y-3">
              <h3 className="font-bold text-emerald-300 text-lg flex items-center gap-2">
                🔒 בסיום השהות
              </h3>
              <ul className="list-disc list-inside space-y-2 text-emerald-200/80 mr-2">
                <li>לכבות את כל האורות ברדיו בר.</li>
                <li>לנעול את כל הדלתות.</li>
              </ul>
            </div>

            {/* אחריות ונזקים */}
            <div className="space-y-3">
              <h3 className="font-bold text-emerald-300 text-lg flex items-center gap-2">
                ⚠️ אחריות ונזקים
              </h3>
              <ul className="list-disc list-inside space-y-2 text-emerald-200/80 mr-2">
                <li>המשחק והשהות ברדיו בר הם באחריות המשתמשים בלבד.</li>
                <li>יש לדווח על כל נזק שנגרם במהלך השימוש.</li>
                <li>האחריות לכל נזק שייגרם לציוד או למבנה חלה על המשתמשים.</li>
                <li><strong className="text-amber-400">היישוב והוועד אינם אחראים לנזק, פגיעה או אובדן מכל סוג שהוא.</strong></li>
              </ul>
            </div>

            {/* Link to full document */}
            <p className="text-emerald-400/70 text-sm pt-4 border-t border-emerald-700/30">
              לתקנון המלא:{' '}
              <button
                onClick={() => window.open('https://docs.google.com/document/d/10-buDfV_FiHRjLG8Y2FO07W9Qiz2c3Dac41USrrJMOU/edit?usp=drivesdk', '_blank')}
                className="underline hover:text-emerald-300"
              >
                לחצו כאן
              </button>
            </p>

            {/* Confirmation text */}
            <p className="text-emerald-300/60 text-sm pb-4">
              בלחיצה על "מאשר.ת" אני מאשר/ת שקראתי והבנתי את התקנון ומתחייב/ת לפעול על פיו.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SnookerRulesSheet;
