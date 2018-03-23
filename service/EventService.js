const axios = require('axios');
const fs = require('fs');
const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

class EventSerive {
    constructor(knex) {
        this.knex = knex;
    }

    async postEvent(req) {
        try {
            let [id, galleries, winePhotos] = await Promise.all([
                this.insertEvent(req.body),
                this.uploadPhotos(req.files.photos, '/photos'),
                this.uploadPhotos(req.files.winePhotos, '/winePhotos'),
            ]);

            let wineIds = JSON.parse(req.body.wineIds);
            let wineNames = JSON.parse(req.body.wineNames);
            let wineKey = { wine_id: wineIds };
            let wineNameKey = { wine_name: wineNames };
            let winePhotoKey = { wine_photo: winePhotos };
            
            // let event_photo = this.mapToEvent(id, )
            let eventWinePhotoRelation = this.mapToEvent(id, wineKey, wineNameKey, winePhotoKey);
            return eventWinePhotoRelation;
            // await this.batchInsertRelation('event_photo', eventWinePhotoRelation);
            // await this.batchInsertRelation('event_wine_photo', eventWinePhotoRelation);
        } catch (err) {
            console.log(err);
            return { err: 'fucked' };
        }
    }

    async uploadPhotos(files, folder) {
        let photoPaths = [];
        for (const photo of files) {
            let fileName = __dirname + `${folder}/${new Date().getTime()}.jpg`;
            await writeFileAsync(fileName, photo.buffer, 'binary');
            photoPaths.push(fileName);
            console.log('saved ', fileName);
        }
        return photoPaths;
    }

    insertEvent(req) {
        let event = {
            event_title: req.title,
            event_date: req.date,
            description: req.description,
            participant: req.participant,
        }
        return 1;
        // return this.knex('event').insert(event).returning('event_id');
    }

    batchInsertRelation(table, relation) {
        return knex(table).batchInsert(relation)
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