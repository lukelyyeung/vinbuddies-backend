const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const { promisify } = require('util');
const EVENT_STATUS = require('../constant/eventConstant');
const readFileAsync = promisify(fs.readFile);
const deleteFolderAsync = fs.remove;
const writeFileAsync = promisify(fs.outputFile);

class EventSerive {
    constructor(knex) {
        this.knex = knex;
    }

    async postEvent(req) {
        let galleries = [];
        let winePhotos = [];
        let id = 0
        try {
            await this.knex.transaction(async (trx) => {
                id = (await this.insertEvent(trx, req))[0];

                [galleries, winePhotos] = await Promise.all([
                    this.uploadPhotos(req.files.photos, path.join(__dirname, '../', `store/photos/${id}`)),
                    this.uploadPhotos(req.files.winePhotos, path.join(__dirname, '../', `store/winePhotos/${id}`)),
                ]);

                let wineNames = JSON.parse(req.body.wineNames);
                let participantIds = JSON.parse(req.body.participants);
                let participantSet = { participant_id: participantIds };
                let wineNameSet = { wine_name: wineNames };
                let galleriesSet = { gallery_path: galleries };
                let winePhotoSet = { wine_photo_path: winePhotos };

                let eventParticipantSet = this.mapObjectToEvent(id, participantSet);
                let eventGallerySet = this.mapObjectToEvent(id, galleriesSet);
                let eventWinePhotoSet = this.mapObjectToEvent(id, wineNameSet, winePhotoSet);

                await this.batchInsertRelation(trx, 'event_participant', eventParticipantSet);
                await this.batchInsertRelation(trx, 'event_gallery', eventGallerySet);
                await this.batchInsertRelation(trx, 'event_wine', eventWinePhotoSet).then(trx.commit);

            });

            return {
                status: 'Posted event successfully.',
                event_id: id
            };

        } catch (err) {
            await deleteFolderAsync(path.join(__dirname, '../', `store/winePhotos/${id}`));
            await deleteFolderAsync(path.join(__dirname, '../', `store/photos/${id}`));
            if (err.message === EVENT_STATUS.SERVER_ERROR || err.message === EVENT_STATUS.SERVER_ERROR) {
                throw new Error(err.message);
            }
            console.log(err);
            return { err: 'fucked' };
        }
    }

    async getEvent(eventId, req) {
        let eventInfo = await this.knex.first('*')
            .from('events')
            .where('events.event_id', eventId);

        let participantList = await this.knex.select([
            'participant.id as participant_id',
            'participant.name as participant_name',
        ])
            .from('events')
            .join('event_participant', 'event_participant.event_id', 'events.event_id')
            .join('users as participant', 'participant.id', 'event_participant.participant_id')
            .where('events.event_id', eventId);

        if (req.user.id === eventInfo.creator_id || !(participantList.some(e => req.user.id === e.participant_id))) {
            throw new Error(EVENT_STATUS.NOT_AUTHORIZED);
        }

        let galleries = await this.knex.select('event_gallery.gallery_path')
            .from('events')
            .join('event_gallery', 'events.event_id', 'event_gallery.event_id')
            .where('events.event_id', eventId)

        let winePhotos = await this.knex.select(['event_wine.wine_name', 'event_wine.wine_photo_path'])
            .from('events')
            .join('event_wine', 'events.event_id', 'event_wine.event_id')
            .where('events.event_id', eventId)

        participantList.forEach(e => {
            eventInfo['participant'] = eventInfo['participant'] || [];
            eventInfo['participant'].push({ id: e.participant_id, name: e.participant_name })
        });

        winePhotos.forEach(e => {
            eventInfo['wine'] = eventInfo['wine'] || [];
            eventInfo['wine'].push({ name: e.wine_name, photo: e.wine_photo_path });
        });

        galleries.forEach(e => {
            eventInfo['gallery'] = eventInfo['gallery'] || [];
            eventInfo['gallery'].push(e.gallery_path);
        });

        return eventInfo;

    }

    async deleteEvent(eventId, req) {
        try {

            await this.knex.transaction(async (trx) => {

                let creator_id = await this.knex('events').transaction(trx).first('creator_id').where('event_id', eventId);
                if (creator_id !== req.user.id) {
                    throw new Error(EVENT_STATUS.NOT_AUTHORIZED);
                }
                await this.knex('event_participant').transaction(trx).where('event_id', eventId).del();
                await this.knex('event_wine').transaction(trx).where('event_id', eventId).del();
                await this.knex('event_gallery').transaction(trx).where('event_id', eventId).del().then(trx.commit);
            })
        } catch (err) {
            console.log(err);
            throw new Error(EVENT_STATUS.SERVER_ERROR);
        }
        try {

            await Promise.all([
                deleteFolderAsync(path.join(__dirname, '../', `store/photos/${eventId}`)),
                deleteFolderAsync(path.join(__dirname, '../', `store/winePhotos/${eventId}`))
            ]);
        } catch (err) {
            console.log(err);
            throw new Error(EVENT_STATUS.DELETE_FAIL);
        }
        return { status: EVENT_STATUS.DELETE_SUCCESSFUL }
    }

    async uploadPhotos(files, folder) {
        let photoPaths = [];
        if (typeof files !== 'undefined') {
            try {

                for (const photo of files) {
                    let fileName = `${folder}/${new Date().getTime()}.jpg`;
                    await writeFileAsync(fileName, photo.buffer, 'binary');
                    photoPaths.push(fileName);
                }
            } catch (err) {
                console.log(err);
                throw new Error(EVENT_STATUS.UPLOAD_FAIL);
            }
        }
        return photoPaths;
    }

    insertEvent(trx, req) {
        let event = {
            creator_id: req.user.id,
            event_title: req.body.title,
            date: req.body.date,
            description: req.body.description,
        }
        return this.knex('events')
            .transacting(trx)
            .insert(event)
            .returning('event_id')
            .catch(err => {
                console.log(err);
                throw new Error(EVENT_STATUS.SERVER_ERROR);
            })
    }

    batchInsertRelation(trx, table, relation, chunk = 10) {
        return this.knex
            .batchInsert(table, relation, chunk)
            .transacting(trx)
            .catch(err => {
                console.log(err);
                throw new Error(EVENT_STATUS.SERVER_ERROR);
            })
    }

    mapObjectToEvent(eventId, ...otherSet) {
        let endArray = [];
        otherSet.forEach((set, index) => {
            let key = Object.keys(set)[0];
            let valueArray = set[key];
            console.log(key);
            console.log(typeof valueArray);
            valueArray.forEach((value, index) => {
                endArray[index] = endArray[index] || {};
                endArray[index][key] = value;
            });
            endArray.map(e => e['event_id'] = eventId);
        });
        return endArray;
    }
}

module.exports = EventSerive;