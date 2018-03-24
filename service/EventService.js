const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

class EventSerive {
    constructor(knex) {
        this.knex = knex;
    }

    async postEvent(req) {
        try {
            await this.knex.transaction(async(trx) => {
                let [id, galleries, winePhotos] = await Promise.all([
                    this.insertEvent(trx, req.body),
                    this.uploadPhotos(req.files.photos, path.join(__dirname, '../', 'store/photos')),
                    this.uploadPhotos(req.files.winePhotos, path.join(__dirname, '../', 'store/winePhotos')),
                ]);

                let wineNames = JSON.parse(req.body.wineNames);
                let participantIds = req.body.participants;
                let participantSet = { participant: participantIds };
                let wineNameSet = { wine_name: wineNames };
                let galleriesSet = { event_photo: galleries };
                let winePhotoSet = { wine_photo: winePhotos };

                let eventParticipantRlation = this.mapToEvent(id, participantSet);
                let eventPhotoRelation = this.mapToEvent(id, galleriesSet);
                let eventWinePhotoRelation = this.mapToEvent(id, wineNameSet, winePhotoSet);
                return {
                    wine: eventWinePhotoRelation,
                    photos: eventPhotoRelation
                }
                await this.batchInsertRelation(trx, 'event_photo', eventWinePhotoRelation);
                return await this.batchInsertRelation(trx, 'event_wine_photo', eventWinePhotoRelation)
                    .then(trx.commit)
                    .then(() => { status: 'Posted event successfully.' });

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
            .catch((err) => { throw new Error() });
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