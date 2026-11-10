export type StudioToolKey = "pricing_benchmark" | "visibility_scorecard";
export type StudioToolReceipt = { submissionId: string; submissionKey: string };
export declare function storePendingStudioReceipt(
  toolKey: StudioToolKey, submissionId: string, submissionKey: string
): boolean;
export declare function readPendingStudioReceipt(toolKey: StudioToolKey): StudioToolReceipt | null;
export declare function clearPendingStudioReceipt(toolKey: StudioToolKey): void;
