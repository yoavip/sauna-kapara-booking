import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText } from "lucide-react";

interface RulesSheetProps {
  trigger: React.ReactNode;
}

const RulesSheet = ({ trigger }: RulesSheetProps) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        {trigger}
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[85vh]">
        <SheetHeader className="mb-4">
          <SheetTitle className="flex items-center gap-2 text-xl">
            <FileText className="w-5 h-5 text-primary" />
            חוקים וכללים
          </SheetTitle>
        </SheetHeader>
        
        <ScrollArea className="h-[calc(100%-4rem)] pr-4">
          <div className="space-y-6 text-foreground">
            <section>
              <h3 className="font-bold text-lg mb-2 text-primary">כללי התנהגות בסאונה</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• יש להתקלח לפני הכניסה לסאונה</li>
                <li>• יש לשמור על שקט ואווירה רגועה</li>
                <li>• אין להשאיר ילדים ללא השגחה</li>
                <li>• יש לשתות מים לפני ואחרי השימוש</li>
              </ul>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2 text-primary">בטיחות</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• אין להשתמש בסאונה יותר מ-15 דקות ברציפות</li>
                <li>• אם מרגישים חולשה - לצאת מיד</li>
                <li>• אסור להכניס מזון או משקאות</li>
                <li>• אין להשתמש בסאונה תחת השפעת אלכוהול</li>
              </ul>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2 text-primary">ניקיון</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• יש להשתמש במגבת אישית</li>
                <li>• יש לשמור על ניקיון המתחם</li>
                <li>• יש לפנות את המקום בזמן</li>
              </ul>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2 text-primary">הרשמה</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• יש להירשם מראש לפני הגעה</li>
                <li>• יש לבטל הרשמה אם לא מגיעים</li>
                <li>• ניתן להירשם עד יום מראש</li>
              </ul>
            </section>

            <div className="pt-4 pb-8 text-center text-sm text-muted-foreground">
              בכניסה לסאונה הנכם מאשרים שקראתם והבנתם את הכללים
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default RulesSheet;
