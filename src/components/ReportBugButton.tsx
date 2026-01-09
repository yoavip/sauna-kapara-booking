import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const ReportBugButton = () => {
  const developerPhone = "972526606479";
  const message = "שלום, יש לי הערה לגבי אתר הסאונה:";
  
  const handleClick = () => {
    const whatsappUrl = `https://wa.me/${developerPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Button
      onClick={handleClick}
      variant="outline"
      size="sm"
      className="fixed bottom-4 left-4 z-50 gap-2 bg-background/90 backdrop-blur-sm border-amber-500/50 text-amber-600 hover:bg-amber-50 hover:text-amber-700 shadow-lg"
    >
      <MessageCircle className="w-4 h-4" />
      <span className="text-xs">האתר בהרצה - דווח על בעיה</span>
    </Button>
  );
};

export default ReportBugButton;
