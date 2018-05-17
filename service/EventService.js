const fs = require('fs-extra');
const path = require('path');
const sha1 = require('sha1');
const mapObjectToKeys = require('../utils/mapObjectToKeys');
const { batchInsert, batchReinsert } = require('../utils/batchInsertTransacting');
const fileType = require('file-type');
const { promisify } = require('util');
const EVENT_STATUS = require('../constant/eventConstant');
const GENERAL_STATUS = require('../constant/generalConstant');
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.outputFile);
const deleteFileAsync = fs.remove;
const acceptedFileType = ['jpg', 'png', 'jpeg'];

class EventService {
    constructor(knex) {
        this.knex = knex;
    }

    async postEvent(req) {
        let { user, body: { wines, tags, participants, photos, winePhotos } } = req;
        let eventId, wineIds, tagIds, participantIds;
        try {
            await this.knex.transaction(async (trx) => {
                eventId = (await this.insertEvent(trx, req))[0];

                [wineIds, tagIds, participantIds] = await Promise.all([
                    this.register(trx, wines, 'wines', 'wine_name', 'wine_id'),
                    this.register(trx, tags, 'tags', 'tag_name', 'tag_id'),
                    this.register(trx, participants, 'users', 'username', 'id')
                ]);

                let [eventTag, eventGallery, eventParticipant] = this.relationMapping(eventId, user.id, tagIds, wineIds, photos, winePhotos, participantIds);
                await Promise.all([
                    batchInsert(this.knex, trx, 'user_event', eventParticipant),
                    batchInsert(this.knex, trx, 'event_tags', eventTag),
                    batchInsert(this.knex, trx, 'event_gallery', eventGallery)
                ]).then(trx.commit);

            });

            return {
                status: 'Posted event successfully.',
                event_id: eventId
            };

        } catch (err) {
            if (err.message === GENERAL_STATUS.DATABASE_ERROR) {
                throw new Error(err.message);
            }
            console.log(err);
            return { err: GENERAL_STATUS.UNKNOWN_ERROR };
        }
    }

    async getEvent(eventId, req) {

        let eventInfo = await this.knex.raw(`
            select row_to_json(t)
            from (
                select event_id, event_title, description , date, deleted,
                (
                    select array_to_json(array_agg(row_to_json(d)))
                    from (
                    select photo_path
                    from event_gallery
                    where event_gallery.event_id=events.event_id
                    And event_gallery.type='gallery'
                    ) d
                ) as gallery,
                (
                    select array_to_json(array_agg(row_to_json(d)))
                    from (
                    select photo_path, event_gallery.wine_id, wine_name
                    from event_gallery
                    inner join wines on event_gallery.wine_id = wines.wine_id
                    where event_gallery.event_id=events.event_id
                    And event_gallery.type='wine'
                    ) d
                ) as wines,
                (
                    select array_to_json(array_agg(row_to_json(d)))
                    from (
                    select users.username, users.id, users.picture
                    from users
                    inner join user_event on user_event.user_id = users.id
                    where user_event.event_id=events.event_id
                    And user_event.role='participant'
                    ) d
                ) as participants,
                    (
                    select array_to_json(array_agg(row_to_json(d)))
                    from (
                    select users.username, users.id, users.picture
                    from users
                    inner join user_event on user_event.user_id = users.id
                    where user_event.event_id=events.event_id
                    And user_event.role='creator'
                    ) d
                ) as creator,
                (
                    select array_to_json(array_agg(row_to_json(d)))
                    from (
                    select tags.tag_name, tags.tag_id
                    from tags
                    inner join event_tags on event_tags.tag_id = tags.tag_id
                    where event_tags.event_id=events.event_id
                    ) d
                ) as tags
                from events 
                WHERE events.event_id = ?
                AND events.deleted = false
            ) t`, [eventId]
        )
        .then(data => {
            if (!data.rows[0]) {
                throw new Error(EVENT_STATUS.NOT_FOUND);
            }
            return data.rows[0].row_to_json;
        });
        if (req.user.id !== eventInfo.creator.id && !(eventInfo.participants.some(e => e.id = req.user.id))) {
            throw new Error(EVENT_STATUS.NOT_AUTHORIZED);
        }

        return {
            status: EVENT_STATUS.GET_SUCCESSFUL,
            event: eventInfo
        };
    }

    async deleteEvent(eventId, req) {
        try {

            let user = await this.isCreator(req.user.id, eventId);
            
            if (typeof user === 'undefined' || user.role !== 'creator') {
                throw new Error(GENERAL_STATUS.NOT_AUTHORIZED);
            }
            let deleted = await this.knex('events').where('event_id', eventId).update({ deleted: true });
            if (deleted <= 0) {
                throw new Error(EVENT_STATUS.DELETE_FAIL);
            }

        } catch (err) {
            console.log(err);
            throw new Error(GENERAL_STATUS.DATABASE_ERROR);
        }
        return { status: EVENT_STATUS.DELETE_SUCCESSFUL }
    }

