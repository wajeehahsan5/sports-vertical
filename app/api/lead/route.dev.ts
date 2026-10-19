// Dev only (`npm run dev`): the live site calls the Supabase Edge Function instead. See lib/server/handlers.ts.
import { handleLead } from "@/lib/server/handlers";

export const POST = handleLead;
