class TagService {
    constructor(knex){
        this.knex = knex;
    }

    searchTag(queryArray) {
        let [tag, limit, offset] = queryArray;
        return this.knex('tags')
            .select('tag_name', 'tag_id')
            .whereRaw(`LOWER(tag_name) LIKE ?`, [`%${tag = tag || ''}%`])
            .limit(limit = limit || 10)
            .offset(offset = offset || 0);
    }
}

module.exports = TagService;