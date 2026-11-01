export type Hand = {
  id: number;
  session_id: number;
  hole_cards: string | null;
  position: string | null;
  title: string;
  result: number | null;
  notes: string | null;
  created_at: string;
  sessions?: { played_on: string; venues?: { name: string } | null } | null;
};

export const POSITIONS = ["UTG", "UTG+1", "MP", "LJ", "HJ", "CO", "BTN", "SB", "BB", "STR"];

export type HandInput = {
  hole_cards: string;
  position: string;
  title: string;
  result: string;
  notes: string;
};

export type HandErrors = Partial<Record<keyof HandInput, string>>;

export function validateHand(input: HandInput): HandErrors {
  const errors: HandErrors = {};
  if (!input.title.trim()) errors.title = "Give the hand a short title, e.g. \"TT calls a 3-bet\".";
  else if (input.title.length > 80) errors.title = "Keep the title under 80 characters.";
  if (input.result.trim() !== "" && !Number.isFinite(Number(input.result)))
    errors.result = "Result has to be a number, e.g. -250 or 900.";
  return errors;
}
