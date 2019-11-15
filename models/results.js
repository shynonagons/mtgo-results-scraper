const mongoose = require('mongoose');
const cardTypes = require('../lib/cardTypes');
const { Schema } = mongoose;

const list = {};

cardTypes.forEach(type => (list[type] = [{ qty: Number, name: String }]));

const Results = new Schema(
    {
        hash: String,
        date: String,
        format: String,
        type: String,
        decklists: [
            {
                owner: String,
                list,
            },
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model('Results', Results);
