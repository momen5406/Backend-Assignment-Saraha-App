export class DBRepository {
  model;

  constructor(model) {
    this.model = model;
  }

  async create(item) {
    const doc = new this.model(item);
    return await doc.save();
  }

  async update(filter, update, options = {}) {
    return await this.model.findOneAndUpdate(filter, update, options);
  }

  async findOne(filter, projection = {}, options = {}) {
    return await this.model.findOne(filter, projection, options);
  }

  async getAll(filter, projection = {}, options = {}) {
    return await this.model.find(filter, projection, options);
  }

  async deleteOne(filter) {
    return await this.model.deleteOne(filter);
  }
}
