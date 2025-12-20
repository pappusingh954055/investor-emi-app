export interface Reminder {
  id: number;
  investmentId: number;
  emiNumber: number;  
  investorId?: number;
  emiScheduleItemId: number;    // ✅ NEW FIELD
  reminderDate: string;
  message: string;
  amount: number;
  isSent: boolean;
  status?: string;  
  brokername?: string;
  microFinancer?: string;
  principal?: number;
  investorName?: string;
}
