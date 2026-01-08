import { useState, useEffect, useRef } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollText } from "lucide-react";

interface RulesSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

const RULES_URL = "https://docs.google.com/document/d/1GTYyJSkrMjytvsKmBpEkYS8UJDZA0P8E4igQM1KFW1Y/export?format=txt";

const RulesSheet = ({ open, onOpenChange, onConfirm }: RulesSheetProps) => {
  const [rulesContent, setRulesContent] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && !rulesContent) {
      fetchRules();
    }
    if (open) {
      setScrolledToBottom(false);
    }
  }, [open]);

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (container) {
      const { scrollTop, scrollHeight, clientHeight } = container;
      if (scrollTop + clientHeight >= scrollHeight - 20) {
        setScrolledToBottom(true);
      }
    }
  };

  const fetchRules = async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await fetch(RULES_URL);
      if (response.ok) {
        const text = await response.text();
        setRulesContent(text);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error("Error fetching rules:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] flex flex-col">
        <SheetHeader className="mb-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2 text-xl">
              <ScrollText className="w-5 h-5 text-primary" />
              חוקים וכללי הסאונה
            </SheetTitle>
            <Button
              variant="default"
              size="sm"
              onClick={handleConfirm}
              disabled={loading || error || !scrolledToBottom}
            >
              מאשר.ת
            </Button>
          </div>
        </SheetHeader>
        
        <p className="text-sm text-muted-foreground mb-4 flex-shrink-0">בבקשה לקרוא הכל ואז לאשר</p>
        
        <div 
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto pb-4"
        >
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">טוען תקנון...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <p className="text-destructive">שגיאה בטעינת התקנון</p>
              <Button variant="outline" onClick={fetchRules}>
                נסה שוב
              </Button>
            </div>
          ) : (
            <div className="bg-muted/30 rounded-xl p-6 whitespace-pre-wrap text-base leading-relaxed text-foreground">
              {rulesContent}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default RulesSheet;
