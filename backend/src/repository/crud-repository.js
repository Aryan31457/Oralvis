class CrudRepository {
    constructor(model) {
        this.model = model;
    }

    async create(data) {
        try {
            const creation = await this.model.create(data);
            return creation;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async getAll() {
        try {
            const gettingAll = await this.model.find({});
            return gettingAll;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async getById(id) {
        try {
            console.log(id);
            const getparticularbyid = await this.model.findById(id);
            console.log(getparticularbyid);
            return getparticularbyid;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async findByIdandUpdate(id, data) {
        try {
            const idupdate = await this.model.findByIdAndUpdate(id, data);
            return idupdate;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async findByIdandDelete(id) {
        try {
            const deleteid = await this.model.findByIdAndDelete(id);
            return deleteid;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

}


export default CrudRepository;