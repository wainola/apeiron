module.exports = class Customer {
    constructor(){
        this.attributes = new Set().add('id').add('name').add('lastname').add('PDI')
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