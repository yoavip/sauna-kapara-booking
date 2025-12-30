import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Share2, Copy, MessageCircle, Check } from "lucide-react";
import { toast } from "sonner";

const ShareButton = () => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = window.location.href;
  const shareText = "בואו לסאונה בית קשת! 🔥";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("הקישור הועתק!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("שגיאה בהעתקה");
    }
  };

  const handleWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`;
    window.open(url, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'סאונה בית קשת',
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      setOpen(true);
    }
  };

  return (
    <>
      <button
        onClick={handleNativeShare}
        className="fixed bottom-6 left-6 z-50 flex items-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-full shadow-lg hover:bg-primary/90 transition-all hover:scale-105"
      >
        <Share2 className="w-5 h-5" />
        <span className="font-medium">שיתוף</span>
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="h-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-xl">אני רוצה לשתף...</SheetTitle>
          </SheetHeader>
          
          <div className="grid grid-cols-2 gap-4 pb-6">
            <button
              onClick={handleWhatsApp}
              className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-[#25D366]/10 hover:bg-[#25D366]/20 transition-colors"
            >
              <div className="w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center">
                <MessageCircle className="w-7 h-7 text-white" />
              </div>
              <span className="font-medium text-foreground">WhatsApp</span>
            </button>

            <button
              onClick={handleCopy}
              className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-muted hover:bg-muted/80 transition-colors"
            >
              <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
                {copied ? (
                  <Check className="w-7 h-7 text-primary-foreground" />
                ) : (
                  <Copy className="w-7 h-7 text-primary-foreground" />
                )}
              </div>
              <span className="font-medium text-foreground">
                {copied ? "הועתק!" : "העתק קישור"}
              </span>
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default ShareButton;
