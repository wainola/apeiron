module.exports = class Address{
    constructor(){
        this.attributes = new Set().add('id').add('address').add('lat').add('long')
    }

    async insert(params){
        return params
    }

    async update(params, id){
        return params
    }

    async delete(id){
        return id
    }

    async get(params, id){
        return params
    }
}