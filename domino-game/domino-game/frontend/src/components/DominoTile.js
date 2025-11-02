import React from 'react';
import './DominoTile.css';

function DominoTile({ tile }) {
  const renderDots = (number) => {
    const positions = {
      0: [],
      1: [4],
      2: [0, 8],
      3: [0, 4, 8],
      4: [0, 2, 6, 8],
      5: [0, 2, 4, 6, 8],
      6: [0, 2, 3, 5, 6, 8]
    };

    return (
      <div className="domino-half">
        {positions[number]?.map((pos, index) => (
          <div key={index} className={`dot pos-${pos}`}></div>
        ))}
      </div>
    );
  };

  return (
    <div className="domino-tile">
      {renderDots(tile[0])}
      <div className="domino-divider"></div>
      {renderDots(tile[1])}
    </div>
  );
}

export default DominoTile;
