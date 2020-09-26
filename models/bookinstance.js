var mongoose = require('mongoose');
var moment = require('moment');

var Schema = mongoose.Schema;

var BookInstanceSchema = new Schema(
    {
        book: {type: Schema.Types.ObjectId, ref: 'Book', required: true},
        imprint: {type: String, required: true},
        status: {type: String, required: true, enum: ['Available', 'Maintenance', 'Loaned', 'Reserved'], default: 'Maintenance'},
        due_back: {type: Date, default: Date.now},
    }
);

// Virtual for bookinstance's URL
BookInstanceSchema.virtual('url').get(function() {
    return '/catalog/bookinstance/' + this._id;
});

// Virtual for formatted date
BookInstanceSchema.virtual('due_back_formatted')
.get(function() {
    return moment(this.due_back).format('MMMM Do, YYYY');
});

// Export model
module.exports = mongoose.model('BookInstance', BookInstanceSchema);