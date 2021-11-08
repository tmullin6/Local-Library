const mongoose = require('mongoose');
const {DateTime} = require("luxon");

const Schema = mongoose.Schema;

const AuthorSchema = new Schema(
    {
        first_name: {type: String, required: true, maxLength: 100},
        last_name: {type: String, required: true, maxLength: 100},
        date_of_birth: {type: Date},
        date_of_death: {type: Date}    
    }
);

//Set up virtual to get Author's full name
AuthorSchema.virtual('name').get(function(){
    return this.last_name + ", " + this.first_name;
});

//Set up virtual to get Author's life span
AuthorSchema.virtual('lifespan').get(function(){
    let lifespanString='';

    if(this.date_of_birth){
        lifespanString = DateTime.fromJSDate(this.date_of_birth).toLocaleString(DateTime.DATE_MED);
    }

    lifespanString+='-';

    if(this.date_of_death){
        lifespanString+=DateTime.fromJSDate(this.date_of_death).toLocaleString(DateTime.DATE_MED);
    }

    return lifespanString;
});

AuthorSchema.virtual('formattedBirthDate').get(function(){
     let formattedBirthDate=DateTime.fromJSDate(this.date_of_birth).toFormat('yyyy-MM-dd');
    return formattedBirthDate;
});

AuthorSchema.virtual('formattedDeathDate').get(function(){
    let formattedDeathDate=DateTime.fromJSDate(this.date_of_death).toFormat('yyyy-MM-dd');
   return formattedDeathDate;
});

//Set up virtual for Author's url
AuthorSchema.virtual('url').get(function(){
    return "/catalog/author/"+this._id;
})

module.exports= mongoose.model('Author',AuthorSchema);