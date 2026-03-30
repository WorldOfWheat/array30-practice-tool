import { useEffect, useMemo, useRef, useState } from "react";

import styles from "@/styles/shortestPractice.module.css";
import * as tableParser from "@/utils/tableParser";

function Introduce() {
  return (
    <div className={`${styles["introduce"]}`}>
      <h2>最簡碼練習</h2>
      <p>
        這個頁面會依照優先權「一級簡碼 → 二級簡碼 → 特殊碼 → 普通碼」判斷每個字的最簡碼。
        <br />
        你可以像線上輸入法一樣直接打碼：當你輸入到「空白或數字」時視為送出。
        <br />
        若你輸入的是同一個字的較長碼（例如開啟一級簡碼卻輸入普通碼），會跳出紅字提醒幾秒後讓你重新輸入。
      </p>
    </div>
  );
}

type Tables = {
  first: Map<string, string[]>;
  second: Map<string, string[]>;
  special: Map<string, string[]>;
  normal: Map<string, string[]>;
};

type ReverseTables = {
  first: Map<string, string[]>;
  second: Map<string, string[]>;
  special: Map<string, string[]>;
  normal: Map<string, string[]>;
};

type CodeLevel = "first" | "second" | "special" | "normal" | "none";

const CODE_LEVEL_PRIORITY: Exclude<CodeLevel, "none">[] = ["first", "second", "special", "normal"];

function isLevelEnabled(options: {
  useFirst: boolean;
  useSecond: boolean;
  useSpecial: boolean;
  useNormal: boolean;
}, level: Exclude<CodeLevel, "none">): boolean {
  switch (level) {
    case "first":
      return options.useFirst;
    case "second":
      return options.useSecond;
    case "special":
      return options.useSpecial;
    case "normal":
      return options.useNormal;
  }
}

function decodeFromAnyTable(reverseTables: ReverseTables, code: string): { level: Exclude<CodeLevel, "none">; character: string } | null {
  const candidates: Array<[Exclude<CodeLevel, "none">, Map<string, string[]>]> = [
    ["first", reverseTables.first],
    ["second", reverseTables.second],
    ["special", reverseTables.special],
    ["normal", reverseTables.normal],
  ];
  for (const [level, table] of candidates) {
    const values = table.get(code);
    if (values && values[0]) return { level, character: values[0] };
  }
  return null;
}

function getEnabledSimplerLevelForCharacter(
  tables: Tables,
  options: { useFirst: boolean; useSecond: boolean; useSpecial: boolean; useNormal: boolean },
  decodedLevel: Exclude<CodeLevel, "none">,
  character: string
): Exclude<CodeLevel, "none"> | null {
  for (const level of CODE_LEVEL_PRIORITY) {
    if (level === decodedLevel) return null;
    if (!isLevelEnabled(options, level)) continue;
    const table = level === "first" ? tables.first
      : level === "second" ? tables.second
        : level === "special" ? tables.special
          : tables.normal;
    if (hasAny(table, character)) return level;
  }
  return null;
}

function reverseTable(original: Map<string, string[]>): Map<string, string[]> {
  const reversed = new Map<string, string[]>();
  for (const [character, codes] of original.entries()) {
    for (const code of codes) {
      if (!reversed.has(code)) {
        reversed.set(code, [character]);
      } else {
        reversed.get(code)!.push(character);
      }
    }
  }
  return reversed;
}

function levelLabel(level: CodeLevel): string {
  switch (level) {
    case "first":
      return "一級簡碼";
    case "second":
      return "二級簡碼";
    case "special":
      return "特殊碼";
    case "normal":
      return "普通碼";
    default:
      return "";
  }
}

function hasAny(table: Map<string, string[]>, key: string): boolean {
  const values = table.get(key);
  return Array.isArray(values) && values.length > 0;
}

function getPrimaryLevel(tables: Tables, options: {
  useFirst: boolean;
  useSecond: boolean;
  useSpecial: boolean;
  useNormal: boolean;
}, character: string): CodeLevel {
  if (options.useFirst && hasAny(tables.first, character)) return "first";
  if (options.useSecond && hasAny(tables.second, character)) return "second";
  if (options.useSpecial && hasAny(tables.special, character)) return "special";
  if (options.useNormal && hasAny(tables.normal, character)) return "normal";
  return "none";
}

