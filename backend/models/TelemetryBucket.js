

const mongoose = require('mongoose');

const PointSchema = new mongoose.Schema(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    speed: Number,
    heading: Number,
    ts: { type: Date, required: true },
  },
  { _id: false } // no need for a separate _id on every embedded point
);

const TelemetryBucketSchema = new mongoose.Schema({
  vehicleId: { type: String, required: true, index: true },
  // Truncated to the top of the hour, e.g. 2026-07-08T09:00:00Z
  bucketHour: { type: Date, required: true, index: true },
  points: { type: [PointSchema], default: [] },
  pointCount: { type: Number, default: 0 },
});

// Compound index: this is what makes "give me truck X's history for
// this hour" resolve in well under 5ms even with millions of buckets.
TelemetryBucketSchema.index({ vehicleId: 1, bucketHour: 1 }, { unique: true });

TelemetryBucketSchema.statics.appendPoint = function (vehicleId, point) {
  const bucketHour = new Date(point.ts);
  bucketHour.setMinutes(0, 0, 0);

  return this.updateOne(
    { vehicleId, bucketHour },
    {
      $push: { points: point },
      $inc: { pointCount: 1 },
      $setOnInsert: { vehicleId, bucketHour },
    },
    { upsert: true }
  );
};

module.exports = mongoose.model('TelemetryBucket', TelemetryBucketSchema);
