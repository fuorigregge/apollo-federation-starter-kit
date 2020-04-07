const { mongoId } = require('@ruzz/service-utils')

const itemRepo = ({ itemModel, authContext }) => {

    const getItemById = async id => await itemModel.findOne({ _id: id })
    const getItems = async () => await itemModel.find({})
    const getItemsByUserId = async userId => await itemModel.find({ user_id: userId });

    const createItem = async item => {

        const doc = new itemModel({
            _id: mongoId(),
            name: item.name,
            description: item.description,
            user_id: authContext.userId(),
            created_at: Date.now()
        })

        return await doc.save();
    }

    return Object.create({
        getItemById,
        getItemsByUserId,
        getItems,
        createItem
    })
}

module.exports = itemRepo;

