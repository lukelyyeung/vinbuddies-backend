const axios = require('axios');
const fs = require('fs');
const fsExtra = require('fs-extra');
const path = require('path');
const { promisify } = require('util');
const EVENT_STATUD = require('../constant/eventConstant');
const readFileAsync = promisify(fsExtra.outputFile);
const deleteFolderAsync = promisify(fsExtra.remove);
const writeFileAsync = promisify(fs.writeFile);

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
                let id = (await this.insertEvent(trx, req.body))[0];

                [galleries, winePhotos] = await Promise.all([
                    this.uploadPhotos(req.files.photos, path.join(__dirname, '../', `store/photos/${id}`)),
                    this.uploadPhotos(req.files.winePhotos, path.join(__dirname, '../', `store/winePhotos/${id}`)),
                ]);

                let wineNames = JSON.parse(req.body.wineNames);
                let participantIds = req.body.participants;
                let participantSet = { participant: participantIds };
                let wineNameSet = { wine_name: wineNames };
                let galleriesSet = { event_photo: galleries };
                let winePhotoSet = { wine_photo: winePhotos };

                let eventParticipantRelation = this.mapToEvent(id, participantSet);
                let eventPhotoRelation = this.mapToEvent(id, galleriesSet);
                let eventWinePhotoRelation = this.mapToEvent(id, wineNameSet, winePhotoSet);

                await this.batchInsertRelation(trx, 'event_participant', eventParticipantRelation);
                await this.batchInsertRelation(trx, 'event_photo', eventWinePhotoSet);
                await this.batchInsertRelation(trx, 'event_wine_photo', winePhotoSet).then(trx.commit);
                
                return {
                    status: 'Posted event successfully.',
                    event_id: id
                };

            })
        } catch (err) {
            console.log(err);
            return { err: 'fucked' };
        }
    }

    async uploadPhotos(files, folder) {
        let photoPaths = [];
        for (const photo of files) {
            let fileName = `${folder}/${new Date().getTime()}.jpg`;
            await writeFileAsync(fileName, photo.buffer, 'binary');
            photoPaths.push(fileName);
        }
        return photoPaths;
    }

    insertEvent(trx, req) {
        let event = {
            event_title: req.title,
            date: req.date,
            description: req.description,
            participant: req.participant,
        }
        return this.knex('events').transacting(trx).insert(event).returning('event_id');
    }

    batchInsertRelation(trx, table, relation) {
        return knex(table).transacting(trx).batchInsert(relation)
    }

    mapToEvent(eventId, ...otherSet) {
        let endArray = [];
        otherSet.forEach((set, index) => {
            let key = Object.keys(set)[0];
            let valueArray = set[key];
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