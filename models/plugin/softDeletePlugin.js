export function softDeletePlugin(schema, options = {}) {
  const opts = {
    deletedField: 'isDelete',
    deletedValue: true,
    indexFields: true,
    ...options
  };

  // Add soft delete field
  const schemaAdd = {};
  schemaAdd[opts.deletedField] = {
    type: Boolean,
    default: false,
    index: opts.indexFields
  };
  schema.add(schemaAdd);

  // Add deletedAt timestamp
  schema.add({
    deletedAt: { type: Date, default: null }
  });

  // Query middleware
  schema.pre(/^find/, function (next) {
    if (!this.getOptions().includeDeleted) {
      const filter = {};
      filter[opts.deletedField] = { $ne: opts.deletedValue };
      this.where(filter);
    }
    next();
  });

  // Aggregate middleware
  schema.pre("aggregate", function (next) {
    if (!this.getOptions().includeDeleted) {
      const matchStage = {};
      matchStage[opts.deletedField] = { $ne: opts.deletedValue };
      this.pipeline().unshift({ $match: matchStage });
    }
    next();
  });

  // Instance methods
  schema.methods.softDelete = function (callback) {
    this[opts.deletedField] = opts.deletedValue;
    this.deletedAt = new Date();
    return callback ? this.save(callback) : this.save();
  };

  schema.methods.restore = function (callback) {
    this[opts.deletedField] = false;
    this.deletedAt = null;
    return callback ? this.save(callback) : this.save();
  };

  schema.methods.isDeleted = function () {
    return this[opts.deletedField] === opts.deletedValue;
  };

  // Static methods
  schema.statics.findDeleted = function (conditions = {}) {
    return this.find({ ...conditions, [opts.deletedField]: opts.deletedValue });
  };

  schema.statics.findWithDeleted = function (conditions = {}) {
    return this.find(conditions).setOptions({ includeDeleted: true });
  };

  schema.statics.softDeleteById = function (id, callback) {
    const update = {
      [opts.deletedField]: opts.deletedValue,
      deletedAt: new Date()
    };
    return callback
      ? this.updateOne({ _id: id }, update, callback)
      : this.updateOne({ _id: id }, update);
  };

  schema.statics.restoreById = function (id, callback) {
    const update = {
      [opts.deletedField]: false,
      deletedAt: null
    };
    return callback
      ? this.updateOne({ _id: id }, update, callback)
      : this.updateOne({ _id: id }, update);
  };
}
