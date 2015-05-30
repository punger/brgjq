/**
 * Helps displaying related items and driving their lists
 * @type {{boardgamecategory: {listtype: string, relatedprompt: string, relatedtitle: string}, boardgamemechanic: {listtype: string, relatedprompt: string, relatedtitle: string}, boardgameexpansion: {listtype: string, relatedprompt: string, relatedtitle: string, renameoninbound: string}, boardgame: {listtype: string, relatedprompt: string, relatedtitle: string}, boardgamedesigner: {listtype: string, relatedprompt: string, relatedtitle: string}, boardgameartist: {listtype: string, relatedprompt: string, relatedtitle: string}, boardgamefamily: {listtype: string, relatedprompt: string, relatedtitle: string}, boardgameimplbase: {listtype: string, relatedprompt: string, relatedtitle: string}, boardgameimplementation: {listtype: string, relatedprompt: string, relatedtitle: string, renameoninbound: string}, boardgamecompilation: {listtype: string, relatedprompt: string, relatedtitle: string, renameoninbound: string}, boardgamecompilationgroup: {listtype: string, relatedprompt: string, relatedtitle: string}, boardgameintegration: {listtype: string, relatedprompt: string, relatedtitle: string}}}
 */
var relateditemmap = {
    "boardgamecategory": {
        "listtype": "family",
        "relatedprompt" : 'In the category: ',
        "relatedtitle" : 'Category '
    },
    "boardgamemechanic": {
        "listtype": "family",
        "relatedprompt" : 'Using the mechanic: ',
        "relatedtitle" : 'Mechanic '
    },
    "boardgameexpansion": {
        "listtype": "none",
        "relatedprompt" : 'Expanded by: ',
        "relatedtitle" : '',
        "renameoninbound": "boardgame"
    },
    "boardgame": {
        "listtype": "none",
        "relatedprompt" : 'Expands: ',
        "relatedtitle" : ''
    },
    "boardgamedesigner": {
        "listtype": "person",
        "relatedprompt" : 'Designed by: ',
        "relatedtitle" : 'Designer '
    },
    "boardgameartist": {
        "listtype": "person",
        "relatedprompt" : 'Art by: ',
        "relatedtitle" : 'Artist '
    },
    "boardgamefamily": {
        "listtype": "family",
        "relatedprompt" : 'In the family: ',
        "relatedtitle" : 'Family '
    },
    "boardgameimplbase": {
        "listtype": "none",
        "relatedprompt" : 'Reimplements: ',
        "relatedtitle" : 'Reimplementing '
    },
    "boardgameimplementation": {
        "listtype": "none",
        "relatedprompt" : 'Is implemented by: ',
        "relatedtitle" : 'Implemented by ',
        "renameoninbound": "boardgameimplbase"
    },
    "boardgamecompilation": {
        "listtype": "none",
        "relatedprompt" : 'Is contained in: ',
        "relatedtitle" : 'In ',
        "renameoninbound": "boardgamecompilationgroup"
    },
    "boardgamecompilationgroup": {
        "listtype": "none",
        "relatedprompt" : 'Contains: ',
        "relatedtitle" : 'Containing '
    },
    "boardgameintegration": {
        "listtype": "none",
        "relatedprompt" : 'Integrates: ',
        "relatedtitle" : 'Integrating'
    }


};
