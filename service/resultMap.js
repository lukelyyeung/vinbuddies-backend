const map = [
    {
        mapId: 'questionMap',
        idProperty: 'question_id',
        properties: ['text', 'expired'],
        collections: [
            { name: 'options', mapId: 'optionMap'}
        ]
    },
    {
        mapId: 'optionMap',
        idProperty: 'option_id',
        properties: ['text', 'expired', 'implication'],
        collections: ['metaId', 'metaTags']
    },
    {
        mapId: 'questionHistoryMap',
        idProperty: ['question_id', 'updated_at'],
        properties: ['text', 'expired'],
        collections: [
            {name: 'choices', mapId: 'optionMap'}
        ]
    },
    {
        mapId: 'eventMap',
        idProperty: 'event_id',
        properties: ['event_title', 'description', 'date', 'deleted'],
        collections: [
            {name: 'gallery', mapId: 'galleryMap', columnPrefix: 'gallery'},
            {name: 'wine', mapId: 'wineMap', columnPrefix: 'wine'},
            {name: 'tags', mapId: 'tagMap', columnPrefix: 'tag'},
            {name: 'participants', mapId: 'participantMap', columnPrefix: 'participant'},
            {name: 'creator', mapId: 'creatorMap', columnPrefix: 'creator'},
        ]
    },
    {
        mapId:'galleryMap',
        idProperty: 'photo_path'
    },
    {
        mapId:'wineMap',
        idProperty: 'photo_path',
        properties: ['wine_id', 'wine_name']
    },
    {
        mapId:'tagMap',
        idProperty: 'tag_id',
        properties: ['tag_name']
    },
    {
        mapId:'creatorMap',
        idProperty: 'creator_id',
        properties: ['username', 'picture']
    },
    {
        mapId:'participantMap',
        idProperty: 'participant_id',
        properties: ['username', 'picture']
    },

];

module.exports = map;