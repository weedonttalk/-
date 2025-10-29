import { Tile } from "./tile";

export const Line = ({ title, tiles }: any) => {
  return (
    <div className="stack">
      <span className="badge">{title}</span>
      {tiles.map((t: any, i: number) => (
        <Tile key={i} p={t[0]} q={t[1]} />
      ))}
    </div>
  );
};
