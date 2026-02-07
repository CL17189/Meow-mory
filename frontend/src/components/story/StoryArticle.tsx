import React, { useMemo, useState } from "react";
import Highlighter from "react-highlight-words";
import "./StoryArticle.css";

type Props = {
  content: string;
  highlightWords: string[]; // 需要高亮的词
  onWordClick?: (word: string) => void;
};

export default function StoryArticle({ content, highlightWords, onWordClick }: Props) {
  const [inclineMode, setInclineMode] = useState(false);

  // 简单的“意群”分割器：按逗号 / 分号 / 长短停顿词 / 句号 / and / but 分割
  const chunks = useMemo(() => {
    // 这是启发式：先按句子标点切，再在每句内按连词切分
    const sentenceSplit = content.split(/([.?!])/).reduce<string[]>((acc, cur, idx, arr) => {
      if (cur === "." || cur === "?" || cur === "!") {
        acc[acc.length - 1] = (acc[acc.length - 1] || "") + cur;
      } else {
        acc.push(cur.trim());
      }
      return acc.filter(Boolean);
    }, []);

    const smallChunks: string[] = [];
    for (const s of sentenceSplit) {
      // 在句子里进一步切
      const parts = s.split(/,\s+|;\s+|\sand\s|\sbut\s/i).map((p) => p.trim()).filter(Boolean);
      for (const p of parts) smallChunks.push(p);
    }

    // 过滤空并返回
    return smallChunks;
  }, [content]);

  return (
    <div className="story-article">
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <input type="checkbox" checked={inclineMode} onChange={() => setInclineMode((s) => !s)} />
          <span>Incline 模式（语义意群显示）</span>
        </label>
      </div>

      {!inclineMode ? (
        <div className="story-read-mode">
          {/* 使用 react-highlight-words 做词高亮 */}
          <Highlighter
            highlightClassName="story-word-highlight"
            searchWords={highlightWords}
            autoEscape={true}
            textToHighlight={content}
            // onWordClick 需要额外处理：react-highlight-words 没有直接提供点击单词回调
            // 所以我们后面用 CSS + 捕获点击事件（delegation）
          />
        </div>
      ) : (
        <div className="story-incline-mode">
          {chunks.map((chunk, idx) => (
            <span key={idx} className="story-chunk" title="hover to zoom">
              {/* 在 chunk 内高亮 target words：简单方式是再次用 Highlighter */}
              <Highlighter
                highlightClassName="story-word-highlight"
                searchWords={highlightWords}
                autoEscape={true}
                textToHighlight={chunk}
                textToHighlightProps={{
                  // 当用户点击高亮的词，会触发 event；捕获并回调 onWordClick
                  onClick: (e: any) => {
                    const target = e.target as HTMLElement;
                    // react-highlight-words 会把高亮词包到 <mark>，class 为 highlightClassName
                    const mark = target.closest?.("mark") ?? (target.tagName === "MARK" ? target : null);
                    const word = mark ? mark.textContent?.trim() : undefined;
                    if (word && onWordClick) onWordClick(word);
                    e.stopPropagation();
                  },
                }}
                textToHighlightRenderer={(parts: string[]) => {
                  // 默认使用库渲染即可
                  return parts;
                }}
              />
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
