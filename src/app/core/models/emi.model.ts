export interface EmiItem {
  paymentNumber: number;
  paymentDate: string;
  emiAmount: number;
  principalComponent: number;
  interestComponent: number;
  remainingPrincipal: number;
}