    async updateEvent(eventId, req) {
        let creator = await this.isCreator(req.user.id, eventId);

        if (typeof creator === 'undefined' || creator.role !== 'creator') {
            throw new Error(GENERAL_STATUS.NOT_AUTHORIZED);
        }

        let event = {
            event_title: req.body.title,
            date: req.body.date,
            description: req.body.description,
            deleted: req.body.deleted
        }

        let { user, body: { wine, tags, participants, photos, winePhotos } } = req;
        let wineIds, tagIds, participantIds;
        try {
            await this.knex.transaction(async (trx) => {
                await this.knex('events').update(event).where('event_id', eventId);

                [wineIds, tagIds, participantIds] = await Promise.all([
                    this.register(trx, wine, 'wines', 'wine_name', 'wine_id'),
                    this.register(trx, tags, 'tags', 'tag_name', 'tag_id'),
                    this.register(trx, participants, 'users', 'username', 'id')
                ]);

                let [eventTag, eventGallery, eventParticipant] = this.relationMapping(eventId, req.user.id, tagIds, wineIds, photos, winePhotos, participantIds);

                await Promise.all([
                    batchReinsert(this.knex, trx, 'user_event', { event_id: eventId }, eventParticipant),
                    batchReinsert(this.knex, trx, 'event_tags', { event_id: eventId }, eventTag),
                    batchReinsert(this.knex, trx, 'event_gallery', { event_id: eventId }, eventGallery)
                ]).then(trx.commit);

            });
            
            return { status: EVENT_STATUS.UPDATE_SUCCESSFUL };

        } catch (err) {
            if (err.message === GENERAL_STATUS.DATABASE_ERROR) {
                throw new Error(err.message);
            }
            console.log(err);
            return { err: GENERAL_STATUS.UNKNOWN_ERROR };
        }
    }

    async register(trx, dataArray, table, column, dataReturn) {
        let registeredArray = [];
        for (const data of dataArray) {
            if (typeof data !== 'string') {
                registeredArray.push(data);
            } else {

                if (table === 'users') {
                    await trx.raw(`
                    WITH new_row AS (
                        INSERT INTO ${table} (${column}, provider, role)
                        SELECT '${data}', 'event', 'anonymous'
                        WHERE NOT EXISTS (SELECT ${dataReturn} FROM ${table} 
                            WHERE ${column} = '${data}'
                            AND role = 'anonymous'
                        )
                        RETURNING ${dataReturn}
                    )
                    SELECT ${dataReturn} FROM new_row
                    UNION
                    SELECT ${dataReturn} FROM ${table} WHERE ${column} = '${data}';
                    `)
                        .then(result => registeredArray.push(result.rows[0][dataReturn]));

                } else {

                    await trx.raw(`
                    WITH new_row AS (
                        INSERT INTO ${table} (${column})
                        SELECT '${data}'
                        WHERE NOT EXISTS (SELECT ${dataReturn} FROM ${table} WHERE ${column} = '${data}')
                        RETURNING ${dataReturn}
                    )
                    SELECT ${dataReturn} FROM new_row
                    UNION
                    SELECT ${dataReturn} FROM ${table} WHERE ${column} = '${data}';
                    `)
                        .then(result => registeredArray.push(result.rows[0][dataReturn]));
                }
            }
        }
        return registeredArray;
    }

    insertEvent(trx, req) {
        let event = {
            event_title: req.body.title,
            date: req.body.date,
            description: req.body.description
        }

        return this.knex('events')
            .transacting(trx)
            .insert(event)
            .returning('event_id')
            .catch(err => {
                console.log(err);
                throw new Error(GENERAL_STATUS.NOT_AUTHORIZED);
            })
    }

    relationMapping(eventId, creatorId, tagIds, wineIds, photos, winePhotos, participantIds) {
        let tagIdSet = { tag_id: tagIds };
        let wineIdSet = { wine_id: wineIds };
        let photoSet = { photo_path: photos };
        let winePhotoSet = { photo_path: winePhotos };
        let participantSet = { user_id: participantIds };

        let eventParticipant = mapObjectToKeys({ event_id: eventId, role: 'participant' }, participantSet)
            .concat({ event_id: eventId, user_id: creatorId, role: 'creator' });
        let eventTag = mapObjectToKeys({ event_id: eventId }, tagIdSet);
        let eventPhoto = mapObjectToKeys({ event_id: eventId, type: 'gallery' }, photoSet);
        let eventWinePhoto = mapObjectToKeys({ event_id: eventId, type: 'wine' }, winePhotoSet, wineIdSet);

        let eventGallery = eventPhoto.concat(eventWinePhoto);
        return [eventTag, eventGallery, eventParticipant];
    }

    async isCreator(userId, eventId) {
        let user = await this.knex('user_event').first('role')
            .where({
                event_id: eventId,
                user_id: userId
            });
        return user;
    }
}

module.exports = EventService;