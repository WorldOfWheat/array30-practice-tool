function getKey(line: string): string {
  return line.split("\t")[1].replace("\r", "").replace("\n", "");
}

function getValue(line: string, enterKey: string): string {
  return line.split("\t")[0] + enterKey;
}
function handleTabSplitTable(lines: string[]): Map<string, string[]> {
  const table = new Map<string, string[]>();

  function addToTable(key: string, value: string) {
    if (table.has(key)) {
      table.get(key)?.push(value);
    } else {
      table.set(key, [value]);
    }
  }

  let characterCounter = 1;
  let lastChar = "";
  for (const line of lines) {
    if (line.trim() === "") continue; // skip empty lines
    if (lastChar === "") {
      lastChar = line.split("\t")[0];
      const key = getKey(line);
      const value = getValue(line, (characterCounter % 10).toString());
      addToTable(key, value);
    } else {
      const character = line.split("\t")[0];
      if (character === lastChar) {
        characterCounter++;
      } else {
        characterCounter = 1;
      }

      const key = getKey(line);
      const value = getValue(line, (characterCounter % 10).toString());
      addToTable(key, value);
      lastChar = character;
    }
  }

  return table;
}

function reverseMap(originalMap: Map<string, string[]>): Map<string, string[]> {
  const reversedMap = new Map<string, string[]>();

  for (const [key, values] of originalMap.entries()) {
    for (const value of values) {
      if (reversedMap.has(value)) {
        reversedMap.get(value)?.push(key);
      } else {
        reversedMap.set(value, [key]);
      }
    }
  }

  return reversedMap;
}

export async function getFirstLevelTable(reverse: boolean = false): Promise<Map<string, string[]>> {
  const file = await fetch("/1.txt");
  const text = await file.text();
  const lines = text.split("\n");
  const handleTabSplitTableResult = handleTabSplitTable(lines);
  if (reverse) {
    return reverseMap(handleTabSplitTableResult);
  }

  return handleTabSplitTable(lines);
}

export async function getSecondLevelTable(reverse: boolean = false): Promise<Map<string, string[]>> {
  const file = await fetch("/2.txt");
  const text = await file.text();
  const lines = text.split("\n");
  if (reverse) {
    return reverseMap(handleTabSplitTable(lines));
  }
  return handleTabSplitTable(lines);
}

export async function getSpecialCharTable(): Promise<Map<string, string[]>> {
  const table = new Map<string, string[]>();
  const file = await fetch("/3.txt");
  const text = await file.text();
  const lines = text.split("\n");
  for (const line of lines) {
    if (line.trim() === "") continue; // skip empty lines
    const key = getKey(line);
    const value = getValue(line, ' ');
    table.set(key, [value]);
  }
  return table;
}

export async function getNormalCharTable(): Promise<Map<string, string[]>> {
  const file = await fetch("/4.txt");
  const text = await file.text();
  const lines = text.split("\n");
  return handleTabSplitTable(lines);
}
