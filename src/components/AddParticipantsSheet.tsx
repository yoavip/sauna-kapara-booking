import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, Users } from "lucide-react";

interface AddParticipantsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (names: string[]) => void;
}

const AddParticipantsSheet = ({ open, onOpenChange, onConfirm }: AddParticipantsSheetProps) => {
  const [names, setNames] = useState<string[]>(['']);

  const addName = () => {
    setNames([...names, '']);
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

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="bottom" className="h-[70vh]">
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center gap-2 text-xl">
            <Users className="w-5 h-5 text-primary" />
            הוספת משתתפים
          </SheetTitle>
        </SheetHeader>
        
        <div className="space-y-4">
          {names.map((name, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={name}
                onChange={(e) => updateName(index, e.target.value)}
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

          <div className="pt-4">
            <Button
              variant="hero"
              size="xl"
              className="w-full"
              onClick={handleConfirm}
              disabled={!names.some(n => n.trim())}
            >
              אישור ({names.filter(n => n.trim()).length} משתתפים)
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AddParticipantsSheet;
