import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

interface AuditLogParams {
  tableName: string;
  actionType: 'view' | 'query' | 'export' | 'update' | 'delete';
  queryContext?: string;
  recordCount?: number;
  filters?: Record<string, string | number | boolean | null>;
}

export async function logAdminAccess({
  tableName,
  actionType,
  queryContext,
  recordCount,
  filters = {}
}: AuditLogParams): Promise<string | null> {
  try {
    const { data, error } = await supabase.rpc('log_admin_access', {
      p_table_name: tableName,
      p_action_type: actionType,
      p_query_context: queryContext || null,
      p_record_count: recordCount || null,
      p_filters: filters as Json
    });

    if (error) {
      console.error('Failed to log admin access:', error);
      return null;
    }

    return data as string;
  } catch (err) {
    console.error('Error logging admin access:', err);
    return null;
  }
}

export function useAdminAuditLog() {
  const logAccess = async (params: AuditLogParams) => {
    return logAdminAccess(params);
  };

  return { logAccess };
}
