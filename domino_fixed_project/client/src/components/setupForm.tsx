import { useState } from "react";

export const SetupForm = ({ onStart }: any) => {
  const [players, setPlayers] = useState([
    { name: "Игрок 1", isBot: false, botType: null },
    { name: "Игрок 2", isBot: true, botType: "heuristic" },
  ]);
  const addPlayer = () => {
    if (players.length >= 4) return;
    setPlayers([
      ...players,
      {
        name: `Игрок ${players.length + 1}`,
        isBot: true,
        botType: "heuristic",
      },
    ]);
  };
  const removePlayer = (idx: number) => {
    if (players.length <= 2) return;
    setPlayers(players.filter((_, i) => i !== idx));
  };
  const update = (idx: number, patch: any) => {
    const copy = players.slice();
    copy[idx] = { ...copy[idx], ...patch };
    setPlayers(copy);
  };
  return (
    <div className="card">
      <h3>Новая партия</h3>
      {players.map((p, idx) => (
        <div key={idx} className="row" style={{ alignItems: "center" }}>
          <input
            className="input"
            value={p.name}
            onChange={(e) => update(idx, { name: e.target.value })}
          />
          <label>
            <input
              type="checkbox"
              checked={p.isBot}
              onChange={(e) => update(idx, { isBot: e.target.checked })}
            />{" "}
            Бот
          </label>
          <select
            className="input"
            disabled={!p.isBot}
            value={p.botType || "heuristic"}
            onChange={(e) => update(idx, { botType: e.target.value })}
          >
            <option value="heuristic">Эвристика</option>
            <option value="gpt">ChatGPT</option>
          </select>
          <button
            className="btn"
            onClick={() => removePlayer(idx)}
            disabled={players.length <= 2}
          >
            Убрать игрока
          </button>
        </div>
      ))}
      <div className="row">
        <button
          className="btn"
          onClick={addPlayer}
          disabled={players.length >= 4}
        >
          Добавить игрока
        </button>
        <button className="btn" onClick={() => onStart(players)}>
          Начать игру
        </button>
      </div>
      <div className="row">
        <input
          className="input"
          placeholder="OPENAI_API_KEY (опционально)"
          onChange={(e) =>
            localStorage.setItem("OPENAI_API_KEY", e.target.value)
          }
        />
        <small>
          Ключ сохранится локально и будет использован сервером при наличии
        </small>
      </div>
    </div>
  );
};
