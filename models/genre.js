const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const GenreSchema = new Schema (
    {
        name: {type: String, minLength: 3, maxLength: 100, required: true}
    }
)

//Set up virtual for Genre URL
GenreSchema
.virtual('url')
.get(()=>{
    return `catalog/genre/${this._id}`;
});

module.exports=mongoose.model("Genre",GenreSchema);