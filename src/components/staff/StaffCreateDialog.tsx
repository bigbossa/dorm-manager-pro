
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";

interface StaffCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
}

export const StaffCreateDialog = ({ open, onOpenChange, onCreated }: StaffCreateDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    room_number: "",
    address: "",
    emergency_contact: "",
  });

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({
      ...f,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.first_name || !form.last_name || !form.room_number) {
      toast.error("กรุณากรอกชื่อ นามสกุล และห้องให้ครบถ้วน");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("staff").insert([{
      first_name: form.first_name,
      last_name: form.last_name,
      email: form.email || null,
      phone: form.phone || null,
      room_number: form.room_number,
      address: form.address || null,
      emergency_contact: form.emergency_contact || null
    }]);
    setLoading(false);

    if (error) {
      toast.error("เกิดข้อผิดพลาดในการเพิ่มพนักงาน: " + error.message);
    } else {
      toast.success("เพิ่มข้อมูลพนักงานเรียบร้อยแล้ว");
      setForm({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        room_number: "",
        address: "",
        emergency_contact: "",
      });
      onOpenChange(false);
      onCreated?.();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>เพิ่มพนักงานใหม่</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Input
              name="first_name"
              placeholder="ชื่อ *"
              value={form.first_name}
              onChange={onInputChange}
              required
            />
            <Input
              name="last_name"
              placeholder="นามสกุล *"
              value={form.last_name}
              onChange={onInputChange}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input
              name="email"
              type="email"
              placeholder="อีเมล"
              value={form.email}
              onChange={onInputChange}
            />
            <Input
              name="phone"
              placeholder="เบอร์โทร"
              value={form.phone}
              onChange={onInputChange}
            />
          </div>
          <Input
            name="room_number"
            placeholder="ห้อง *"
            value={form.room_number}
            onChange={onInputChange}
            required
          />
          <Input
            name="emergency_contact"
            placeholder="เบอร์ติดต่อฉุกเฉิน (ถ้ามี)"
            value={form.emergency_contact}
            onChange={onInputChange}
          />
          <Input
            name="address"
            placeholder="ที่อยู่ (ถ้ามี)"
            value={form.address}
            onChange={onInputChange}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              ยกเลิก
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "กำลังบันทึก..." : "เพิ่มพนักงาน"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
