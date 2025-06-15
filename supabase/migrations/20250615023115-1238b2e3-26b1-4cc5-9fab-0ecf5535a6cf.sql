
-- เปิดใช้งาน RLS หากยังไม่ได้เปิด
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

-- อนุญาตให้ผู้ใช้ที่เข้าสู่ระบบทุกคน INSERT ข้อมูล staff ได้
CREATE POLICY "Allow authenticated user to insert staff"
  ON public.staff
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- (ทางเลือก) อนุญาตให้ SELECT ได้ด้วย ถ้ายังไม่สามารถดึงรายชื่อพนักงานได้
CREATE POLICY "Allow authenticated user to select staff"
  ON public.staff
  FOR SELECT
  TO authenticated
  USING (true);

