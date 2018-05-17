class WineService {
    constructor(knex){
        this.knex = knex;
    }

    searchWine(queryArray) {
        let [id, name, limit, offset] = queryArray;
        return this.knex('wines')
            .select('*')
            .whereRaw(`LOWER(wine_name) LIKE ?`, [`${name = name || ''}%`])
            .modify(queryBuilder => {
                if (id) {
                    queryBuilder.andWhere('wines.wine_id', id);
                }
            })
            .limit(limit = limit || 10)
            .offset(offset = offset || 0);
    }

    searchWineByTag(queryArray) {
        let [tags, limit, offset] = queryArray;
        let queryObject = {
            tags: tags ? tags.split(' ') : '',
            tagNumber: tags.split(' ').length - 1 || 0,
            limit: limit || 5,
            offset: offset || 0
        };

        return this.knex.raw(`
            SELECT w.*, count(w.wine_id) as count
            FROM wines w, metadata m, wine_meta wm
            WHERE m.metadata_id = wm.metadata_id
            AND m.tag = ANY(:tags)
            AND w.wine_id = wm.wine_id
            AND w.average_user_rating IS NOT NULL
            GROUP BY w.wine_id
            HAVING COUNT( w.wine_id ) > :tagNumber
            ORDER BY count desc, w.average_user_rating desc
            LIMIT :limit
            OFFSET :offset
        `, queryObject)
            .then(data => data.rows)
            .catch(err => {
                console.log(err);
                throw new Error(err);
            })
    }
}

module.exports = WineService;