function getCodesForLevel(tables: Tables, level: CodeLevel, character: string): string[] {
  switch (level) {
    case "first":
      return tables.first.get(character) ?? [];
    case "second":
      return tables.second.get(character) ?? [];
    case "special":
      return tables.special.get(character) ?? [];
    case "normal":
      return tables.normal.get(character) ?? [];
    default:
      return [];
  }
}

function formatCodes(codes: string[], maxCount: number = 5): string {
  const display = codes
    .slice(0, maxCount)
    .map((c) => c.replace(" ", "[空白]"))
    .join(" | ");
  if (codes.length > maxCount) {
    return `${display} ...`;
  }
  return display;
}

function decodeCode(reverseTables: ReverseTables, options: {
  useFirst: boolean;
  useSecond: boolean;
  useSpecial: boolean;
  useNormal: boolean;
}, code: string): { level: CodeLevel; character: string } | null {
  if (options.useFirst) {
    const values = reverseTables.first.get(code);
    if (values && values[0]) return { level: "first", character: values[0] };
  }
  if (options.useSecond) {
    const values = reverseTables.second.get(code);
    if (values && values[0]) return { level: "second", character: values[0] };
  }
  if (options.useSpecial) {
    const values = reverseTables.special.get(code);
    if (values && values[0]) return { level: "special", character: values[0] };
  }
  if (options.useNormal) {
    const values = reverseTables.normal.get(code);
    if (values && values[0]) return { level: "normal", character: values[0] };
  }
  return null;
}

