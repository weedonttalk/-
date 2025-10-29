import { Line } from "./line";
import { Tile } from "./tile";

export const BoardView = ({ board }: any) => {
  return (
    <div className="grid-board">
      <div className="center">
        <div className="section-title">Центр</div>
        <div className="stack">
          {board.center ? (
            <Tile p={board.center[0]} q={board.center[1]} />
          ) : (
            <span className="small">порожньо</span>
          )}
        </div>
      </div>
      <div className="up">
        <Line title="Вгору" tiles={board.U} />
      </div>
      <div className="left">
        <Line title="Вліво" tiles={board.L} />
      </div>
      <div className="right">
        <Line title="Вправо" tiles={board.R} />
      </div>
      <div className="down">
        <Line title="Вниз" tiles={board.D} />
      </div>
    </div>
  );
};
