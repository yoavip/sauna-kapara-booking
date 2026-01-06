import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Check, User } from "lucide-react";

interface AddSingleParticipantSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (name: string) => void;
  existingRegistrations?: string[];
}

const AddSingleParticipantSheet = ({ open, onOpenChange, onConfirm, existingRegistrations = [] }: AddSingleParticipantSheetProps) => {
  const [name, setName] = useState('');

  useEffect(() => {
    if (open) {
      setName('');
    }
  }, [open]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (name.trim()) {
        handleConfirm();
      } else {
        (e.target as HTMLInputElement).blur();
      }
    }
  };

  const handleConfirm = () => {
    if (name.trim()) {
      onConfirm(name.trim());
      setName('');
      onOpenChange(false);
    }
  };

  const handleClose = () => {
    setName('');
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="bottom" className="h-auto max-h-[70vh] flex flex-col">
        <SheetHeader className="mb-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2 text-xl">
              <Users className="w-5 h-5 text-primary" />
              הוספת משתתף
            </SheetTitle>
            <Button
              variant="default"
              size="sm"
              onClick={handleConfirm}
              disabled={!name.trim()}
              className="gap-1"
            >
              <Check className="w-4 h-4" />
              הוסף
            </Button>
          </div>
        </SheetHeader>
        
        {/* Existing registrations */}
        {existingRegistrations.length > 0 && (
          <div className="mb-4 p-3 bg-muted/50 rounded-xl flex-shrink-0">
            <p className="text-sm text-muted-foreground mb-2">כבר רשומים לשעה זו:</p>
            <div className="flex flex-wrap gap-2">
              {existingRegistrations.map((regName, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-1 px-3 py-1 bg-primary/10 border border-primary/30 rounded-full text-sm"
                >
                  <User className="w-3 h-3 text-primary" />
                  <span className="text-foreground">{regName}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="pb-4">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="שם המשתתף"
            className="h-12 text-base"
            autoFocus
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AddSingleParticipantSheet;

