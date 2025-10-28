import mongoose from "mongoose"

// controller which checks different services for their proper work
// and return object with info
export const healthController = async (req, res) => {
  const info = { server: "ok", mongo: "unknown" };

  if (mongoose.connection.readyState !== 1) {
    info.mongo = "disconnected";
  } else {
    try {
      const result = await mongoose.connection.db.admin().ping();
      info.mongo = result.ok === 1 ? "ok" : "failed";
    } catch (err) {
      info.mongo = err.message;
    }
  }

  res.json(info);
};

