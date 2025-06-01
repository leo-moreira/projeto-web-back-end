const Entidade = require("../entidade/entidade");

class Foto extends Entidade{
    constructor(
        userId,
        albumIds,
        title,
        description,
        filename,
        storageUrl,
        mimeType,
        size,
        tags,
        uploadedAt,
        metadata,
        data
    ) {
        super();
        this.userId = userId;
        this.albumIds = albumIds;
        this.title = title;
        this.description = description;
        this.filename = filename;
        this.storageUrl = storageUrl;
        this.mimeType = mimeType;
        this.size = size;
        this.tags = tags;
        this.uploadedAt = uploadedAt;
        this.metadata = metadata;
        this.data = data;
    }
}

module.exports = Foto;