export default function ShortestPractice() {
  const [useFirst, setUseFirst] = useState(true);
  const [useSecond, setUseSecond] = useState(true);
  const [useSpecial, setUseSpecial] = useState(true);
  const [useNormal, setUseNormal] = useState(true);

  const [tables, setTables] = useState<Tables | null>(null);
  const [reverseTables, setReverseTables] = useState<ReverseTables | null>(null);

  const [codeInput, setCodeInput] = useState<string>("");
  const [outputText, setOutputText] = useState<string>("");
  const [warning, setWarning] = useState<string>("");
  const [inputReadOnly, setInputReadOnly] = useState<boolean>(false);
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);

  const options = useMemo(
    () => ({ useFirst, useSecond, useSpecial, useNormal }),
    [useFirst, useSecond, useSpecial, useNormal]
  );

  useEffect(() => {
    async function load() {
      const [first, second, special, normal] = await Promise.all([
        tableParser.getFirstLevelTable(),
        tableParser.getSecondLevelTable(),
        tableParser.getSpecialCharTable(),
        tableParser.getNormalCharTable(),
      ]);
      const forwardTables: Tables = { first, second, special, normal };
      setTables(forwardTables);
      setReverseTables({
        first: reverseTable(first),
        second: reverseTable(second),
        special: reverseTable(special),
        normal: reverseTable(normal),
      });
    }
    load();
  }, []);

  useEffect(() => {
    return () => {
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current);
      }
    };
  }, []);

  const anyTableEnabled = useFirst || useSecond || useSpecial || useNormal;

  function showWarning(message: string, durationMs: number = 1000) {
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
    }
    setWarning(message);
    setCodeInput("");
    setInputReadOnly(true);
    warningTimerRef.current = setTimeout(() => {
      setWarning("");
      setInputReadOnly(false);
    }, durationMs);
  }

  function tryCommit(code: string) {
    if (!tables || !reverseTables) return;
    if (!anyTableEnabled) {
      showWarning("請至少開啟一種碼表。");
      return;
    }

    // 先用「已勾選」的碼表解碼；失敗再用全部碼表回退解碼。
    // 需求：即使簡碼表 A 未勾選，只要此字不存在於任何「更簡單且已勾選」的碼表，就允許直接輸出。
    let decoded = decodeCode(reverseTables, options, code);
    let decodedFromEnabledTables = true;
    if (!decoded) {
      const fallback = decodeFromAnyTable(reverseTables, code);
      if (fallback) {
        decoded = fallback;
        decodedFromEnabledTables = false;
      }
    }
    if (!decoded) {
      showWarning("無法解析此輸入，請確認碼表是否開啟。", 1500);
      return;
    }

    if (decodedFromEnabledTables) {
      const primary = getPrimaryLevel(tables, options, decoded.character);
      if (primary !== "none" && decoded.level !== primary) {
        const shortestCodes = getCodesForLevel(tables, primary, decoded.character);
        const codeText = formatCodes(shortestCodes);
        if (codeText) {
          showWarning(`請輸入最簡碼（${levelLabel(primary)}）：${codeText}`, 3000);
        } else {
          showWarning(`請輸入最簡碼：此字優先使用「${levelLabel(primary)}」`, 2500);
        }
        return;
      }
    } else {
      const decodedLevel = decoded.level as Exclude<CodeLevel, "none">;
      const requiredLevel = getEnabledSimplerLevelForCharacter(tables, options, decodedLevel, decoded.character);
      if (requiredLevel) {
        const shortestCodes = getCodesForLevel(tables, requiredLevel, decoded.character);
        const codeText = formatCodes(shortestCodes);
        if (codeText) {
          showWarning(`請輸入最簡碼（${levelLabel(requiredLevel)}）：${codeText}`, 3000);
        } else {
          showWarning(`請輸入最簡碼：此字優先使用「${levelLabel(requiredLevel)}」`, 2500);
        }
        return;
      }
    }

    setOutputText((prev) => prev + decoded.character);
    setCodeInput("");
  }

  function handleCodeInputChange(value: string) {
    setCodeInput(value);
    const last = value.charAt(value.length - 1);
    const commitKeys = [" ", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
    if (value.length > 0 && commitKeys.includes(last)) {
      tryCommit(value);
    }
  }

  function handleCodeInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Backspace") return;
    if (inputReadOnly) return;
    if (!tables || !reverseTables) return;
    if (codeInput.length > 0) return;
    if (outputText.length === 0) return;

    e.preventDefault();
    setOutputText((prev) => prev.slice(0, -1));
  }

  return (
    <div className={`d-flex gap-3 flex-column ${styles["container"]}`}>
      <Introduce />

      <div className={`${styles["mode-select"]}`}>
        <h2>模式選擇</h2>
        <p>可自由開關各碼表；輸入時會強制以「最簡碼」為準。</p>

        <div className="d-flex flex-wrap gap-2">
          <button
            className={`btn ${useFirst ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setUseFirst((v) => !v)}
          >
            一級簡碼
          </button>
          <button
            className={`btn ${useSecond ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setUseSecond((v) => !v)}
          >
            二級簡碼
          </button>
          <button
            className={`btn ${useSpecial ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setUseSpecial((v) => !v)}
          >
            特殊碼
          </button>
        </div>

        {!anyTableEnabled && (
          <div className="text-danger mt-2">請至少開啟一種碼表。</div>
        )}
      </div>

      <div className={`${styles["practice"]}`}>
        <h2>輸入區</h2>
        <p className="mb-2">
          在下方輸入框打碼，輸入到「空白或數字」會送出並輸出字元；若不是最簡碼會提示並要求重打。
        </p>

        <div className={`${styles["practice-card-container"]}`}>
          <div className="mb-3">
            <label className="form-label">輸出</label>
            <textarea
              className="form-control"
              rows={6}
              readOnly
              value={outputText}
              placeholder="這裡會顯示你送出的文字"
            />
            <div className="d-flex gap-2 mt-2">
              <button className="btn btn-outline-danger" onClick={() => setOutputText("")}>清空輸出</button>
              <button className="btn btn-outline-secondary" onClick={() => setCodeInput("")}>清空輸入</button>
            </div>
          </div>

          <div>
            <label className="form-label">輸入碼</label>
            {warning && <div className="text-danger mb-2">{warning}</div>}
            <input
              className="form-control"
              value={codeInput}
              readOnly={inputReadOnly || !tables || !reverseTables}
              onChange={(e) => handleCodeInputChange(e.target.value)}
              onKeyDown={handleCodeInputKeyDown}
              placeholder={!tables ? "表格載入中..." : "輸入碼（以空白或數字結尾送出）"}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
