import { toast } from "sonner";

/**
 * Single source of truth for "this action needs the backend" feedback.
 * Keeps placeholder messaging identical across every module.
 */
export const notReady = (message: string) => () => toast.info(message);

export const notReadyNow = (message: string) => toast.info(message);
