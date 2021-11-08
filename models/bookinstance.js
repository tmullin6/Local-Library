const mongoose = require('mongoose');
const {DateTime} = require('luxon');

const Schema = mongoose.Schema;

const BookInstanceSchema = new Schema (
    {
        book: {type: Schema.Types.ObjectId, ref:'Book', required:true},
        imprint: {type: String, required: true},
        status: {type: String, required: true, 
            enum: ['Available', 'Maintenance', 'Loaned', 'Reserved'], default: 'Maintenance'},
        due_back: {type: Date, default: Date.now()}
    }
);

//Formatted Due Date with Luxon
BookInstanceSchema.virtual('formatted_due_date').get(function(){
    return DateTime.fromJSDate(this.due_back).toLocaleString(DateTime.DATE_MED);
});

BookInstanceSchema.virtual('due_back_form').get(function(){
    let formatted_due_back=DateTime.fromJSDate(this.due_back).toFormat('yyyy-MM-dd');
   return formatted_due_back;
});

//Virtual for Book Instance URL
BookInstanceSchema.virtual('url').get(function(){
    return '/catalog/bookinstance/'+this._id;
});

module.exports=mongoose.model('BookInstance',BookInstanceSchema);