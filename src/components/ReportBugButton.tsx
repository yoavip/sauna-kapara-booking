import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const ReportBugButton = () => {
  const developerPhone = "972526606479";
  const message = "שלום לך יואב תודה על האתר החמוד והמושקע, שיחקת אותה!\nרק יש כמה דברים שלא עובדים, או יותר נכון חשבתי שיש מה לשפר, אז קבל:\n(אפשר גם הודעה קולית, בכיף)";
  
  const handleClick = () => {
    const whatsappUrl = `https://wa.me/${developerPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="fixed bottom-4 left-4 z-[9999]">
      <Button
        onClick={handleClick}
        variant="outline"
        size="sm"
        className="gap-2 bg-amber-100 backdrop-blur-sm border-amber-500 text-amber-700 hover:bg-amber-200 hover:text-amber-800 shadow-lg"
      >
        <MessageCircle className="w-4 h-4" />
        <span className="text-xs">בוא נשמע אותך</span>
      </Button>
    </div>
  );
};

export default ReportBugButton;
