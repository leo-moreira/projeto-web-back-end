class EntidadeBase {
    constructor() {
        this._id = null;
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }
}

module.exports = EntidadeBase;