module.exports = class Invoice{
    constructor(){
        this.attributes = new Set().add('id').add('num_order').add('client_id').add('amount')
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