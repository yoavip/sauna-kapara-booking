import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, Users, Check, User } from "lucide-react";

interface AddParticipantsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (names: string[]) => void;
  existingRegistrations?: string[];
}

const AddParticipantsSheet = ({ open, onOpenChange, onConfirm, existingRegistrations = [] }: AddParticipantsSheetProps) => {
  const [names, setNames] = useState<string[]>(['']);

  useEffect(() => {
    if (open) {
      setNames(['']);
    }
  }, [open]);

  const addName = () => {
    setNames([...names, '']);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      (e.target as HTMLInputElement).blur();
    }
  };

  const updateName = (index: number, value: string) => {
    const newNames = [...names];
    newNames[index] = value;
    setNames(newNames);
  };

  const removeName = (index: number) => {
    if (names.length > 1) {
      setNames(names.filter((_, i) => i !== index));
    }
  };

  const handleConfirm = () => {
    const validNames = names.filter(n => n.trim());
    if (validNames.length > 0) {
      onConfirm(validNames);
      setNames(['']);
      onOpenChange(false);
    }
  };

  const handleClose = () => {
    setNames(['']);
    onOpenChange(false);
  };

  const validCount = names.filter(n => n.trim()).length;

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="bottom" className="h-[70vh] flex flex-col">
        <SheetHeader className="mb-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2 text-xl">
              <Users className="w-5 h-5 text-primary" />
              הוספת משתתפים
            </SheetTitle>
            <Button
              variant="default"
              size="sm"
              onClick={handleConfirm}
              disabled={validCount === 0}
              className="gap-1"
            >
              <Check className="w-4 h-4" />
              זהו
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
        
        <div className="flex-1 overflow-y-auto space-y-4 pb-4">
          {names.map((name, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={name}
                onChange={(e) => updateName(index, e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`שם משתתף ${index + 1}`}
                className="h-12 text-base"
              />
              {names.length > 1 && (
                <button
                  onClick={() => removeName(index)}
                  className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}

          <button
            onClick={addName}
            className="w-full py-4 border-2 border-dashed border-border rounded-xl flex items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
          >
            <Plus className="w-5 h-5" />
            עוד מישהו
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AddParticipantsSheet;
