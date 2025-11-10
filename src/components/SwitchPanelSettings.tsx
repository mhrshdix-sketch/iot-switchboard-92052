import { useState } from 'react';
import { SwitchPanel } from '@/types/mqtt';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface SwitchPanelSettingsProps {
  switchPanel: SwitchPanel;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (updates: Partial<SwitchPanel>) => void;
}

const sizeOptions = [
  { value: 'sm', label: 'کوچک' },
  { value: 'md', label: 'متوسط' },
  { value: 'lg', label: 'بزرگ' },
  { value: 'xl', label: 'خیلی بزرگ' },
];

const emojiPresets: string[] = [];

export const SwitchPanelSettings = ({
  switchPanel,
  open,
  onOpenChange,
  onUpdate,
}: SwitchPanelSettingsProps) => {
  const [size, setSize] = useState<string>(switchPanel.size || 'md');
  const [icon, setIcon] = useState(switchPanel.icon || '💡');
  const [colorOn, setColorOn] = useState(switchPanel.colorOn || '#22c55e');
  const [colorOff, setColorOff] = useState(switchPanel.colorOff || '#64748b');

  const handleSave = () => {
    onUpdate({
      size: size as 'sm' | 'md' | 'lg' | 'xl',
      icon,
      colorOn,
      colorOff,
    });
    toast.success('تنظیمات با موفقیت ذخیره شد');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>تنظیمات پنل</DialogTitle>
          <DialogDescription>
            تنظیمات ظاهری پنل {switchPanel.name} را تغییر دهید
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>اندازه دکمه</Label>
            <Select value={size} onValueChange={setSize}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sizeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>ایموجی دکمه</Label>
            <Input
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="ایموجی دلخواه خود را وارد کنید..."
              className="text-2xl text-center h-16"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>رنگ روشن</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={colorOn}
                  onChange={(e) => setColorOn(e.target.value)}
                  className="w-full h-10 cursor-pointer"
                />
                <Input
                  type="text"
                  value={colorOn}
                  onChange={(e) => setColorOn(e.target.value)}
                  className="w-24"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>رنگ خاموش</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={colorOff}
                  onChange={(e) => setColorOff(e.target.value)}
                  className="w-full h-10 cursor-pointer"
                />
                <Input
                  type="text"
                  value={colorOff}
                  onChange={(e) => setColorOff(e.target.value)}
                  className="w-24"
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            انصراف
          </Button>
          <Button onClick={handleSave} className="gradient-primary text-white">
            ذخیره تغییرات
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
