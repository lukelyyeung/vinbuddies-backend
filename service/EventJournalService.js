const EVENT_STATUS = require('../constant/eventConstant');
const GENERAL_STATUS = require('../constant/generalConstant');

class EventJournalService {
    constructor(knex) {
        this.knex = knex;
    }

    async getJournal(req, queryArray) {
        let [role, limit, offset, title, date, tag, deleted, orderby] = queryArray;
        let {user: {id: userId}} = req;
        return await this.knex.raw(`
            SELECT row_to_json(t)
            FROM (
            SELECT event_id, event_title, date, deleted,
                (
                SELECT array_to_json(array_agg(row_to_json(d)))
                FROM (
                    SELECT photo_path, event_gallery.wine_id, wine_name
                    FROM event_gallery
                    INNER JOIN wines on event_gallery.wine_id = wines.wine_id
                    WHERE event_gallery.event_id=events.event_id
                    AND event_gallery.type='wines'
                ) d ) AS wines,
                (
                SELECT array_to_json(array_agg(row_to_json(d)))
                FROM (
                    SELECT photo_path
                    FROM event_gallery
                    WHERE event_gallery.event_id=events.event_id
                    AND event_gallery.type='gallery'
                ) d ) AS gallery,
                (
                SELECT array_to_json(array_agg(row_to_json(d)))
                FROM (
                    SELECT users.username, users.id, users.picture
                    FROM users
                    INNER JOIN user_event on user_event.user_id = users.id
                    WHERE user_event.event_id=events.event_id
                    AND user_event.role='participant'
                ) d ) AS participants,
                (
                SELECT array_to_json(array_agg(row_to_json(d)))
                FROM (
                    SELECT users.username, users.id, users.picture
                    FROM users
                    INNER JOIN user_event on user_event.user_id = users.id
                    WHERE user_event.event_id=events.event_id
                    AND user_event.role='creator'
                ) d ) AS creator,
                (
                SELECT array_to_json(array_agg(row_to_json(d)))
                FROM (
                    SELECT tags.tag_name, tags.tag_id
                    FROM tags
                    INNER JOIN event_tags on event_tags.tag_id = tags.tag_id
                    WHERE event_tags.event_id=events.event_id
                ) d ) AS tags
            FROM events 
            WHERE events.event_id in (
                SELECT DISTINCT events.event_id 
                FROM events
                LEFT JOIN user_event on events.event_id = user_event.event_id
                LEFT JOIN event_tags on events.event_id = event_tags.event_id
                INNER JOIN tags on tags.tag_id = event_tags.tag_id
                WHERE 1 = 1
                AND CASE WHEN :role != '' THEN user_event.role = :role ELSE 1=1 END
                AND CASE WHEN :userId != '' THEN user_event.user_id = :userId ELSE 1=1 END
                AND CASE WHEN :tag != '' THEN LOWER(tags.tag_name) LIKE :tag ELSE 1=1 END
            )) t
            WHERE 1 = 1
            AND CASE WHEN :date != '1970-01-01T00:00:00' THEN date = :date ELSE 1=1 END
            AND CASE WHEN :deleted != true THEN deleted = false ELSE 1=1 END
            AND CASE WHEN :title != '' THEN LOWER(event_title) LIKE :title ELSE 1=1 END
            ORDER BY CASE WHEN :orderby != '' THEN :orderby ELSE 'date' END
            LIMIT :limit
            OFFSET :offset`
            , {
                role: role || '',
                limit: limit || 10,
                offset: offset || 0,
                userId: userId || '',
                title: title ? `%${title.toLowerCase()}%` : '',
                tag: tag ? `%${tag.toLowerCase()}%` : '',
                orderby: orderby || '',
                deleted: deleted || false,
                date: date || '1970-01-01T00:00:00'
            })
                .then(data => ({
                        status: EVENT_STATUS.GET_SUCCESSFUL,
                        journals : data.rows.map(row => row.row_to_json)
                    }
                ))
                .catch(err => {
                    console.log(err);
                    throw new Error(GENERAL_STATUS.DATABASE_ERROR);
                })
            }
}

module.exports = EventJournalService;