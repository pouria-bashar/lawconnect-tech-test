type IntakeEntry = {
  question: string;
  answers: string[];
  otherText?: string;
};

let entries: IntakeEntry[] = [];

export function addIntakeEntry(entry: IntakeEntry) {
  entries.push(entry);
}

export function getIntakeEntries(): IntakeEntry[] {
  return [...entries];
}

export function clearIntakeEntries() {
  entries = [];
}
