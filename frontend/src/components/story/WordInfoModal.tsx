import React, { useEffect, useState } from "react";

export default function WordInfoModal({ word, onClose }: { word: string | null; onClose: () => void }) {
  const [definition, setDefinition] = useState<string | null>(null);

  useEffect(() => {
    if (!word) return;
    // mock 词典查询：生产请接入实际 API（例如 dictionaryapi.dev 或你自己的后端）
    // 这里模拟异步请求
    setDefinition(null);
    const t = setTimeout(() => {
      setDefinition(`Definition mock for "${word}". (这里替换为真实词典 API 返回内容)`);
    }, 400);
    return () => clearTimeout(t);
  }, [word]);

  if (!word) return null;

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "rgba(0,0,0,0.4)",
      zIndex: 9999
    }}>
      <div style={{ background: "#fff", padding: 20, borderRadius: 8, width: 420 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center"}}>
          <h3 style={{ margin: 0 }}>{word}</h3>
          <button onClick={onClose}>Close</button>
        </div>

        <div style={{ marginTop: 12 }}>
          {definition ? <p>{definition}</p> : <p>Loading definition…</p>}
        </div>
      </div>
    </div>
  );
}
