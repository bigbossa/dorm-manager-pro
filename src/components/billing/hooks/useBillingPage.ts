import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/providers/AuthProvider";

interface BillingRecord {
  id: string;
  billing_month: string;
  room_rent: number;
  water_units: number;
  water_cost: number;
  electricity_units: number;
  electricity_cost: number;
  total_amount: number;
  status: string;
  due_date: string;
  paid_date: string | null;
  created_at: string;
  rooms: {
    room_number: string;
  };
  tenants: {
    first_name: string;
    last_name: string;
  };
}

export const useBillingPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [billings, setBillings] = useState<BillingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCalculationDialog, setShowCalculationDialog] = useState(false);

  useEffect(() => {
    fetchBillings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // Refetch when user changes

  const fetchBillings = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from('billing')
        .select(`
          id,
          billing_month,
          room_rent,
          water_units,
          water_cost,
          electricity_units,
          electricity_cost,
          total_amount,
          status,
          due_date,
          paid_date,
          created_at,
          rooms (
            room_number
          ),
          tenants (
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false });

      // ถ้าเป็น tenant ดึงมาเฉพาะบิลของตัวเอง
      if (user?.role === "tenant" && user?.tenant?.id) {
        query = query.eq('tenant_id', user.tenant.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching billings:', error);
        toast({
          title: "Error",
          description: "Failed to fetch billing records",
          variant: "destructive",
        });
        return;
      }

      setBillings(data || []);
    } catch (err) {
      console.error('Error in fetchBillings:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredBillings = billings.filter(billing => {
    const matchesSearch = 
      billing.tenants.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      billing.tenants.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      billing.rooms.room_number.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || billing.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleMarkAsPaid = async (billingId: string) => {
    try {
      const { error } = await supabase
        .from('billing')
        .update({ 
          status: 'paid',
          paid_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', billingId);

      if (error) {
        console.error('Error updating billing status:', error);
        toast({
          title: "Error",
          description: "Failed to update payment status",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Payment Updated",
        description: "Billing marked as paid successfully",
      });

      fetchBillings();
    } catch (err) {
      console.error('Error in handleMarkAsPaid:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    billings,
    filteredBillings,
    loading,
    showCalculationDialog,
    setShowCalculationDialog,
    fetchBillings,
    handleMarkAsPaid
  };
};
