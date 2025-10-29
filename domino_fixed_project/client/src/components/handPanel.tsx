import { Tile } from "./tile";

export const HandPanel = ({ hand, selectedIndex, onSelect }: any) => {
  return (
    <div>
      <div className="section-title">Рука активного гравця</div>
      <div className="stack">
        {hand?.map((t: any, i: number) => (
          <Tile
            key={i}
            p={t[0]}
            q={t[1]}
            selected={selectedIndex === i}
            onClick={() => onSelect(i)}
          />
        ))}
      </div>
      <div className="small" style={{ marginTop: 6 }}>
        Оберіть кістку, далі натисніть напрям.
      </div>
    </div>
  );
};
