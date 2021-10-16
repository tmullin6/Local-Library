const mongoose = require('mongoose');

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
AuthorSchema
.virtual('name')
.get(()=>{
    return `${this.first_name}, ${this.last_name}`
});

//Set up virtual to get Author's life span
AuthorSchema
.virtual('lifespan')
.get(()=>{
    let lifespanString='';

    if(this.date_of_birth){
        lifespanString = DateTime.fromJSDate(this.date_of_birth).toLocaleString(DateTime.DATE_MED);
    }

    lifespanString+='-';

    if(this.date_of_death){
        lifespanString+=DateTime.fromJSDate(this.date_of_death).toLocaleString(DATE_MED);
    }

    return lifespanString;
})

//Set up virtual for Author's url
AuthorSchema
.virtual('url')
.get(()=>{
    return `/catalog/author/${this._id}`;
})

module.exports= mongoose.model('Author',AuthorSchema);